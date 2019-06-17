apos.utils.widgetPlayers['apostrophe-forms'] = function (el, data, options) {
  var form = el.querySelector('[data-apos-forms-form]');
  var recaptchaInput;

  if (form) {
    form.addEventListener('submit', submit);

    if (form.querySelector('[data-apos-recaptcha]')) {
      recaptchaInput = el.querySelector('[data-apos-recaptcha]');
      window.setToken = setToken;
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

    if (recaptchaInput && !recaptchaInput.value) {
      apos.utils.addClass(recaptchaError, 'apos-forms-visible');
      return;
    } else if (recaptchaInput) {
      apos.utils.removeClass(recaptchaError, 'apos-forms-visible');
      event.input.recaptcha = recaptchaInput.value;
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
      var field = form.querySelector('[name=' + error.field + ']');
      var label = form.querySelector('[data-apos-input-message=' + error.field + ']');
      apos.utils.addClass(field, 'apos-forms-input-error');
      label.innerText = error.errorMessage;
      label.hidden = false;
      apos.utils.addClass(label, 'apos-forms-error');
    });
  }

  function setToken(token) {
    recaptchaInput.value = token;
  }
};
