apos.utils.widgetPlayers['apostrophe-forms-file-field'] = function (el, data, options) {

  var inputFile = el.querySelector('input');

  var formsWidget = apos.utils.closest(el, '[data-apos-widget="apostrophe-forms"]');
  if (!formsWidget) {
    // Editing the form in the piece modal, it is not active for submissions
    return;
  }

  var spinner = el.querySelector('[data-apos-forms-file-spinner]');

  formsWidget.addEventListener('apos-forms-validate', function (event) {
    // We already did the hard work, this is a hidden field with the _id of the
    // attachment.
    var attachmentIds = inputFile.getAttribute('data-apos-forms-attachment-ids');
    event.input[inputFile.getAttribute('name')] = attachmentIds ? attachmentIds.split(',') : null;
  });

  var error = el.querySelector('[data-apos-forms-file-error]');
  error.hidden = true;

  inputFile.addEventListener('change', function (event) {
    el.setAttribute('data-apos-forms-busy', '1');
    spinner.hidden = false;
    error.hidden = true;

    sendFiles(inputFile.files, 0, []);
  });


  function sendFiles(files, fileIndex, fileIds) {
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
        sendFiles(files, fileIndex, fileIds);
      } else {
        inputFile.setAttribute('data-apos-forms-attachment-ids', fileIds.join());

        // Remove the busy state.
        el.removeAttribute('data-apos-forms-busy');
        spinner.hidden = true;
      }
    });
  }

  function fail() {
    error.hidden = false;
    spinner.hidden = true;
    inputFile.removeAttribute('data-apos-forms-attachment-ids');
  }
};
