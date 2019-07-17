apos.utils.widgetPlayers['apostrophe-forms-checkboxes-field'] = function(el, data, options) {
  var formsWidget = apos.utils.closest(el, '[data-apos-widget="apostrophe-forms"]');
  if (!formsWidget) {
    // Editing the form in the piece modal, it is not active for submissions
    return;
  }

  var allInputs = el.querySelectorAll('input[type="checkbox"]');
  var inputName = allInputs[0].getAttribute('name');

  formsWidget.addEventListener('apos-forms-validate', function(event) {
    var checkedInputs = el.querySelectorAll('input[type="checkbox"]:checked');

    if (checkedInputs.length === 0) { return; }

    var inputsArray = Array.prototype.slice.call(checkedInputs);

    event.input[inputName] = inputsArray.map(function(input) {
      return input.value;
    });
  });

  var conditionalGroups = formsWidget.querySelectorAll('[data-apos-form-condition=' + inputName + ']');

  if (conditionalGroups.length > 0) {
    var check = apos.aposForms.checkConditional;
    var checkedInputs = el.querySelectorAll('input[type="checkbox"]:checked');
    var allValues = Array.prototype.slice.call(allInputs).map(function(input) {
      return input.value;
    });

    if (checkedInputs.length > 0) {
      checkedInputs = Array.prototype.slice.call(checkedInputs);

      checkedInputs.forEach(function (input) {
        check(conditionalGroups, input, allValues);
      });
    }

    Array.prototype.forEach.call(allInputs, function (input) {
      input.addEventListener('change', function (e) {
        check(conditionalGroups, e.target, allValues);
      });
    });
  }
};
