# Apostrophe Forms

`npm i apostrophe-forms`

## Configuration

Enable the modules in your `app.js` file as with other modules:

```javascript
// in app.js
modules: {
  // ...,
  'apostrophe-forms': {
    // Best practice: set to first or last so that inputs are nested in labels
    // and easier to style
    optionLabelPosition: 'last'
  },
  'apostrophe-forms-widgets': {},
  // Enable only the field widgets that your application needs to make it
  // easier for application/website managers.
  'apostrophe-forms-text-field-widgets': {},
  'apostrophe-forms-textarea-field-widgets': {},
  'apostrophe-forms-file-field-widgets': {},
  'apostrophe-forms-select-field-widgets': {},
  'apostrophe-forms-radio-field-widgets': {},
  'apostrophe-forms-checkboxes-field-widgets': {},
  'apostrophe-forms-boolean-field-widgets': {},
  'apostrophe-forms-conditional-widgets': {},
  // END of field widgets
  'apostrophe-email': {
    // See the email tutorial for required configuration.
    // https://docs.apostrophecms.org/apostrophe/tutorials/howtos/email
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

The module also emits browser events on submission (`apostrophe-forms:submission-form`) and submission failure (`apostrophe-forms:submission-failed`). Both events are attached to the document `body` element.

### Email

If `apostrophe-email` is configured, submissions can be sent to multiple email addresses as well. In the "After-Submission" tab, enter a comma-separated list of email addresses to the "Email Address(es) for Results" field. If not using this feature, set the `emailSubmissions: false` on the `apostrophe-forms` module to hide the related field on forms.

## Styling

### Disabling the starter styles

Starter styles for user-facing forms are included in a forms.less file. These offer some spacing as well as styling for error states. If you do not want to use these, pass the `disableBaseStyles: true` option to `apostrophe-forms-widgets`. This file can also be used to identify the error state classes that you should style in your project.

```javascript
'apostrophe-forms-widgets': {
  disableBaseStyles: true
},
```

### Custom class prefix

Need more control over your styling? You can include your own class prefix that will be in included on most of the labels, inputs, and message/error elements within the forms. The class that is created uses the [BEM](http://getbem.com/naming/) convention. You add the prefix you want in the `apostrophe-forms` configuration.

```javascript
'apostrophe-forms': {
  classPrefix: 'my-form'
}
```
This results in a class like `my-form__input` being added to input elements in the form, for example.

### Controlling the option label position

The `apostrophe-forms-checkboxes-field-widgets` and `apostrophe-forms-radio-field-widgets` modules both support `optionLabelPosition`. If `optionLabelPosition` is set to `'first'` or `'last'`, the input elements for both radio and checkbox inputs are nested inside the label, with the label's text appearing first or last as appropriate. If no relevant option is set, for backwards compatibility the input is not nested in the label checkboxLabel. This can be explicitly chosen by setting the appropriate option to `'legacy'`. This is more difficult to style, so we recommend setting `optionLabelPosition` to `first` or `last`. You may set the option for both modules by setting it for `apostrophe-forms-base-field-widgets`, which they both inherit from.

```javascript
'apostrophe-forms-checkboxes-field-widgets': {
  optionLabelPosition: 'first',
},
'apostrophe-forms-radio-field-widgets': {
  optionLabelPosition: 'last',
},
// OR, we can set it for both in one place
'apostrophe-forms-base-field-widgets': {
  optionLabelPosition: 'first',
},
```

## Using reCAPTCHA for user validation

Google's reCAPTCHA is built in as an option. You will first need to [set up a reCAPTCHA site up on their website](https://www.google.com/recaptcha/) using the *version two option*. Make sure your domains are configured (using "localhost" for local development) and make note of the **site key** and **secret key**. Those should be added as options to `apostrophe-forms`:

```javascript
// in app.js
modules: {
  // ...,
  'apostrophe-forms': {
    recaptchaSecret: 'YOUR SECRET KEY',
    recaptchaSite: 'YOUR SITE KEY'
  },
  // ...,
```

To make these options configurable by end-users, you can use `apostrophe-override-options` to make global fields set these for you. This would look something like:

```javascript
// in app.js
modules: {
  'apostrophe-override-options': {},
```

```javascript
// in lib/modules/apostrophe-global/index.js
module.exports = {
  addFields: [
    {
      name: 'recaptchaSecret',
      label: 'reCAPTCHA Secret',
      type: 'string'
    },
    {
      name: 'recaptchaSite',
      label: 'reCAPTCHA Site',
      type: 'string'
    }
  ],
  overrideOptions: {
    editable: {
      'apos.apostrophe-forms.recaptchaSite': 'recaptchaSite',
      'apos.apostrophe-forms.recaptchaSecret': 'recaptchaSecret'
    }
  }
};
```

The reCAPTCHA field will then be present on all fields. There is an open issue to improve this to allow form-level disabling.

## Adding project-level form widgets

The form widget included here cover most basic form needs, but you may want to include others, such as structural widgets to create columns within your form.

To override the widgets available in a form, set the `formWidgets` option on `apostrophe-forms` to an object enabling the widgets as you would in any area options. You will need to include the form field widgets here (allowing you to exclude some as well). See the full list in the `index.js` file in the `contents` schema object.

If you're looking to create a sub-widget that also contains all of the field widgets to do a multi-column treatment you will need to also pass the form field widgets in as options to an area or areas there as well.
