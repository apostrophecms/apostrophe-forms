module.exports = {
  name: 'apostrophe-forms',
  label: 'Form',
  extend: 'apostrophe-pieces',
  moogBundle: {
    directory: 'lib/modules',
    modules: [
      'apostrophe-forms-widgets',
      'apostrophe-forms-base-field-widgets',
      'apostrophe-forms-text-field-widgets'
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
        fields: [ 'contents', 'submitLabel' ]
      },
      {
        name: 'afterSubmit',
        label: 'After-Submission',
        fields: [ 'email', 'thankYouHeading', 'thankYouBody' ]
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
      const form = await self.find(req, { _id: self.apos.launder.id(req.body._id) }).toObject();
      if (!form) {
        return next('notfound');
      }
      const output = {};
      try {
        // Recursively walk the area and its sub-areas so we find
        // fields nested in two-column widgets and the like

        // walk is not an async function so build an array of them to start
        const areas = [];
        self.apos.areas.walk({
          formContents: form.formContents
        }, function(area) {
          areas.push(area);
        });
        for (const area of areas) {
          const widgets = area.items || [];
          for (const widget of widgets) {
            const manager = self.apos.areas.getWidgetManager(widget.type);
            if (manager && manager.sanitizeFormField) {
              await manager.sanitizeFormField(req, widget, input, output);
            }
          }
        }
        await self.emit('submission', req, form, output);
      } catch (e) {
        return next(e);
      }
      return next(null);
    });

    self.on('submission', 'emailSubmission', async function(req, form, data) {
      if (!form.email) {
        return;
      }
      return self.email(req, 'emailSubmission', {
        form: form,
        input: data
      },
      {
        from: form.email,
        to: form.email,
        subject: form.title
      });
    });

    self.on('submission', 'saveSubmission', async function(req, form, data) {
      if (self.options.save === false) {
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
