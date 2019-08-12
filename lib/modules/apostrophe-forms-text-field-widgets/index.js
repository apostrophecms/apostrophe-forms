module.exports = {
  extend: 'apostrophe-forms-base-field-widgets',
  label: 'Text Input',
  addFields: [
    {
      name: 'placeholder',
      label: 'Placeholder',
      type: 'string',
      help: "The string that you introduce into this field will be shown inside the form field."
    }
  ],
  construct: function(self, options) {
    self.sanitizeFormField = function(req, form, widget, input, output) {
      output[widget.fieldName] = self.apos.launder.string(input[widget.fieldName]);
    };
  }
};
