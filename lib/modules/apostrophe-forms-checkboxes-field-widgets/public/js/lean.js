apos.utils.widgetPlayers['apostrophe-forms-checkboxes-field'] = function(el, data, options) {
  var formsWidget = apos.utils.closest(el, '[data-apos-widget="apostrophe-forms"]');
  if (!formsWidget) {
    // Editing the form in the piece modal, it is not active for submissions
    return;
  }
  formsWidget.addEventListener('apos-forms-validate', function(event) {
    var inputs = el.querySelectorAll('input[type="checkbox"]:checked');
    var inputName = inputs[0].getAttribute('name');
    event.input[inputName] = Array.from(inputs).map(input => {
      return input.value;
    });
  });
};
