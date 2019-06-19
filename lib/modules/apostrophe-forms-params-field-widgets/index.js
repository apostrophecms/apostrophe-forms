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
    }
  ],
  removeFields: [ 'required' ],
  construct: function(self, options) {
    self.pushAsset('script', 'lean', { when: 'lean' });
    self.sanitizeFormField = async function (req, widget, input, output) {
      if (!input[widget.fieldName] ||
        (typeof input[widget.fieldName] !== 'object')) {
        output[widget.fieldName] = null;
        return;
      }

      if (widget.whitelist) {
        const validParams = {};
        let found = false;

        widget.parameters.forEach(param => {
          if (input[widget.fieldName][param.key]) {
            const value = input[widget.fieldName][param.key];
            validParams[param.key] = self.apos.launder.string(value);
            found = true;
          }
        });

        output[widget.fieldName] = found ? validParams : null;
        return;
      }

      for (var key in input[widget.fieldName]) {
        input[widget.fieldName][key] = self.apos.launder.string(input[widget.fieldName][key]);
      }

      output[widget.fieldName] = input[widget.fieldName];
    };
  }
};
