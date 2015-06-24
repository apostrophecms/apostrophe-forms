apos.widgetPlayers.forms = function($el) {
  var $form = $el.find('form');

  $form.on('submit', function() {
    var action = $form.attr('action');
    var result = {};
    var errors = [];

    $form.find('[data-forms-name]').each(function() {
      var $field = $(this);
      var key = $(this).attr('data-forms-name');
      apos.emit('sanitizeFormField', $field, key, result, errors);
      if (!_.has(result, key)) {
        // simple field
        result[key] = $field.val();
      }
    });

    apos.emit('sanitizeForm', $form, result, errors);

    //remove old errors & display new error message(s)
    $('.apos-forms-error-message').remove();
    if (errors.length) {
      var $first;
      _.each(errors, function(error) {
        var $fieldset = $form.find('[data-forms-field-name="' + error.name + '"]');
        $fieldset.addClass('apos-forms-error');
        var $message = $('<div class="apos-forms-error-message"></div>');
        $message.text(error.message);
        $fieldset.append($message);
        if (!$first) {
          $first = $fieldset;
        }
      });

      $first.scrollintoview();
      return false;
    }

    $.jsonCall(action, result, function(data) {
      if (data.status !== 'ok') {
        return false;
      }
      $el.html(data.replacement);
    });
    return false;
  });
};

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
