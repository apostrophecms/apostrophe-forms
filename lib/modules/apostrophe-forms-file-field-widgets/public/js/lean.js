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
    formsWidget.setAttribute('data-apos-forms-busy', '1');
    apos.utils.addClass(spinner, 'data-apos-forms-visible');
    var formData = new window.FormData();
    var error = formsWidget.querySelector('[data-apos-forms-file-error]');
    apos.utils.removeClass(error, 'apos-visible');
    formData.append('file', file.files[0]);

    return apos.utils.post('/modules/apostrophe-attachments/upload', formData, function(err, info) {

      formsWidget.removeAttribute('data-apos-forms-busy');
      apos.utils.removeClass(spinner, 'data-apos-forms-visible');

      if (err) {
        return fail();
      } else {
        if (info.status !== 'ok') {
          return fail();
        }
        file.setAttribute('data-apos-forms-attachment-id', info.file._id);
      }
      function fail() {
        apos.utils.addClass(error, 'apos-visible');
        file.removeAttribute('data-apos-forms-attachment-id');
      }

    });

  });

};
