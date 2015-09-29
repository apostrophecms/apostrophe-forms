apos.widgetPlayers.forms = function($el) {
  var $form = $el.find('form');

  //add date picker to date field
  apos.enhanceDate($form.find('[data-forms-date]'));

  if ($form.find('[data-forms-section-break]').length > 0){
    initSections($form);
  }

  $form.on('submit', function() {
    var action = $form.attr('action');
    var result = {};
    var errors = [];

    //Call our sanitize function
    santizeFields($form, result, errors);

    apos.emit('sanitizeForm', $form, result, errors);

    //Call our set messages function
    setErrorMessages($form, errors, function(){
      $.jsonCall(action, result, function(data) {
        if (data.status !== 'ok') {
          return false;
        }
        $el.html(data.replacement);
      });
      return false;
    });
  });
};

// anything might be required
apos.on('sanitizeFormField', function($field, key, result, errors) {
  if ($field.is('[apos-required]')) {
    if (!$field.val().toString().length) {
      errors.push({
        name: key,
        message: 'required'
      });
    }
  }
});

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
  console.log($form);
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

apos.on('sanitizeForm', function($form, result, errors) {

});

function sanitizeFields($form, result, errors){
  $form.find('[data-forms-field-name]').each(function() {
    var $field = $(this);
    var key = $(this).attr('data-forms-field-name');
    apos.emit('sanitizeFormField', $field, key, result, errors);
    if (!_.has(result, key)) {
      // simple field
      result[key] = $field.val();
    }
  });
}

function setErrorMessages($form, errors, callback){
  //remove old errors & display new error message(s)
  $('.apos-forms-error-message').remove();

  if (!errors.length){
    return callback();
  }

  if (errors.length) {
    var $first;
    _.each(errors, function(error) {
      var $fieldset = $form.find('[data-forms-fieldset-name="' + error.name + '"]').closest('fieldset');
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
}

function initSections($form){
  var $sections = $form.find('[data-type="sectionBreak"]');

  //Using our functions to get things started.
  buildSections($sections, function(){
    $sections = $form.find('[data-forms-section]')
    $sections.first().toggleClass('active');
    //Now add next/prev
    addSectionListeners($sections);
  });

  //function to wrap sections of forms appropriately.
  function buildSections($sections, callback){
    $sections.each(function(){
      var $additional = $(this).nextUntil('[data-type="sectionBreak"], [data-forms-arrows]');
      var $wholeSection = $(this).add($additional);
      $wholeSection.wrapAll('<div class="apos-form-section" data-forms-section></div>');
    });
    return callback();
  };

  //function to init and handle next/prev events.
  function addSectionListeners($sections){
    var $next = $form.find('[data-forms-next]');
    var $prev = $form.find('[data-forms-prev]');

    $next.toggleClass('active', true);
    $prev.toggleClass('active', true);

    //next handler
    $next.click(function(){
      var currentIndex = $sections.filter('.active').index();
      setActiveSection(currentIndex + 1);
    });

    //prev handler
    $prev.click(function(){
      var currentIndex = $sections.filter('.active').index();
      setActiveSection(currentIndex - 1);
    });

    //For a given index, set an appropriately active class or return.
    function setActiveSection(index){
      var errors = [];
      var result = {};
      //Give other pieces the ability to hook into this change.
      sanitizeFields($sections, result, errors);
      setErrorMessages($sections, errors, function(){
        if (index < 0 || index >= ($sections.length)){
          return;
        }
        $sections.toggleClass('active', false);
        $sections.eq(index).toggleClass('active', true);
      });
    }
  };
}
