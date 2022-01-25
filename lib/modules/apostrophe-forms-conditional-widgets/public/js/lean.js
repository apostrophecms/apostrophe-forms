apos.aposForms = apos.aposForms || {};

apos.aposForms.checkConditional = function (groups, input) {
  if (!groups) {
    groups = [];
  }

  if (!input) {
    return;
  }

  Array.prototype.slice.call(groups).forEach(function (fieldSet) {
    var conditionValue = fieldSet.getAttribute('data-apos-form-condition-value');
    var activate = true;

    if (input.type === 'checkbox' && input.value !== conditionValue) {
      return;
    }

    if (input.type === 'checkbox' && !input.checked) {
      activate = false;
    }

    var conditionCommaArray = conditionValue.split(',');

    var inputMatchesCondition = false;
    if (conditionCommaArray.indexOf(input.value) > -1) {
      inputMatchesCondition = true;
    }

    if (inputMatchesCondition || (input.value === conditionValue && activate)) {
      fieldSet.removeAttribute('disabled');
    } else {
      fieldSet.setAttribute('disabled', true);
    }
  });
};
