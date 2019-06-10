apos.utils.widgetPlayers['apostrophe-forms-textarea-field'] = function(el, data, options) {
  var formsWidget = apos.utils.closest(el, '[data-apos-widget="apostrophe-forms"]');
  if (!formsWidget) {
    // Editing the form in the piece modal, it is not active for submissions
    return;
  }
  formsWidget.addEventListener('apos-forms-validate', function(event) {
    var input = el.querySelector('textarea');
    event.input[input.getAttribute('name')] = input.value;
  });
};
