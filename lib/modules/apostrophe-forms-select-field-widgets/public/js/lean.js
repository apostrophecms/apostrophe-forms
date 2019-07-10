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

  const conditionalGroups = formsWidget.querySelectorAll('[data-apos-form-condition=' + inputName + ']');
  if (conditionalGroups.length > 0) {
    checkConditional(conditionalGroups);

    input.addEventListener('change', function () {
      checkConditional(conditionalGroups);
    });
  }

  function checkConditional(groups) {
    Array.prototype.slice.call(conditionalGroups).forEach(function (group) {
      if (input.value === group.getAttribute('data-apos-form-condition-value')) {
        group.classList.add('apos-is-visible');
      } else {
        group.classList.remove('apos-is-visible');
      }
    });
  }
};
