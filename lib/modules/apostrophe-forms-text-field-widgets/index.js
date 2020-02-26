module.exports = {
  extend: 'apostrophe-forms-base-field-widgets',
  label: 'Text Input',
  addFields: [
    {
      name: 'placeholder',
      label: 'Placeholder',
      type: 'string',
      help: "Text to display in the field before someone uses it (e.g., to provide additional directions)."
    },
    {
      name: 'inputType',
      label: 'Input Type',
      type: 'select',
      help: 'You should choose the type of field that is going to be, like an email, a simple text...',
      choices: [
        {
          label: 'Text',
          value: 'text'
        },
        {
          label: 'Password',
          value: 'password'
        },
        {
          label: 'Email',
          value: 'email'
        },
        {
          label: 'Telephone',
          value: 'tel'
        },
        {
          label: 'Url',
          value: 'url'
        }
      ],
      def: 'text'
    }
  ],
  construct: function(self, options) {
    options.arrangeFields = options.arrangeFields.map(group => {
      if (group.name === 'settings') {
        group.fields.push('inputType');
        group.fields.push('placeholder');
      }

      return group;
    });

    self.sanitizeFormField = function(req, form, widget, input, output) {
      output[widget.fieldName] = self.apos.launder.string(input[widget.fieldName]);
    };
  }
};
