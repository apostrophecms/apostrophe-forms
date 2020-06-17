module.exports = {
  extend: 'apostrophe-forms-base-field-widgets',
  label: 'Checkbox Input',
  addFields: [
    {
      name: 'choices',
      label: 'Checkbox Input Options',
      type: 'array',
      titleField: 'label',
      required: true,
      schema: [
        {
          type: 'string',
          name: 'label',
          required: true,
          label: 'Option Label',
          help: 'The readable label displayed to users.'
        },
        {
          type: 'string',
          name: 'value',
          label: 'Option Value',
          help: 'The value saved (as text) in the database. If not entered, the label will be used.'
        }
      ]
    },
    {
      name: 'style',
      label: 'Display Style',
      type: 'select',
      def: 'checkboxes',
      choices: [
        {
          label: 'Inline List of Checkboxes',
          value: 'checkboxes'
        },
        {
          label: 'Dropdown Menu of Checkboxes',
          value: 'dropdown'
        }
      ]
    }
  ],
  construct: function (self, options) {
    const advanced = options.arrangeFields.find(group => group.name === 'advanced');
    if (!advanced) {
      options.arrangeFields.push({
        name: 'advanced',
        label: 'Advanced',
        fields: [ 'style' ]
      });
    } else {
      advanced.fields.push('style');
    }

    self.sanitizeFormField = async function (req, form, widget, input, output) {
      // Get the options from that form for the widget
      const choices = self.getChoicesValues(widget);

      if (!input[widget.fieldName]) {
        output[widget.fieldName] = null;
        return;
      }

      input[widget.fieldName] = Array.isArray(input[widget.fieldName])
        ? input[widget.fieldName] : [];

      // Return an array of selected choices as the output.
      output[widget.fieldName] = input[widget.fieldName]
        .map(choice => {
          return self.apos.launder.select(choice, choices);
        })
        .filter(choice => {
          // Filter out the undefined, laundered out values.
          return choice;
        });
    };
  }
};
