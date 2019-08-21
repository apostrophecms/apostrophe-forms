module.exports = {
  extend: 'apostrophe-widgets',
  label: 'Form base widget',
  anchors: false, // Disables `apostrophe-anchors` on this widget.
  beforeConstruct: function (self, options) {
    options.addFields = [
      {
        name: 'fieldLabel',
        label: 'Field Label',
        type: 'string',
        required: true
      },
      {
        name: 'fieldName',
        label: 'Field Name',
        type: 'string',
        help: 'No spaces or punctuation other than dashes. If left blank, the form will populate this with a simplified form of the label. Changing this field after a form is in use may cause problems with any integrations.'
      },
      {
        name: 'required',
        label: 'Is this field required?',
        type: 'boolean'
      }
    ].concat(options.addFields || []);

    options.arrangeFields = [
      {
        name: 'settings',
        label: 'Field settings',
        fields: [
          'fieldLabel',
          'fieldName',
          'required'
        ]
      }
    ].concat(options.arrangeFields || []);
  },
  construct: function (self, options) {
    self.pushAsset('script', 'lean', { when: 'lean' });

    const superSanitize = self.sanitize;
    self.sanitize = function (req, input, callback) {
      if (!input.fieldName) {
        input.fieldName = self.apos.utils.slugify(input.fieldLabel);
      }

      // If no option value entered, use the option label for the value.
      if (Array.isArray(input.choices)) {
        input.choices.forEach(choice => {
          if (!choice.value) {
            choice.value = choice.label;
          }
        });
      }

      return superSanitize(req, input, callback);
    };

    // TODO: Revisit if `req` and `form` are still necessary once at v1.0
    self.checkRequired = function (req, form, widget, input) {
      if (widget.required && !input[widget.fieldName]) {
        throw {
          fieldError: {
            field: widget.fieldName,
            error: 'required',
            errorMessage: 'This field is required'
          }
        };
      }
    };

    self.getChoicesValues = function (widget) {
      if (!widget || !widget.choices) { return []; }

      return widget.choices.map(choice => {
        return choice.value;
      });
    };
  }
};
