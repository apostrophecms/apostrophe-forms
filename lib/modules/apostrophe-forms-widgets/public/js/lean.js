/* global grecaptcha */
apos.utils.widgetPlayers['apostrophe-forms'] = function (el, data, options) {
  var form = el.querySelector('[data-apos-forms-form]');
  var recaptchaSlot;

  if (form) {
    form.addEventListener('submit', submit);

    if (form.querySelector('[data-apos-recaptcha-slot]')) {
      recaptchaSlot = el.querySelector('[data-apos-recaptcha-slot]');
      window.renderCaptchas = renderCaptchas;
      addRecaptchaScript();
    }
  }

  function submit(event) {
    event.preventDefault();

    if (form.querySelector('[data-apos-forms-busy]')) {
      return setTimeout(function() {
        submit(event);
      }, 100);
    }

    // Deprecated, but IE-compatible, way to make an event
    event = document.createEvent('Event');
    event.initEvent('apos-forms-validate', true, true);
    event.input = {
      _id: form.getAttribute('data-apos-forms-form')
    };
    el.dispatchEvent(event);
    if (el.querySelector('[data-apos-forms-error]')) {
      return;
    }

    var recaptchaError = el.querySelector('[data-apos-forms-recaptcha-error]');

    if (recaptchaSlot) {
      const token = grecaptcha.getResponse(recaptchaSlot.getAttribute('data-apos-recaptcha-id'));
      if (!token) {
        apos.utils.addClass(recaptchaError, 'apos-forms-visible');
        return;
      }

      apos.utils.removeClass(recaptchaError, 'apos-forms-visible');
      event.input.recaptcha = token;
    }

    // For resubmissions
    var error = el.querySelector('[data-apos-forms-submit-error]');
    var spinner = el.querySelector('[data-apos-forms-spinner]');
    var thankYou = el.querySelector('[data-apos-forms-thank-you]');
    apos.utils.removeClass(error, 'apos-forms-visible');
    apos.utils.addClass(spinner, 'apos-forms-visible');

    return apos.utils.post('/modules/apostrophe-forms/submit', event.input, function (err, res) {
      apos.utils.removeClass(spinner, 'apos-forms-visible');
      if (err || (res && (res.status !== 'ok'))) {
        apos.utils.addClass(error, 'apos-forms-visible');
        highlightErrors(res);
      } else {
        apos.utils.addClass(thankYou, 'apos-forms-visible');
        apos.utils.addClass(form, 'apos-forms-hidden');
      }
    });
  }

  function highlightErrors(res) {
    if (!res || !res.formErrors) { return; }

    var globalError = el.querySelector('[data-apos-forms-global-error]');
    var errors = res.formErrors;
    globalError.innerText = '';

    errors.forEach(function (error) {
      if (error.global) {
        globalError.innerText = globalError.innerText + ' ' +
          error.errorMessage;

        return;
      }
      var fields = form.querySelectorAll('[name=' + error.field + ']');
      var labelMessage = form.querySelector('[data-apos-input-message=' + error.field + ']');

      fields.forEach(function (field) {
        apos.utils.addClass(field, 'apos-forms-input-error');
      });

      apos.utils.addClass(labelMessage, 'apos-forms-error');
      labelMessage.innerText = error.errorMessage;
      labelMessage.hidden = false;
    });
  }

  function addRecaptchaScript () {
    if (document.querySelector('[data-apos-recaptcha-script]')) {
      return;
    }

    var refreshable = document.querySelector('[data-apos-refreshable]');
    var recaptchaScript = document.createElement("script");
    recaptchaScript.src = "https://www.google.com/recaptcha/api.js?onload=renderCaptchas&render=explicit";
    recaptchaScript.setAttribute('data-apos-recaptcha-script', '');
    recaptchaScript.setAttribute('async', '');
    recaptchaScript.setAttribute('defer', '');
    refreshable.appendChild(recaptchaScript);
  }

  function renderCaptchas () {
    const recaptchaSlots = document.querySelectorAll('[data-apos-recaptcha-slot]');

    recaptchaSlots.forEach(function(slot) {
      var slotId = grecaptcha.render(
        'aposRecaptcha' + slot.getAttribute('data-apos-recaptcha-slot'),
        {
          sitekey: slot.getAttribute('data-apos-recaptcha-sitekey')
        }
      );

      slot.setAttribute('data-apos-recaptcha-id', slotId);
    });
  }
};
