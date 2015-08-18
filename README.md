A form builder for the [Apostrophe CMS](http://apostrophenow.org).

To enable this module, just configure it in `app.js`.

```javascript
'apostrophe-forms': {}
```

Then add `aposFormsMenu` to outerLayout:

```
{{ aposFormsMenu(permissions) }}
```

Now you can add forms to any area that permits the `forms` widget.

Forms are created via the "Forms" dropdown menu.

This is incomplete, see github issues.

