const request = require('request-promise');

module.exports = {
  name: 'apostrophe-forms',
  label: 'Form',
  extend: 'apostrophe-pieces',
  moogBundle: {
    directory: 'lib/modules',
    modules: [
      'apostrophe-forms-widgets',
      'apostrophe-forms-base-field-widgets',
      'apostrophe-forms-text-field-widgets',
      'apostrophe-forms-select-field-widgets',
      'apostrophe-forms-radio-field-widgets', // Extends apos-forms-select-field
      'apostrophe-forms-checkboxes-field-widgets',
      'apostrophe-forms-textarea-field-widgets',
      'apostrophe-forms-file-field-widgets',
      'apostrophe-forms-boolean-field-widgets'
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
        name: 'contents',
        label: 'Form Contents',
        type: 'area',
        contextual: false,
        options: {
          widgets: options.formWidgets || {
            'apostrophe-forms-text-field': {},
            'apostrophe-forms-textarea-field': {},
            'apostrophe-forms-file-field': {},
            'apostrophe-forms-boolean-field': {},
            'apostrophe-forms-select-field': {},
            'apostrophe-forms-radio-field': {},
            'apostrophe-forms-checkboxes-field': {},
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
      },
      {
        name: 'enableQueryParams',
        label: 'Enable Query Parameter Capture',
        type: 'boolean',
        htmlHelp: 'If enabled, <em>all</em> query parameters (the key/value pairs in a <a href="https://en.wikipedia.org/wiki/Query_string" target="_blank">query string</a>) will be collected when the form is submitted. You may also set list of specific parameter keys that you wish to collect.',
        choices: [
          {
            label: 'Yes',
            value: true,
            showFields: [
              'queryParamList',
              'queryParamLimit'
            ]
          }
        ]
      },
      {
        name: 'queryParamList',
        label: 'Query Parameter Keys',
        type: 'array',
        titleField: 'key',
        required: true,
        help: 'Create an array item for each query parameter value you wish to capture.',
        schema: [
          {
            type: 'string',
            name: 'key',
            label: 'Key',
            required: true
          },
          {
            type: 'integer',
            name: 'lengthLimit',
            label: 'Limit Saved Parameter Value Length (characters)',
            help: 'Enter a whole number to limit the length of the value saved.',
            min: 1
          }
        ]
      }
    ].concat(options.emailSubmissions !== false ? [
      {
        name: 'emails',
        label: 'Email Address(es) for Results',
        type: 'array',
        titleField: 'email',
        schema: [
          {
            name: 'email',
            type: 'email',
            required: true,
            label: 'Email Address for Results'
          }
        ]
      }
    ] : []).concat(options.addFields || []);

    const afterSubmitFields = [
      'thankYouHeading',
      'thankYouBody'
    ].concat(options.emailSubmissions !== false ? ['emails'] : []);

    options.arrangeFields = (options.arrangeFields || []).concat([
      {
        name: 'form',
        label: 'Form',
        fields: [ 'contents', 'submitLabel' ]
      },
      {
        name: 'afterSubmit',
        label: 'After-Submission',
        fields: afterSubmitFields
      },
      {
        name: 'advanced',
        label: 'Advanced',
        fields: [
          'enableQueryParams',
          'queryParamList',
          'queryParamLimit'
        ]
      }
    ]);
  },

  afterConstruct: async function(self, callback) {
    try {
      await self.ensureCollection();
    } catch (e) {
      return callback(e);
    }
    return callback(null);
  },

  construct: function(self, options) {
    require('./lib/query-parameters.js')(self, options);

    self.ensureCollection = async function() {
      self.db = self.apos.db.collection('aposFormSubmissions');
      await self.db.ensureIndex({
        formId: 1,
        createdAt: 1
      });
      await self.db.ensureIndex({
        formId: 1,
        createdAt: -1
      });
    };
    // Route to accept the submitted form.
    self.apiRoute('post', 'submit', async (req, res, next) => {
      const input = req.body;
      const output = {};
      const formErrors = [];
      const overrideOptions = self.apos.modules['apostrophe-override-options'];

      if (overrideOptions) {
        // Make sure we can get reCAPTCHA configurations from the global object
        // with self.getOption if needed.
        overrideOptions.calculateOverrides(req);
      }

      const form = await self.find(req, {
        _id: self.apos.launder.id(req.body._id)
      }).toObject();
      if (!form) {
        return next('notfound');
      }

      try {
        if (input.recaptcha) {
          await self.checkRecaptcha(req, input, formErrors);
        }

        // Recursively walk the area and its sub-areas so we find
        // fields nested in two-column widgets and the like

        // walk is not an async function so build an array of them to start
        const areas = [];
        self.apos.areas.walk({
          contents: form.contents
        }, function(area) {
          areas.push(area);
        });

        const fieldNames = [];

        for (const area of areas) {
          const widgets = area.items || [];
          for (const widget of widgets) {
            // Capture field names.
            fieldNames.push(widget.fieldName);

            const manager = self.apos.areas.getWidgetManager(widget.type);
            if (manager && manager.sanitizeFormField) {

              try {
                manager.checkRequired(req, form, widget, input);
                await manager.sanitizeFormField(req, form, widget, input, output);
              } catch (err) {
                if (err.fieldError) {
                  formErrors.push(err.fieldError);
                } else {
                  throw err;
                }
              }
            }
          }
        }

        if (formErrors.length > 0) {
          return next('error', null, {
            formErrors
          });
        }

        if (form.enableQueryParams) {
          self.processQueryParams(req, form, input, output, fieldNames);
        }

        await self.emit('submission', req, form, output);
      } catch (e) {
        return next(e);
      }

      return next(null);
    });

    self.checkRecaptcha = async function (req, input, formErrors) {
      const recaptchaSecret = self.getOption(req, 'recaptchaSecret');

      try {
        const url = 'https://www.google.com/recaptcha/api/siteverify';
        const recaptchaResponse = JSON.parse(await request({
          method: 'POST',
          uri: `${url}?secret=${recaptchaSecret}&response=${input.recaptcha}`
        }));

        if (!recaptchaResponse.success) {
          formErrors.push({
            global: true,
            error: 'recaptcha',
            errorMessage: 'There was a problem validating your reCAPTCHA verfication submission.'
          });
        }
      } catch (e) {
        formErrors.push({
          global: true,
          error: 'recaptcha',
          errorMessage: 'The reCAPTCHA verification system may be down or incorrectly configured. Please try again later or notify the site owner.'
        });
      }
    };

    self.on('submission', 'emailSubmission', async function(req, form, data) {
      if (self.options.emailSubmissions === false ||
        !form.emails || form.emails.length === 0) {
        return;
      }

      for (const key in data) {
        // Add some space to array lists.
        if (Array.isArray(data[key])) {
          data[key] = data[key].join(', ');
        }
      }

      return self.email(req, 'emailSubmission', {
        form: form,
        input: data
      },
      {
        from: form.email,
        to: form.emails.map(email => email.email).join(','),
        subject: form.title
      });
    });

    self.on('submission', 'saveSubmission', async function(req, form, data) {
      if (self.options.saveSubmissions === false) {
        return;
      }
      return self.db.insert({
        createdAt: new Date(),
        formId: form._id,
        data: data
      });
    });

    var superPushAssets = self.pushAssets;
    self.pushAssets = function() {
      superPushAssets();
      self.pushAsset('stylesheet', 'lean', { when: 'lean' });
    };
  }
};
