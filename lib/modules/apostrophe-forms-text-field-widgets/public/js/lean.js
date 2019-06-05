apos.utils.widgetPlayers['apostrophe-forms-text-field'] = function(el, data, options) {
  var form = apos.utils.closest(el, '[data-apos-widget="apostrophe-forms"]');
  form.addEventHandler('sanitize', function(event) {
    event.input[el.getAttribute('data-apos-forms-name')] = el.querySelector('input').value;
  });
};
