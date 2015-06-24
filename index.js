/* jshint node:true */

var _ = require('lodash');
var async = require('async');

module.exports = forms;

function forms(options, callback) {
  return new forms.Forms(options, callback);
}

var snippets = require('apostrophe-snippets');

forms.Forms = function(options, callback) {

  var self = this;

  // Controls to be displayed.
  options.controls = options.controls || [
    // form field widgets
    'textField', 'textareaField', 'selectField', 'radioField', 'checkboxField', '  checkboxesField', 'dateField', 'timeField',
    // text controls
    'style', 'bold', 'italic', 'createLink', 'unlink', 'insertUnorderedList', 'insertTable',
    // misc widgets
    'slideshow', 'buttons', 'video', 'files', 'embed', 'pullquote', 'html'
  ];

  _.defaults(options, {
    name: 'forms',
    label: 'Forms',
    instance: 'form',
    instanceLabel: 'Form',
    menuName: 'aposFormsMenu',
    removeFields: [
      'hideTitle', 'thumbnail'
    ],
    addFields: [
      {
        name: 'body',
        label: 'Form Content',
        type: 'area',
        options: {
          controls: options.controls
        }
      },
      {
        name: 'submitLabel',
        label: 'Label for Submit Button',
        type: 'string'
      },
      {
        name: 'thankYouLabel',
        label: 'Thank You Message (title)',
        type: 'string'
      },
      {
        name: 'thankYouBody',
        label: 'Thank You Message (body)',
        type: 'string',
        textarea: true
      },
      {
        name: 'email',
        label: 'Email Results To',
        type: 'string'
      },
    ]
  });

  options.modules = (options.modules || []).concat([ { dir: __dirname, name: 'forms' } ]);

  snippets.Snippets.call(this, options, null);
  self._apos.mixinModuleEmail(self);

  // Adjust the widget used to actually insert the form. We're
  // subclassing snippets here, so we use extendWidget to change
  // that over to a single-selection autocomplete widget. This
  // is unrelated to the widgets used for the individual form
  // fields, see "self.widgets" code below. -Tom

  self.addCriteria = function(item, criteria, options) {
    // only one form per widget
    if (item.ids && item.ids[0]) {
      criteria._id = item.ids[0]
    }
  };
  self.sanitize = function(item) {
    // only one form per widget, always selected by id
    item.by = 'id';
    if (item.ids && item.ids[0]) {
      item.ids = [ self.apos.sanitizeId(item.ids[0]) ];
    }
  };

  self.widgets = {};

  options.widgets = options.widgets || [
    {
      name: 'textField',
      label: 'Text Field',
      css: 'apostrophe-text-field',
      schema: [
        {
          name: 'label',
          label: 'Label',
          type: 'string',
          required: true
        },
        {
          name: 'required',
          label: 'Required',
          type: 'boolean'
        }
      ]
    },
    {
      name: 'textareaField',
      label: 'Text Box Field',
      css: 'apostrophe-textarea-field',
      schema: [
        {
          name: 'label',
          label: 'Label',
          type: 'string',
          required: true
        },
        {
          name: 'required',
          label: 'Required',
          type: 'boolean'
        }
      ]
    },
    {
      name: 'selectField',
      label: 'Select Menu Field',
      css: 'apostrophe-select-field',
      schema: [
        {
          name: 'label',
          label: 'Label',
          type: 'string',
          required: true
        },
        {
          name: 'required',
          label: 'Required',
          type: 'boolean'
        },
        {
          name: 'choices',
          type: 'array',
          label: 'Choice',
          schema: [
            {
              name: 'value',
              label: 'Value',
              type: 'string',
              required: true
            }
          ]
        }
      ]
    },
    {
      name: 'checkboxField',
      label: 'Single Checkbox Field',
      css: 'apostrophe-checkbox-field',
      schema: [
        {
          name: 'label',
          label: 'Label',
          type: 'string',
          required: true
        },
        {
          name: 'value',
          label: 'Value',
          type: 'string',
          required: true
        },
        { 
          name: 'required',
          label: 'Must Check to Complete Form',
          type: 'boolean'
        }
      ]
    },
    {
      name: 'checkboxesField',
      label: 'Multiple Checkboxes Field',
      css: 'apostrophe-checkboxes-field',
      schema: [
        {
          name: 'label',
          label: 'Label',
          type: 'string',
          required: true
        },
        {
          name: 'minimum',
          label: 'Minimum number of options to be selected',
          type: 'integer'
        },
        {
          name: 'maximum',
          label: 'Maximum number of options to be selected',
          type: 'integer'
        },
        {
          name: 'checkboxes',
          type: 'array',
          label: 'Checkbox',
          schema: [
            {
              name: 'value',
              label: 'Value',
              type: 'string',
              required: true
            }
          ]
        }
      ]
    },
    {
      name: 'dateField',
      label: 'Date Field',
      css: 'apostrophe-date-field',
      schema: [
        {
          name: 'label',
          label: 'Label',
          type: 'string',
          required: true
        }
      ]
    }
    //TODO add datetime
  ].concat(options.addWidgets || []);

  // widgetEditors.html will spit out a frontend DOM template for editing
  // each widget type we register
  self.pushAsset('template', 'formFieldWidgetEditors', { when: 'user', data: options });

  self.pushAsset('script', 'editor', { when: 'user' });
  self.pushAsset('stylesheet', 'editor', { when: 'user' });
  self.pushAsset('stylesheet', 'content', { when: 'always' });

  self._apos.pushGlobalData({
    formWidgets: _.map(options.widgets, function(info) {
      info.css = info.css || self._apos.cssName(info.name);
      return info;
    })
  });

  _.each(options.widgets, function(options) {
    var widget = {};
    widget.name = options.name;
    widget.widget = true;
    widget.label = options.label || options.name;
    widget.css = options.css || self._apos.cssName(options.name);
    widget.icon = options.icon;

    if (_.find(options.schema, function(field) {
      return (field.name === 'content');
    })) {
      console.error('\n\nERROR: apostrophe-forms widget schema fields must not be named "content". Fix your \"' + widget.name + '\" widget definition.\n\n');
    }

    widget.sanitize = function(req, item, callback) {
      var object = {};
      return self._schemas.convertFields(req, options.schema, 'form', item, object, function(err) {

        if (err) {
          return callback(err, object);
        }
        return widget.afterConvertFields(req, object, function(e) {
          return callback(e, object);
        });
      });
    };

    widget.renderWidget = function(data) {
      return self.render(widget.name, data);
    };

    widget.empty = function(data) {
      return self._schemas.empty(options.schema, data);
    };

    widget.afterConvertFields = function(req, object, callback) {
      return callback(null);
    };

    widget.load = function(req, item, callback) {
      if (req.aposSchemaWidgetLoading) {
        // Refuse to do perform joins through two levels of schema widgets.
        // This prevents a number of infinite loop scenarios. For this to
        // work properly page loaders should continue to run in series
        // rather than in parallel. -Tom
        return setImmediate(callback);
      }
      if (req.deferredLoads) {
        if (!req.deferredLoads[options.name]) {
          req.deferredLoads[options.name] = [];
          req.deferredLoaders[options.name] = widget.loadNow;
        }
        req.deferredLoads[options.name].push(item);
        return setImmediate(callback);
      }
      return widget.loadNow(req, [ item ], callback);
    };

    widget.loadNow = function(req, items, callback) {
      req.aposSchemaWidgetLoading = true;
      return self._schemas.join(req, options.schema, items, undefined, function(err) {
        req.aposSchemaWidgetLoading = false;
        return setImmediate(_.partial(callback, err));
      });
    };
    self._apos.addWidgetType(widget.name, widget);
    self.widgets[widget.name] = widget;
  });

  self._app.post(self._action + '/submit/:id', function(req, res) {
    var form;
    var result = {};
    return async.series({
      getForm: function(callback) {
        return self.getOne(req, { _id: req.params.id }, {}, function(err, _form) {
          if (err) {
            return callback(err);
          }
          form = _form;
          if (!form) {
            return callback('notfound');
          }
          return callback(null);
        });
      },
      sanitizeAndStore: function(callback) {
        self.eachField(form, function(field) {
          var value = req.body[field.label];
          result[field.label] = self.sanitizeField(field, value);
        });
        result.submittedAt = new Date();
        result.formId = form._id;
        return self.submissions.insert(result, callback);
      },
      email: function(callback) {
        if (!form.email) {
          return setImmediate(callback);
        }
        return self.email(
          req,
          form.email,
          'Form submission: ' + form.title,
          'formSubmission',
          {
            result: _.omit(result, 'formId', '_id'),
            form: form
          },
          function(err) {
            // The form was already recorded, so
            // we shouldn't panic altogether here,
            // that could lead to a duplicate submission
            if (err) {
              console.error(err);
            }
            return callback(null);
          }
        );
      }
    }, function(err) {
      if (err) {
        return res.send({ status: 'error' });
      }
      return res.send({ status: 'ok', replacement: self.render('thankYou', { form: form, result: result }, req) });
    });
  });

  self.ensureSubmissionsCollection = function() {
    self._apos.db.collection('aposFormSubmissions', function(err, collection) {
      if (err) {
        throw err;
      }
      self.submissions = collection;
      return self.submissions.ensureIndex({ formId: 1 }, { safe: true }, function(err) {
        if (err) {
          throw err;
        }
      });
    });
  };

  // A good extension point for more precise sanitization.
  // "field" is the widget for the field, "field.type" is
  // thus very useful

  self.sanitizeField = function(field, value) {
    if (field.type === 'checkboxesField') {
      return _.map(Array.isArray(value) ? value : [], function(item) {
        return self._apos.sanitizeString(item);
      });
    }
    return self._apos.sanitizeString(value);
  };

  self.eachField = function(form, fn) {
    var valid = _.pluck(options.widgets, 'name');
    _.each((form.body && form.body.items) || [], function(widget) {
      if (_.contains(valid, widget.name)) {
        return;
      }
      fn(widget);
    });
  };

  // busted-ass A2 0.5 bootstrap process fails if I
  // don't do this right here, so I'm doing my
  // mongodb initialization stuff afterwards, which
  // is ridiculous. 0.6 time please. -Tom

  process.nextTick(_.partial(callback, null));

  self.ensureSubmissionsCollection();

};

