module.exports = {
  improve: 'apostrophe-schemas',
  construct: function (self, options) {
    console.log(Object.keys(self.apos.modules['apostrophe-schemas']));
  }
};
