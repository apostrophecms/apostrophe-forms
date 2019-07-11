apos.aposForms = apos.aposForms || {};
apos.aposForms.checkConditional = function (groups = [], input) {
  if (!input) {
    return;
  }

  Array.prototype.slice.call(groups).forEach(function (fieldSet) {
    var activate = true;

    if (input.type === 'checkbox' && !input.checked) {
      activate = false;
    }

    var conditionValue = fieldSet.getAttribute('data-apos-form-condition-value');

    if (input.value === conditionValue && activate) {
      fieldSet.removeAttribute('disabled');
    } else {
      fieldSet.setAttribute('disabled', true);
    }
  });
};
