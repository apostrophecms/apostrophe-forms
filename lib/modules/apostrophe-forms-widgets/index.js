module.exports = {
  extend: 'apostrophe-widgets',
  label: 'Form',
  addFields: [
    {
      name: '_form',
      label: 'Form to Display',
      type: 'joinByOne',
      withType: 'apostrophe-forms',
      // filters: {
      //   projection: {
      //     _url: 1,
      //     slug: 1,
      //     title: 1,
      //     type: 1
      //   }
      // }
      required: true
    }
  ]
};
