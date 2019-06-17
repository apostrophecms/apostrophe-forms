module.exports = {
  extend: 'apostrophe-forms-base-field-widgets',
  label: 'Select Input',
  addFields: [
    {
      name: 'choices',
      label: 'Select Input Options',
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
    }
  ],
  construct: function(self, options) {
    self.sanitizeFormField = async function(req, form, widget, input, output) {
      // Get the options from that form for the widget
      const choices = self.getChoices(await self.findWidget(req, widget, form));

      output[widget.fieldName] = self.apos.launder.select(input[widget.fieldName], choices);
    };
  }
};
