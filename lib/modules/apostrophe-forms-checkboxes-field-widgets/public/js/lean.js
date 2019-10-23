apos.utils.widgetPlayers['apostrophe-forms-checkboxes-field'] = function(el, data, options) {
  var formsWidget = apos.utils.closest(el, '[data-apos-widget="apostrophe-forms"]');

  if (!formsWidget) {
    // Editing the form in the piece modal, it is not active for submissions
    return;
  }

  formsWidget.addEventListener('apos-forms-validate', function(event) {
    var inputs = el.querySelectorAll('input[type="checkbox"]:checked');

    if (inputs.length === 0) { return; }

    var inputName = inputs[0].getAttribute('name');
    var inputsArray = Array.prototype.slice.call(inputs);

    event.input[inputName] = inputsArray.map(function(input) {
      return input.value;
    });
  });

  var inputs = el.querySelectorAll('input[type="checkbox"]');
  var inputName = inputs[0].getAttribute('name');
  var conditionalGroups = formsWidget.querySelectorAll('[data-apos-form-condition=' + inputName + ']');

  if (conditionalGroups.length > 0) {
    var input = el.querySelector('input[type="checkbox"]:checked');

    var check = apos.aposForms.checkConditional;
    check(conditionalGroups, input);

    Array.prototype.forEach.call(inputs, function (checkbox) {
      checkbox.addEventListener('change', function (e) {
        check(conditionalGroups, e.target);
      });
    });
  }
};
