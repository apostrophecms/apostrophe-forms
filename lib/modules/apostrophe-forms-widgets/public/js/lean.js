apos.utils.widgetPlayers['apostrophe-forms'] = function (el, data, options) {
  const form = el.querySelector('[data-apos-form]');

  if (form) {
    form.onsubmit = submit;
  }

  function submit(event) {
    event.preventDefault();
    const inputs = Array.from(form.elements);

    const data = {};
    inputs.forEach(function(input) {
      if (input.nodeName === "INPUT") {
        data[input.name] = input.value;
      } else {
        // NOTE: For develpment.
        console.log(input.nodeName);
      }
    });

    apos.utils.post('/modules/apostrophe-forms/submit', data, function (err, res) {
      if (err) { console.error(err); }
      console.log('💪', res);
    });

    // Sends data to URI as a JSON - format request body in a POST request(note: not URL - encoded).The callback is node - style: it receives(err, response).If there is no error, response is pre - parsed JSON data.Respects apos.prefix and sends the CSRF token.
  }
};
