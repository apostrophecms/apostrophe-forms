apos.utils.widgetPlayers['apostrophe-forms-text-field'] = function(el, data, options) {
  var form = apos.utils.closest(el, '[data-apos-widget="apostrophe-forms"]');
  form.addEventHandler('apos-forms-validate', function(event) {
    var input = el.querySelector('input');
    event.input[input.getAttribute('name')] = input.value;
  });
};
