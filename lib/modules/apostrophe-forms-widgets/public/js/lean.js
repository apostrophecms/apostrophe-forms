apos.utils.widgetPlayers['apostrophe-forms'] = function (el, data, options) {
  const form = el.querySelector('[data-apos-form]');

  if (form) {
    form.addEventListener('submit', submit);
  }

  function submit(event) {

    event.preventDefault();
    // Deprecated, but IE-compatible, way to make an event
    event = document.createEvent('Event');
    event.initEvent('apos-forms-validate', true, true);
    event.input = {
      _id: apos.closest(el, '[data-apos-form]').getAttribute('data-apos-form') 
    };
    el.dispatchEvent(event);
    if (el.querySelector('[data-apos-form-error]')) {
      return;
    }
    return apos.utils.post('/modules/apostrophe-forms/submit', event.input, function (err, res) {
      if (err) {
        console.error(err);
      } else {
        console.log('💪', res);
      }
    });

  }

};
