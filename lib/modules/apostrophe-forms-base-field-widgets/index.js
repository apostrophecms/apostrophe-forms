module.exports = {
  extend: 'apostrophe-widgets',
  label: 'Form base widget',
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
  },
  construct: function (self, options) {
    self.pushAsset('script', 'lean', { when: 'lean' });

    const superSanitize = self.sanitize;
    self.sanitize = function (req, input, callback) {
      if (!input.fieldName) {
        input.fieldName = self.apos.utils.slugify(input.fieldLabel);
      }

      // If no option value entered, use the option label for the value.
      if (input.choices) {
        input.choices.forEach(choice => {
          if (!choice.value) {
            choice.value = choice.label;
          }
        });
      }

      return superSanitize(req, input, callback);
    };

    self.checkRequired = async function (req, widget, input) {
      const aposForms = self.apos.modules['apostrophe-forms'];
      const form = await aposForms.find(req, {
        _id: widget.__docId
      }).toObject();

      const widgetObj = self.findWidget(req, widget, form) || {};

      if (widgetObj.required && !input[widget.fieldName]) {
        throw {
          fieldError: {
            field: widget.fieldName,
            error: 'required',
            errorMessage: 'This field is required'
          }
        };
      }
    };

    self.findWidget = function (req, widget, form) {
      let widgetObj;

      self.apos.areas.walk({
        contents: form.contents
      }, function (area) {
        const selectWidget = area.items.find(obj => {
          return obj._id === widget._id;
        });
        widgetObj = selectWidget || widget;
      });

      return widgetObj;
    };

    self.getChoicesValues = function (widget) {
      if (!widget || !widget.choices) { return []; }

      return widget.choices.map(choice => {
        return choice.value;
      });
    };
  }
};
