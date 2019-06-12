apos.utils.widgetPlayers['apostrophe-forms-file-field'] = function(el, data, options) {

  var formsWidget = apos.utils.closest(el, '[data-apos-widget="apostrophe-forms"]');
  if (!formsWidget) {
    // Editing the form in the piece modal, it is not active for submissions
    return;
  }

  var file = formsWidget.querySelector('input[type="file"]');
  var spinner = formsWidget.querySelector('[data-apos-forms-file-spinner]');

  formsWidget.addEventListener('apos-forms-validate', function(event) {
    // We already did the hard work, this is a hidden field with the _id of the attachment
    event.input[file.getAttribute('name')] = file.getAttribute('data-apos-forms-attachment-id');
  });

  file.addEventListener('change', function(event) {
    el.setAttribute('data-apos-forms-busy', '1');
    spinner.hidden = false;

    var formData = new window.FormData();
    var error = formsWidget.querySelector('[data-apos-forms-file-error]');
    error.hidden = true;
    formData.append('file', file.files[0]);

    return apos.utils.post('/modules/apostrophe-attachments/upload', formData, function(err, info) {

      el.removeAttribute('data-apos-forms-busy');
      spinner.hidden = true;

      if (err) {
        return fail();
      } else {
        if (info.status !== 'ok') {
          return fail();
        }
        file.setAttribute('data-apos-forms-attachment-id', info.file._id);
      }
      function fail() {
        error.hidden = false;
        file.removeAttribute('data-apos-forms-attachment-id');
      }

    });

  });

};
