# Apostrophe Forms

`npm i apostrophe-forms`

TODO:
- [ ] document how to specify more form area widgets, including non-field widgets.
- [ ] Document recaptcha process: https://www.google.com/recaptcha/

## Stability: alpha

This is a work in progress, porting the old 0.5 version to ApostropheCMS 2.x. Currently everything works according to a new, extensible pattern using the lean frontend library.

## Configuration

Enable the modules in your `app.js` file as with other modules:

```javascript
// in app.js
modules: {
  // ...,
  'apostrophe-forms': {},
  'apostrophe-forms-widgets': {},
  // Enable only the field widgets that your application needs to make it
  // easier for application/website managers.
  // TODO: enabling every field widget module is going to get tedious, can something be done?
  'apostrophe-forms-text-field-widgets': {},
  'apostrophe-forms-textarea-field-widgets': {},
  'apostrophe-forms-file-field-widgets': {},
  'apostrophe-forms-select-field-widgets': {},
  'apostrophe-forms-radio-field-widgets': {},
  'apostrophe-forms-checkboxes-field-widgets': {},
  // END of field widgets
  'apostrophe-email': {
    // See the [email tutorial](https://docs.apostrophecms.org/apostrophe/tutorials/howtos/email) for required configuration.
  },
  'apostrophe-permissions': {
    construct: function(self, options) {
      // Required if you want file fields to work on public pages.
      self.addPublic([ 'edit-attachment' ]);
    }
  }
}
```

In the page, widget, or other template, add only the main widget module to the configuration in an area or singleton.

Example:

```
  {{ apos.area(data.page, 'body', {
    widgets: {
      'apostrophe-forms': {}
    }
  }) }}
```

## Submissions

By default, submissions are saved to a new MongoDB collection, `aposFormSubmissions`. If you do not want submissions saved to this collection, add the `saveSubmissions: false` option to the `apostrophe-forms` module.

Form submission triggers a `'submission'` event that you can listen for and handle in an additional method if you choose. The callback for that event is provided the arguments, `req, form (the form object), output (the submission output)`.

### Email

If `apostrophe-email` is configured, submissions can be sent to multiple email addresses as well. In the "After-Submission" tab, enter a comma-separated list of email addresses to the "Email Address(es) for Results" field. If not using this feature, set the `emailSubmissions: false` on the `apostrophe-forms` module to hide the related field on forms.
