module.exports = {
  extend: 'apostrophe-widgets',
  label: 'Conditional field group',
  beforeConstruct: function (self, options) {
    options.addFields = [
      {
        name: 'conditionName',
        label: 'Form field to check to show this group.',
        htmlHelp: 'Enter the "Field Name" value for a <strong>select, radio, or boolean</strong> form field.',
        required: true,
        type: 'string'
      },
      {
        name: 'conditionValue',
        label: 'Value to check for to show this group.',
        htmlHelp: 'If using a <strong>boolean/opt-in field</strong>, set this to "true".',
        required: true,
        type: 'string'
      },
      {
        name: 'contents',
        label: 'Form Contents',
        type: 'area',
        contextual: false,
        options: {
          widgets: {}
        }
      }
    ].concat(options.addFields || []);
  },
  construct: function (self, options) {
    self.pushAsset('script', 'lean', { when: 'lean' });

    const forms = self.apos.modules['apostrophe-forms'];
    const formWidgets = Object.assign({}, forms.options.addFields.find(field => {
      return field.name === 'contents';
    }).options.widgets);

    delete formWidgets['apostrophe-forms-conditional'];

    options.addFields = options.addFields.map(field => {
      if (field.name === 'contents') {
        field.options.widgets = formWidgets;
      }

      return field;
    });

    const superLoad = self.load;
    const classPrefix = forms.options.classPrefix;

    if (classPrefix) {
      self.load = (req, widgets, callback) => {
        widgets.forEach(widget => {
          widget.classPrefix = classPrefix;
        });
        return superLoad(req, widgets, callback);
      };
    }
  }
};
