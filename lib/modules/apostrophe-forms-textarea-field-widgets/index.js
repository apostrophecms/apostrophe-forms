module.exports = {
  extend: 'apostrophe-forms-base-field-widgets',
  label: 'Text Area Input',
  addFields: [
    {
      name: 'fieldPlaceholder',
      label: 'Field Placeholder',
      type: 'string'
    }
  ],
  construct: function(self, options) {
    self.sanitizeFormField = function(req, form, widget, input, output) {
      output[widget.fieldName] = self.apos.launder.string(input[widget.fieldName]);
    };
  }
};
