module.exports = {
  extend: 'apostrophe-forms-base-field-widgets',
  label: 'Checkbox Input',
  addFields: [
    {
      name: 'options',
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
          required: true,
          help: 'The value saved (as text) in the database.'
        }
      ]
    }
  ],
  construct: function (self, options) {
    self.pushAsset('script', 'lean', { when: 'lean' });
    self.sanitizeFormField = async function (req, form, widget, input, output) {
      // Get the options from that form for the widget
      const choices = getOptions(findWidget(form, widget._id));

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

    function findWidget(form, id) {
      let widget;

      self.apos.areas.walk({
        contents: form.contents
      }, function (area) {
        const selectWidget = area.items.find(obj => {
          return obj._id === id;
        });
        widget = selectWidget || widget;
      });

      return widget;
    }

    function getOptions(widget) {
      if (!widget || !widget.options) { return []; }

      return widget.options.map(option => {
        return option.value;
      });
    }
  }
};
