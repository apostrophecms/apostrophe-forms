apos.aposForms = apos.aposForms || {};
apos.aposForms.checkConditional = function (groups = [], input, range) {
  if (!input) {
    return;
  }

  Array.prototype.slice.call(groups).forEach(function (fieldSet) {
    var activate = true;
    var multiValue = false;

    if (input.type === 'checkbox' && !input.checked) {
      activate = false;
    }

    var conditionValue = fieldSet.getAttribute('data-apos-form-condition-value');

    // Check if there are multiple values (e.g., a checkbox series).
    if (Array.isArray(range) && range.length > 1) {
      multiValue = true;
    }

    if (input.value === conditionValue && activate) {
      fieldSet.removeAttribute('disabled');
    } else if (multiValue && input.value === conditionValue && !activate) {
      // If there are multiple values, only disable if the matching fieldSet.
      fieldSet.setAttribute('disabled', true);
    } else if (!multiValue) {
      fieldSet.setAttribute('disabled', true);
    }
  });
};
