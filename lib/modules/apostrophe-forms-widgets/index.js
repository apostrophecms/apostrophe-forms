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
  construct: function (self, options) {
    const superPushAssets = self.pushAssets;
    self.pushAssets = function () {
      self.pushAsset('script', 'lean', { when: 'lean' });
      superPushAssets();
    };
  },
  afterConstruct: function (self) {
    self.pushAssets();
  }
};
