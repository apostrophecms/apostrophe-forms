module.exports = {
  extend: 'apostrophe-widgets',
  label: 'Form',
  addFields: [
    {
      name: '_form',
      label: 'Form to Display',
      type: 'joinByOne',
      withType: 'apostrophe-forms',
      required: true
    }
  ],
  arrangeFields: [
    {
      name: 'form',
      label: 'Form',
      fields: ['_form']
    }
  ],
  construct: function (self, options) {
    const superPushAssets = self.pushAssets;
    self.pushAssets = function () {
      self.pushAsset('script', 'lean', { when: 'lean' });

      if (options.disableBaseStyles !== true) {
        self.pushAsset('stylesheet', 'forms', { when: 'lean' });
      }

      superPushAssets();
    };

    const superLoad = self.load;
    const forms = self.apos.modules['apostrophe-forms'];
    const classPrefix = forms.options.classPrefix ? forms.options.classPrefix : null;

    self.load = (req, widgets, callback) => {
      widgets.forEach(widget => {
        if (classPrefix) {
          widget.classPrefix = classPrefix;
        }
      });
      return superLoad(req, widgets, callback);
    };
  },
  afterConstruct: function (self) {
    self.pushAssets();
  }
};
