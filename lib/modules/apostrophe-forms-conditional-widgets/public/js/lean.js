apos.aposForms = apos.aposForms || {};
apos.aposForms.checkConditional = function (groups = [], input) {
  if (!input) {
    return;
  }

  Array.prototype.slice.call(groups).forEach(function (fieldSet) {
    if (input.value === fieldSet.getAttribute('data-apos-form-condition-value')) {
      fieldSet.removeAttribute('disabled');
    } else {
      fieldSet.setAttribute('disabled', true);
    }
  });
};
