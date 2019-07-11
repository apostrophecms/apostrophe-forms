apos.utils.widgetPlayers['apostrophe-forms-boolean-field'] = function(el, data, options) {
  var formsWidget = apos.utils.closest(el, '[data-apos-widget="apostrophe-forms"]');
  if (!formsWidget) {
    // Editing the form in the piece modal, it is not active for submissions
    return;
  }

  var input = el.querySelector('input[type="checkbox"]');
  var inputName = input.getAttribute('name');

  formsWidget.addEventListener('apos-forms-validate', function(event) {

    if (!input) {
      return;
    }

    event.input[inputName] = input.checked;
  });

  var conditionalGroups = formsWidget.querySelectorAll('[data-apos-form-condition=' + inputName + ']');

  if (conditionalGroups.length > 0) {
    var check = apos.aposForms.checkConditional;
    if (input.checked) {
      check(conditionalGroups, input);
    }

    input.addEventListener('change', function (e) {
      check(conditionalGroups, e.target);
    });
  }
};
