module.exports = {
  extend: 'apostrophe-forms-base-field-widgets',
  label: 'Boolean/Opt-in Input',
  addFields: [
    {
      name: 'checked',
      label: 'Default to Pre-Checked',
      help: 'If "yes," the checkbox will start in the checked state.',
      type: 'boolean'
    }
  ],
  construct: function (self, options) {
    self.pushAsset('script', 'lean', { when: 'lean' });
    self.sanitizeFormField = function (req, widget, input, output) {
      output[widget.fieldName] = self.apos.launder.boolean(input[widget.fieldName]);
    };
  }
};
