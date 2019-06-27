module.exports = function (self, options) {
  self.processQueryParams = function (req, form, input, output) {
    if (!input.queryParams ||
      (typeof input.queryParams !== 'object')) {
      output.queryParams = null;
      return;
    }

    if (Array.isArray(form.queryParamList) && form.queryParamList.length > 0) {
      form.queryParamList.forEach(param => {
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
