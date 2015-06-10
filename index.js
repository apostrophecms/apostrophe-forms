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
    'textField', 'textareaField', 'selectField', 'radioField', 'checkboxField', 'dateField', 'timeField',
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
        name: 'submitLabel',
        label: 'Label for Submit Button',
        type: 'string'
      },
      {
        name: 'email',
        label: 'Email Results To',
        type: 'string'
      },
      {
        name: 'body',
        label: 'Form Content',
        type: 'area',
        options: {
          controls: options.controls
        }
      }
    ]
  });

  options.modules = (options.modules || []).concat([ { dir: __dirname, name: 'forms' } ]);

  snippets.Snippets.call(this, options, null);

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
      label: 'Checkbox Field',
      css: 'apostrophe-checkbox-field',
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
              type: 'string'
            },
            {
              name: 'required',
              label: 'Must Check to Complete Form',
              type: 'boolean'
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
        },
        {
          name: 'date',
          label: 'Date',
          type: 'date',
          required: true
        }
      ]
    }
    //TODO add datetime
  ].concat(options.addWidgets || []);

  // widgetEditors.html will spit out a frontend DOM template for editing
  // each widget type we register
  self.pushAsset('template', 'widgetEditors', { when: 'user', data: options });

  self.pushAsset('script', 'editor', { when: 'user' });
  self.pushAsset('stylesheet', 'editor', { when: 'user' });

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
      console.error('\n\nERROR: apostrophe-forms schema fields must not be named "content". Fix your \"' + widget.name + '\" widget definition.\n\n');
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

  if (callback) {
    // Invoke callback on next tick so that the people object
    // is returned first and can be assigned to a variable for
    // use in whatever our callback is invoking
    process.nextTick(function() { return callback(null); });
  }

};

