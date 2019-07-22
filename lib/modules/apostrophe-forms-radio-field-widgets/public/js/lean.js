apos.utils.widgetPlayers['apostrophe-forms-radio-field'] = function(el, data, options) {
  var formsWidget = apos.utils.closest(el, '[data-apos-widget="apostrophe-forms"]');
  var inputs = el.querySelectorAll('input[type="radio"]');

  if (!formsWidget || inputs.length === 0) {
    // Editing the form in the piece modal, it is not active for submissions
    return;
  }

  var inputName = inputs[0].getAttribute('name');

  formsWidget.addEventListener('apos-forms-validate', function(event) {
    var checked = el.querySelector('input[type="radio"]:checked');

    if (!checked) {
      return;
    }

    event.input[inputName] = checked.value;
  });

  var conditionalGroups = formsWidget.querySelectorAll('[data-apos-form-condition=' + inputName + ']');

  if (conditionalGroups.length > 0) {
    var input = el.querySelector('input[type="radio"]:checked');

    var check = apos.aposForms.checkConditional;
    check(conditionalGroups, input);

    Array.prototype.forEach.call(inputs, function (radio) {
      radio.addEventListener('change', function (e) {
        check(conditionalGroups, e.target);
      });
    });
  }
};
