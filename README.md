A form builder for the [Apostrophe CMS](http://apostrophenow.org).

To enable this module, just configure it in `app.js`.

```javascript
'apostrophe-forms': {}
```

Then add `aposFormsMenu` to outerLayout:

```
{{ aposFormsMenu(permissions) }}
```

New forms are created via the "Forms" dropdown menu.

To insert a form on your site, just include the `forms` widget in the `controls` list for an area, or use an `forms` singleton.

## Changing the permitted form fields and other widgets in a form

Set the `controls` option when configuring the module. This code recreates the default configuration:

```javascript
'apostrophe-forms': {
  controls: [
    // form field widgets
    'textField', 'textareaField', 'selectField', 'radioField', 'checkboxField', 'checkboxesField', 'dateField', 'timeField',
    // text controls
    'style', 'bold', 'italic', 'createLink', 'unlink', 'insertUnorderedList', 'insertTable',
    // misc widgets
    'slideshow', 'video'
  ]
}
```

Including non-form-field widgets is a great way to dress up a form with explanatory material.

## What happens when forms are submitted

When a form is submitted the content is saved to the `aposFormSubmissions` collection, and if an email address was entered when creating the form, it is also delivered to that email address.

The long-term goal is to provide a handy interface for exporting past submissions in CSV format. However the module is already quite useful in any context where submission by email is acceptable, you don't mind building your own tools to export from `aposFormSubmissions`, or you plan to override as described below.

## Running your own code when a form is submitted

Subclass the module and override the `afterSubmit` method which is provided for this purpose.
