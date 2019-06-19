apos.utils.widgetPlayers['apostrophe-forms-params-field'] = function(el, data, options) {
  var formsWidget = apos.utils.closest(el, '[data-apos-widget="apostrophe-forms"]');
  if (!formsWidget) {
    // Editing the form in the piece modal, it is not active for submissions
    return;
  }
  formsWidget.addEventListener('apos-forms-validate', function(event) {
    var inputs = el.querySelectorAll('input[type="hidden"]');

    if (inputs.length === 0) { return; }

    var inputName = inputs[0].getAttribute('name');
    var queryParams = window.location.search.substring(1).split('&');

    var params = {};

    queryParams.forEach(function(string) {
      var pair = string.split("=");
      params[pair[0]] = pair[1];
    });

    event.input[inputName] = params;
  });
}
;
