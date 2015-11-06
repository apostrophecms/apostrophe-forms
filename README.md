A form builder for the [Apostrophe CMS](http://apostrophenow.org).

To enable this module, just configure it in `app.js`.

```javascript
'apostrophe-forms': {}
```

Or, optionally add in an email-from field option to the configuration object. To send an email from a service like Postmark, this field needs to be specified, and should be done anyways to make it less spammy.

```javascript
'apostrophe-forms': {
	email: {
    from: "First LastName <admin@email.com>"
  }
}
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
    'textField', 'integerField', 'textareaField', 'selectField', 'radioField', 'checkboxField', 'checkboxesField', 'dateField', 'timeField',
    // text controls
    'style', 'bold', 'italic', 'createLink', 'unlink', 'insertUnorderedList', 'insertTable',
    // misc widgets
    'slideshow', 'video'
  ]
}
```

Including non-form-field widgets is a great way to dress up a form with explanatory material.


To `remove widgets` from the controls without overriding the entire controls option, use the removeWidgets configuration:

```javascript
'apostrophe-forms': {
  removeWidgets: ['video']
}

## Adding New Widget Types & Validation

Override `widgets` or set the `addWidgets` option when configuring the module. This code recreates the default configuration for the text field widget:

```javascript
'apostrophe-forms': {
  addWidgets: [
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
    }
  ]
}
```

To add form validation to the new widget type, there are a couple of event emitters in place. To validate the field result value, use the `sanitizeFormField` emitter, which is fired before array of results is created. This code recreates the checkbox value validation:

```javascript
  // checkboxes build arrays
  apos.on('sanitizeFormField', function($field, key, result, errors) {
    if ($field.attr('type') !== 'checkbox') {
      return;
    }
    if (!_.has(result, key)) {
      result[key] = [];
    }
    if ($field.prop('checked')) {
      var val = $field.attr('value');
      result[key].push(val);
    }
  });
```

After the results array has been created, error validation can be added with the  sanitizeForm` emitter. Again, this code recreates validation for the default checkboxes to ensure minimum and maximum conditions have been met:

```javascript
  // checkbox groups can have overall min and max
  apos.on('sanitizeForm', function($form, result, errors) {
    $form.find('[data-forms-checkboxes]').each(function() {
      var $field = $(this);
      var min = $field.attr('data-forms-checkbox-min');
      var max = $field.attr('data-forms-checkbox-max');
      var name = $field.attr('data-forms-field-name');
      if(min > 0 || max > 0) {
       var checked = 0;
       checked = result[name].length;

       if((min && (checked < min)) || (max && (checked > max))) {
         var message;
         if (checked < min) {
           message = 'Please select at least ' + min + ' checkboxes.';
         } else {
           message = 'Please select no more than ' + max + ' checkboxes.';
         }
         errors.push({
           name: name,
           message: message
         });
       }
      }
    });
  });
```

## Adding custom fields

Add or remove fields at the project level by passing in objects to the `addFields` or `removeFields` options array.

```javascript
  'apostrophe-forms': {
    addFields: [
      {
        name: 'projectField',
        label: 'Project Level Field',
        type: 'string'
      },
      {
        name: 'thankYouLabel',
        label: 'Project-level Thank you Message',
        type: 'string'
      },
    ],
    removeFields: ['thankYouBody']
  }
```

Passing in a default field to the `addFields` array, such as `thankYouLabel` will override it at the project level.


## Adding custom group fields

There are three default field groups: `basicsTab, contentTab, thanksTab`. Add custom custom groups by setting the `addGroupFields` option in app.js: 

```javascript
  'apostrophe-forms': {
    addGroupFields: [
      {
        name: 'projectTab',
        label: 'Project Content',
        fields: [
          'projectField'
        ]
      }
    ]
  }
```


To remove or override the default group fields use the `removeGroupFields` configuration:

```javascript
  'apostrophe-forms': {
    removeGroupFields: ['contentTab']
  }
```

## What happens when forms are submitted

When a form is submitted the content is saved to the `aposFormSubmissions` collection, and if an email address was entered when creating the form, it is also delivered to that email address.

The long-term goal is to provide a handy interface for exporting past submissions in CSV format. However the module is already quite useful in any context where submission by email is acceptable, you don't mind building your own tools to export from `aposFormSubmissions`, or you plan to override as described below.

## Running your own code when a form is submitted

Subclass the module and override the `afterSubmit` method which is provided for this purpose.

## Changelog

0.5.3: fields now have a `fieldId` which will improve CSV export (however, not saving yet). The next minor version will be a bc break in the way content is saved in the collection.

The forms widget now shows only the selected form, not all of them!
