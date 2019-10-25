module.exports = {
  extend: 'apostrophe-forms-base-field-widgets',
  label: 'Text Input',
  addFields: [
    {
      name: 'placeholder',
      label: 'Placeholder',
      type: 'string',
      help: "Text to display in the field before someone uses it (e.g., to provide additional directions)."
    }
  ],
  construct: function(self, options) {
    options.arrangeFields = options.arrangeFields.map(group => {
      if (group.name === 'settings') {
        group.fields.push('checked');
      }

      return group;
    });

    self.sanitizeFormField = function(req, form, widget, input, output) {
      output[widget.fieldName] = self.apos.launder.string(input[widget.fieldName]);
    };
  }
};
