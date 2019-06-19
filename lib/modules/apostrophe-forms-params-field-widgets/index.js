module.exports = {
  extend: 'apostrophe-forms-base-field-widgets',
  label: 'Hidden Query Parameters Field',
  addFields: [
    {
      name: 'whitelist',
      label: 'Limit Accepted Query Parameters',
      type: 'boolean',
      choices: [
        { label: 'Yes', value: true, showFields: ['parameters'] }
      ]
    },
    {
      name: 'parameters',
      label: 'Query Parameter Keys',
      type: 'array',
      titleField: 'key',
      help: 'Create an array item for each query parameter value you wish to capture.',
      schema: [
        {
          type: 'string',
          name: 'key',
          label: 'Key',
          help: '',
          require: true
        }
      ]
    },
    {
      name: 'limit',
      label: 'Limit Parameter Value Length (characters)',
      type: 'integer',
      min: 1
    }
  ],
  removeFields: [ 'required' ],
  construct: function(self, options) {
    self.pushAsset('script', 'lean', { when: 'lean' });

    self.sanitizeFormField = async function (req, form, widget, input, output) {
      if (!input[widget.fieldName] ||
        (typeof input[widget.fieldName] !== 'object')) {
        output[widget.fieldName] = null;
        return;
      }

      if (widget.whitelist) {
        const validParams = {};
        let found = false;

        widget.parameters.forEach(param => {
          const value = input[widget.fieldName][param.key];
          if (value) {
            validParams[param.key] = tidyValue(widget, value);
            found = true;
          }
        });

        output[widget.fieldName] = found ? validParams : null;
        return;
      }

      for (var key in input[widget.fieldName]) {
        const value = input[widget.fieldName][key];
        input[widget.fieldName][key] = tidyValue(widget, value);
      }

      output[widget.fieldName] = input[widget.fieldName];
    };

    function tidyValue (widget, value) {
      if (widget.limit && widget.limit > 0) {
        value = value.substring(0, (widget.limit));
      }

      return self.apos.launder.string(value);
    }
  }
};
