module.exports = function (self, options) {
  self.processQueryParams = function (req, form, input, output, fieldNames) {
    if (!input.queryParams ||
      (typeof input.queryParams !== 'object')) {
      output.queryParams = null;
      return;
    }

    if (Array.isArray(form.queryParamList) && form.queryParamList.length > 0) {
      form.queryParamList.forEach(param => {
        // Skip if this is an existing field submitted by the form. This value
        // capture will be done by populating the form inputs client-side.
        if (fieldNames.includes(param.key)) {
          return;
        }
        const value = input.queryParams[param.key];

        if (value) {
          output[param.key] = tidyParamValue(param, value);
        } else {
          output[param.key] = null;
        }
      });
    }
  };

  function tidyParamValue(param, value) {
    value = self.apos.launder.string(value);

    if (param.lengthLimit && param.lengthLimit > 0) {
      value = value.substring(0, (param.lengthLimit));
    }

    return value;
  }
};
