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

    // If there are specified query parameters to capture, see if fields can be
    // populated.
    if (form.hasAttribute('data-apos-forms-params')) {
      setParameterValues();
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

    var recaptchaId;
    if (recaptchaSlot) {
      recaptchaId = recaptchaSlot.getAttribute('data-apos-recaptcha-id');
      var token = grecaptcha.getResponse(recaptchaId);

      if (!token) {
        apos.utils.addClass(recaptchaError, 'apos-forms-visible');
        return;
      }

      apos.utils.removeClass(recaptchaError, 'apos-forms-visible');
      event.input.recaptcha = token;
    }

    // For resubmissions
    var errorMsg = el.querySelector('[data-apos-forms-submit-error]');
    var spinner = el.querySelector('[data-apos-forms-spinner]');
    var thankYou = el.querySelector('[data-apos-forms-thank-you]');
    apos.utils.removeClass(errorMsg, 'apos-forms-visible');
    apos.utils.addClass(spinner, 'apos-forms-visible');

    // Convert to arrays old school for IE.
    var existingErrorInputs = Array.prototype.slice.call(el.querySelectorAll('.apos-forms-input-error'));
    var existingErrorMessages = Array.prototype.slice.call(el.querySelectorAll('[data-apos-input-message].apos-forms-error'));

    existingErrorInputs.forEach(function (input) {
      apos.utils.removeClass(input, 'apos-forms-input-error');
    });

    existingErrorMessages.forEach(function (message) {
      apos.utils.removeClass(message, 'apos-forms-error');
      message.hidden = true;
    });

    // Capture query parameters.
    if (form.hasAttribute('data-apos-forms-params')) {
      captureParameters(event);
    }

    return apos.utils.post('/modules/apostrophe-forms/submit', event.input, function (err, res) {
      apos.utils.removeClass(spinner, 'apos-forms-visible');
      if (err || (res && (res.status !== 'ok'))) {
        apos.utils.addClass(errorMsg, 'apos-forms-visible');
        highlightErrors(res);

        if (recaptchaId) {
          grecaptcha.reset(recaptchaId);
        }
      } else {
        apos.utils.addClass(thankYou, 'apos-forms-visible');
        apos.utils.addClass(form, 'apos-forms-hidden');
      }
    });
  }

  function highlightErrors(res) {
    if (!res || !res.formErrors) {
      return;
    }

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
      fields = Array.prototype.slice.call(fields);

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
    var recaptchaSlots = document.querySelectorAll('[data-apos-recaptcha-slot]');

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

  function getParameters () {
    var queryParams = window.location.search.substring(1).split('&');

    var params = {};

    queryParams.forEach(function (string) {
      var pair = string.split("=");

      pair[0] = decodeURIComponent(pair[0]);
      params[pair[0]] = decodeURIComponent(pair[1]);
    });

    return params;
  }

  function setParameterValues () {
    var paramList = form.getAttribute('data-apos-forms-params').split(',');
    var params = getParameters();

    paramList.forEach(function (param) {
      var paramInput = form.querySelector('[name="' + param + '"]');

      if (!params[param]) {
        return;
      }

      // If the input is a checkbox, check all in the comma-separated query
      // parameter value.
      if (paramInput && paramInput.type === 'checkbox') {
        params[param].split(',').forEach(function (value) {
          var checkbox = form.querySelector('[name="' + param + '"][value="' + value + '"]');

          if (checkbox) {
            checkbox.checked = true;
          }
        });
        // If the input is a radio, check the matching input.
      } else if (paramInput && paramInput.type === 'radio') {
        form.querySelector('[name="' + param + '"][value="' + params[param] + '"]').checked = true;
        // If the input is a select field, make sure the value is an option.
      } else if (paramInput && paramInput.type === 'select') {
        if (paramInput.querySelector('option[value="' + params[param] + '"')) {
          paramInput.value = params[param];
        }
        // Otherwise set the input value to the parameter value.
      } else if (paramInput) {
        paramInput.value = params[param];
      }
    });
  }

  function captureParameters (event) {
    event.input.queryParams = getParameters();
  }
};
