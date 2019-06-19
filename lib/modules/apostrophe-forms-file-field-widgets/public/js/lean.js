apos.utils.widgetPlayers['apostrophe-forms-file-field'] = function(el, data, options) {

  var formsWidget = apos.utils.closest(el, '[data-apos-widget="apostrophe-forms"]');
  if (!formsWidget) {
    // Editing the form in the piece modal, it is not active for submissions
    return;
  }

  var file = formsWidget.querySelector('input[type="file"]');
  var spinner = formsWidget.querySelector('[data-apos-forms-file-spinner]');
  var fileIds = [];
  var fileIndex = 0;

  formsWidget.addEventListener('apos-forms-validate', function(event) {
    // We already did the hard work, this is a hidden field with the _id of the
    // attachment.
    event.input[file.getAttribute('name')] = file.getAttribute('data-apos-forms-attachment-ids');
  });

  var error = formsWidget.querySelector('[data-apos-forms-file-error]');
  error.hidden = true;

  file.addEventListener('change', function(event) {
    el.setAttribute('data-apos-forms-busy', '1');
    spinner.hidden = false;

    sendFiles(file.files);
  });

  function sendFiles (files) {
    var formData = new window.FormData();
    formData.append('file', files[fileIndex]);

    return apos.utils.post('/modules/apostrophe-attachments/upload', formData, function (err, info) {
      if (err) {
        return fail();
      } else {
        if (info.status !== 'ok') {
          return fail();
        }
      }

      fileIds.push(info.file._id);
      fileIndex++;

      if (files[fileIndex]) {
        sendFiles(files);
      } else {
        file.setAttribute('data-apos-forms-attachment-ids', fileIds.join());
        fileIds = [];
        fileIndex = 0;
        // Remove the busy state.
        el.removeAttribute('data-apos-forms-busy');
        spinner.hidden = true;
      }
    });
  }

  function fail() {
    error.hidden = false;
    file.removeAttribute('data-apos-forms-attachment-ids');
  }
};
