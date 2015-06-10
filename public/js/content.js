apos.widgetPlayers.forms = function($el) {
  var $form = $el.find('form');

  $form.on('submit', function() {
    var action = $form.attr('action');
    var result = {};
    $form.find('[data-forms-name]').each(function() {
      var $field = $(this);
      var key = $(this).attr('data-forms-name');
      // checkboxes build arrays, everything else is simple
      if ($field.attr('type') === 'checkbox') {
        if (!_.has(result, key)) {
          result[key] = [];
        }
        if ($field.prop('checked')) {
          var val = $field.attr('value');
          result[key].push(val);
        }
      } else {
        result[key] = $field.val();
      }
    });
    $.jsonCall(action, result, function(data) {
      if (data.status !== 'ok') {
        alert('An error occurred. Please try again later.');
        return;
      }
      $el.html(data.replacement);
    });
    return false;
  });
};
