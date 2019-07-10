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
  },
  afterConstruct: function (self) {
    self.pushAssets();
  }
};
