module.exports = {
  extend: 'apostrophe-forms-text-field-widgets',
  label: 'Text Area Input',
  construct: function(self, options) {
    self.sanitizeFormField = function(req, form, widget, input, output) {
      output[widget.fieldName] = self.apos.launder.string(input[widget.fieldName]);
    };
  }
};
