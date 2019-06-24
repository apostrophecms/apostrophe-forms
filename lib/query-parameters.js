module.exports = function (self, options) {
  self.processQueryParams = function (req, form, input, output) {
    if (!input.queryParams ||
      (typeof input.queryParams !== 'object')) {
      output.queryParams = null;
      return;
    }

    if (Array.isArray(form.queryParamList) && form.queryParamList.length > 0) {
      const validParams = {};
      let found = false;

      form.queryParamList.forEach(param => {
        const value = input.queryParams[param.key];
        if (value) {
          validParams[param.key] = tidyParamValue(form, value);
          found = true;
        }
      });

      output.queryParams = found ? validParams : null;
      return;
    }

    for (var key in input.queryParams) {
      const value = input.queryParams[key];
      input.queryParams[key] = tidyParamValue(form, value);
    }

    output.queryParams = input.queryParams;
  };

  function tidyParamValue(form, value) {
    value = self.apos.launder.string(value);

    if (form.queryParamLimit && form.queryParamLimit > 0) {
      value = value.substring(0, (form.queryParamLimit));
    }

    return value;
  }
};
