apos.utils.widgetPlayers['apostrophe-forms-select-field'] = function(el, data, options) {
  var formsWidget = apos.utils.closest(el, '[data-apos-widget="apostrophe-forms"]');
  if (!formsWidget) {
    // Editing the form in the piece modal, it is not active for submissions
    return;
  }

  var input = el.querySelector('select');
  var inputName = input.getAttribute('name');

  formsWidget.addEventListener('apos-forms-validate', function(event) {
    event.input[inputName] = input.value;
  });

  var conditionalGroups = formsWidget.querySelectorAll('[data-apos-form-condition=' + inputName + ']');

  if (conditionalGroups.length > 0) {
    const check = apos.aposForms.checkConditional;
    check(conditionalGroups, input);

    input.addEventListener('change', function () {
      check(conditionalGroups, input);
    });
  }
};
