module.exports = {
  name: 'apostrophe-forms',
  label: 'Form',
  extend: 'apostrophe-pieces',
  moogBundle: {
    directory: 'lib/modules',
    modules: [
      'apostrophe-forms-widgets',
      'apostrophe-forms-base-widgets',
      'apostrophe-forms-text-widgets'
    ]
  },
  beforeConstruct: function (self, options) {
    options.addFields = [
      {
        name: 'title',
        label: 'Form Name',
        type: 'string',
        sortify: true,
        required: true
      },
      {
        name: 'formContents',
        label: 'Form Contents',
        type: 'area',
        contextual: false,
        options: {
          widgets: options.formWidgets || {
            'apostrophe-forms-text-field': {},
            'apostrophe-rich-text': {
              toolbar: [
                'Styles', 'Bold', 'Italic', 'Link', 'Anchor', 'Unlink',
                'NumberedList', 'BulletedList'
              ]
            }
          }
        }
      },
      {
        name: 'submitLabel',
        label: 'Submit Button Label',
        type: 'string'
      },
      {
        name: 'email',
        type: 'email',
        label: 'Email Address for Results'
      },
      {
        name: 'thankYouHeading',
        label: 'Thank You Message Title',
        type: 'string'
      },
      {
        name: 'thankYouBody',
        label: 'Thank You Message Content',
        type: 'area',
        options: {
          widgets: options.thankYouWidgets || {
            'apostrophe-rich-text': {
              toolbar: [
                'Styles', 'Bold', 'Italic', 'Link', 'Anchor', 'Unlink',
                'NumberedList', 'BulletedList'
              ]
            }
          }
        }
      }
    ].concat(options.addFields || []);

    options.arrangeFields = (options.arrangeFields || []).concat([
      {
        name: 'form',
        label: 'Form',
        fields: ['formContents', 'submitLabel']
      },
      {
        name: 'afterSubmit',
        label: 'After-Submission',
        fields: ['email', 'thankYouHeading', 'thankYouBody']
      }
    ]);
  },
  construct: function(self, options) {
    // Route to accept the submitted form.
    self.route('get', 'submit', (req, res) => {
      console.log(Object.keys(req));
      console.log(req.data);
      // Sanitize data
    });
  }
};
