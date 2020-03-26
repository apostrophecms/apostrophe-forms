const request = require('request-promise');
const uniq = require('lodash.uniq');

module.exports = {
  name: 'apostrophe-forms',
  label: 'Form',
  extend: 'apostrophe-pieces',
  seo: false,
  openGraph: false,
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
      'apostrophe-forms-boolean-field-widgets',
      'apostrophe-forms-conditional-widgets'
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
            'apostrophe-forms-conditional': {},
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
        name: 'sendConfirmationEmail',
        label: 'Send a Confirmation Email',
        // NOTE: The confirmation email is in `views/emailConfirmation.html`.
        // Edit the message there, adding any dynamic content as needed.
        help: 'Enable this to send a message to the person who submits this form.',
        type: 'boolean',
        choices: [
          {
            value: true,
            showFields: [
              'emailConfirmationField',
            ]
          }
        ]
      },
      {
        name: 'emailConfirmationField',
        label: 'Which is your confirmation email field?',
        help: 'Enter the "name" value of the field where people with enter their email address.',
        type: 'string',
        required: true
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
              'queryParamList'
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
          },
          {
            name: 'conditions',
            label: 'Set Conditions for this Notification',
            help: 'For example, if you only notify this email address if the "country" field is set to "Austria". All conditions must be met. Add the email again with another conditional set if needed."',
            type: 'array',
            titleField: 'value',
            schema: [
              {
                name: 'field',
                label: 'Enter a field to use as your condition.',
                type: 'string',
                help: 'Only select (drop-down) and checkbox fields can be used for this condition.'
              },
              {
                name: 'value',
                type: 'string',
                label: 'Enter the value an end-user will enter to meet this conditional.',
                htmlHelp: 'Use comma-separated values to check multiple values on this field (an OR relationship). Values that actually contain commas should be entered in double-quotation marks (e.g., <code>Proud Mary, The Best, "River Deep, Mountain High"</code>).',
                choices: 'getConditionChoices'
              }
            ]
          }
        ]
      },
      {
        name: 'email',
        label: 'Primary internal email address',
        type: 'string',
        required: true,
        help: 'You may enter one from the previous list. This is the address that will be used as the "from" address on any generated email messages.'
      }
    ] : []).concat(options.addFields || []);

    const afterSubmitFields = [
      'thankYouHeading',
      'thankYouBody',
      'sendConfirmationEmail',
      'emailConfirmationField',
    ].concat(options.emailSubmissions !== false ? [
      'emails',
      'email'
    ] : []);

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
          'queryParamList'
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
        if (options.recaptchaSecret) {
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
        const conditionals = {};
        const skipFields = [];

        // Populate the conditionals object fully to clear disabled values
        // before starting sanitization.
        for (const area of areas) {
          const widgets = area.items || [];
          for (const widget of widgets) {
            // Capture field names for the params check list.
            fieldNames.push(widget.fieldName);

            if (widget.type === 'apostrophe-forms-conditional') {
              trackConditionals(conditionals, widget);
            }
          }
        }

        collectToSkip(input, conditionals, skipFields);

        for (const area of areas) {
          const widgets = area.items || [];
          for (const widget of widgets) {
            const manager = self.apos.areas.getWidgetManager(widget.type);
            if (
              manager && manager.sanitizeFormField &&
              !skipFields.includes(widget.fieldName)
            ) {
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

        if (form.enableQueryParams && form.queryParamList.length > 0) {
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

      if (!input.recaptcha) {
        formErrors.push({
          global: true,
          error: 'recaptcha',
          errorMessage: 'There was a problem submitting your reCAPTCHA verfication.'
        });
      }

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

    self.sendEmailSubmissions = async function (req, form, data) {
      if (self.options.emailSubmissions === false ||
        !form.emails || form.emails.length === 0) {
        return;
      }

      let emails = [];

      form.emails.forEach(mailRule => {
        if (!mailRule.conditions || mailRule.conditions.length === 0) {
          emails.push(mailRule.email);
          return;
        }

        let passed = true;

        mailRule.conditions.forEach(condition => {
          if (!condition.value) {
            return;
          }

          let answer = data[condition.field];

          if (!answer) {
            passed = false;
          } else {
            // Regex for comma-separation from https://stackoverflow.com/questions/11456850/split-a-string-by-commas-but-ignore-commas-within-double-quotes-using-javascript/11457952#comment56094979_11457952
            const regex = /(".*?"|[^",]+)(?=\s*,|\s*$)/g;
            let acceptable = condition.value.match(regex);

            acceptable = acceptable.map(value => {
              // Remove leading/trailing white space and bounding double-quotes.
              value = value.trim();

              if (value[0] === '"' && value[value.length - 1] === '"') {
                value = value.slice(1, -1);
              }

              return value.trim();
            });

            // If the value is stored as a string, convert to an array for checking.
            if (!Array.isArray(answer)) {
              answer = [answer];
            }

            if (!(answer.some(val => acceptable.includes(val)))) {
              passed = false;
            }
          }
        });

        if (passed === true) {
          emails.push(mailRule.email);
        }
      });

      emails = uniq(emails);

      if (self.options.testing) {
        return emails;
      }

      if (emails.length === 0) {
        return null;
      }

      for (const key in data) {
        // Add some space to array lists.
        if (Array.isArray(data[key])) {
          data[key] = data[key].join(', ');
        }
      }

      try {
        const emailOptions = {
          form,
          data,
          to: emails.join(",")
        }

        await self.sendEmail(req, "emailSubmission", emailOptions);

        return null;
      } catch (err) {
        self.apos.utils.error('⚠️ apostrophe-forms submission email notification error: ', err);

        return null;
      }
    };

    //options: form, data, options
    self.sendEmail = (req,emailTemplate, options) => {
      const form = options.form;
      const data = options.data;
      return self.email(
        req,
        emailTemplate,
        {
          form: form,
          input: data
        },
        {
          from: options.from || form.email,
          to: options.to || data[form.emailConfirmationField],
          subject: options.subject || form.title
        }
      );
    };

    self.on('submission', 'emailSubmission', async function (req, form, data) {
      await self.sendEmailSubmissions(req, form, data);
    });

    self.on('submission', 'emailConfirmation', async function(req, form, data) {
      if (form.sendConfirmationEmail !== true || !form.emailConfirmationField) {
        return;
      }

      // Email validation (Regex reference: https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript)
      const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;


      if (!re.test(data[form.emailConfirmationField])) {
        return null;
      }

      try {
        const emailOptions = {
          form,
          data,
        }
        await self.sendEmail(req, "emailConfirmation", emailOptions);

        return null;
      } catch (err) {
        self.apos.utils.error('⚠️ apostrophe-forms submission email confirmation error: ', err);

        return null;
      }
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

    function trackConditionals(conditionals = {}, widget) {
      const conditionName = widget.conditionName;
      const conditionValue = widget.conditionValue;

      if (!widget || !widget.contents || !widget.contents.items) {
        return;
      }

      conditionals[conditionName] = conditionals[conditionName] || {};

      conditionals[conditionName][conditionValue] = conditionals[conditionName][conditionValue] || [];

      widget.contents.items.forEach(item => {
        conditionals[conditionName][conditionValue].push(item.fieldName);
      });

      // If there aren't any fields in the conditional group, don't bother
      // tracking it.
      if (conditionals[conditionName][conditionValue].length === 0) {
        delete conditionals[conditionName][conditionValue];
      }
    }

    function collectToSkip(input, conditionals, skipFields) {
      // Check each field that controls a conditional group.
      for (const name in conditionals) {
        // For each value that a conditional group is looking for, check if the
        // value matches in the output and, if not, remove the output properties
        // for the conditional fields.
        for (let value in conditionals[name]) {
          // Booleans are tracked as true/false, but their field values are 'on'. TEMP?
          if (input[name] === true && value === 'on') {
            value = true;
          }
          if (input[name] !== value) {
            conditionals[name][value].forEach(field => {
              skipFields.push(field);
            });
          }
        }
      }
    }
  }
};
