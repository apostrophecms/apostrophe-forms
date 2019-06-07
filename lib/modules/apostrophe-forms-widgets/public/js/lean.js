apos.utils.widgetPlayers['apostrophe-forms'] = function (el, data, options) {
  const form = el.querySelector('[data-apos-forms-form]');

  if (form) {
    form.addEventListener('submit', submit);
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
      } else {
        apos.utils.addClass(thankYou, 'apos-forms-visible');
        apos.utils.addClass(form, 'apos-forms-hidden');
      }
    });

  }

};
