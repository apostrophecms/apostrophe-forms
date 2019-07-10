module.exports = {
  extend: 'apostrophe-widgets',
  label: 'Conditional field group',
  beforeConstruct: function (self, options) {
    options.addFields = [
      {
        name: 'fieldName',
        label: 'Field to trigger this group',
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
    // self.pushAsset('script', 'lean', { when: 'lean' });

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
  }
};
