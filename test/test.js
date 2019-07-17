const assert = require('assert');
const axios = require('axios');
const testUtil = require('apostrophe/test-lib/util');
const fileUtils = require('./lib/file-utils');
describe('Forms module', function () {

  let apos;

  this.timeout(25000);

  after(function (done) {
    testUtil.destroy(apos, done);
  });

  // Existance
  const formWidgets = {
    'apostrophe-forms-widgets': {},
    'apostrophe-forms-text-field-widgets': {},
    'apostrophe-forms-textarea-field-widgets': {},
    'apostrophe-forms-select-field-widgets': {},
    'apostrophe-forms-radio-field-widgets': {},
    'apostrophe-forms-checkboxes-field-widgets': {},
    'apostrophe-forms-file-field-widgets': {},
    'apostrophe-forms-boolean-field-widgets': {},
    'apostrophe-forms-conditional-widgets': {}
  };

  let forms;
  let textWidgets;
  let textareaWidgets;
  let selectWidgets;
  let radioWidgets;
  let checkboxesWidgets;
  let fileWidgets;
  let booleanWidgets;
  let conditionalWidgets;

  it('should be a property of the apos object', function (done) {
    apos = require('apostrophe')({
      testModule: true,
      modules: {
        'apostrophe-express': {
          port: 4242,
          csrf: {
            exceptions: ['/modules/apostrophe-forms/submit']
          },
          session: {
            secret: 'test-the-forms'
          }
        },
        'apostrophe-forms': {},
        ...formWidgets
      },
      afterInit: function (callback) {
        forms = apos.modules['apostrophe-forms'];
        const widgets = apos.modules['apostrophe-forms-widgets'];
        textWidgets = apos.modules['apostrophe-forms-text-field-widgets'];
        textareaWidgets = apos.modules['apostrophe-forms-textarea-field-widgets'];
        selectWidgets = apos.modules['apostrophe-forms-select-field-widgets'];
        radioWidgets = apos.modules['apostrophe-forms-radio-field-widgets'];
        checkboxesWidgets = apos.modules['apostrophe-forms-checkboxes-field-widgets'];
        fileWidgets = apos.modules['apostrophe-forms-file-field-widgets'];
        booleanWidgets = apos.modules['apostrophe-forms-boolean-field-widgets'];
        conditionalWidgets = apos.modules['apostrophe-forms-conditional-widgets'];

        assert(forms.__meta.name === 'apostrophe-forms');
        assert(widgets.__meta.name === 'apostrophe-forms-widgets');
        assert(textWidgets.__meta.name === 'apostrophe-forms-text-field-widgets');
        assert(textareaWidgets.__meta.name === 'apostrophe-forms-textarea-field-widgets');
        assert(selectWidgets.__meta.name === 'apostrophe-forms-select-field-widgets');
        assert(radioWidgets.__meta.name === 'apostrophe-forms-radio-field-widgets');
        assert(checkboxesWidgets.__meta.name === 'apostrophe-forms-checkboxes-field-widgets');
        assert(fileWidgets.__meta.name === 'apostrophe-forms-file-field-widgets');
        assert(booleanWidgets.__meta.name === 'apostrophe-forms-boolean-field-widgets');
        assert(conditionalWidgets.__meta.name === 'apostrophe-forms-conditional-widgets');

        return callback(null);
      },
      afterListen: function (err) {
        assert(!err);
        done();
      }
    });
  });

  // Submissions collection exists.
  it('should have a default collection for submissions', function (done) {
    apos.db.collection('aposFormSubmissions', function (err, collection) {
      assert(!err);
      assert(collection.namespace === 'test.aposFormSubmissions');
      done();
    });
  });

  // Create a form
  const form1 = {
    '_id': 'form1',
    'published': true,
    'type': 'apostrophe-forms',
    'title': 'First test form',
    'slug': 'test-form-one',
    'contents': {
      'type': 'area',
      'items': [
        {
          '_id': 'dogNameId',
          'fieldLabel': 'Dog name',
          'fieldName': 'DogName',
          'required': true,
          'type': 'apostrophe-forms-text-field'
        },
        {
          '_id': 'dogTraitsId',
          'fieldLabel': 'Check all that apply',
          'fieldName': 'DogTraits',
          'required': true,
          'type': 'apostrophe-forms-checkboxes-field',
          'choices': [
            {
              'label': 'Runs fast',
              'value': 'Runs fast'
            },
            {
              'label': 'It\'s a dog',
              'value': 'It\'s a dog'
            },
            {
              'label': 'Likes treats',
              'value': 'Likes treats'
            }
          ]
        },
        {
          '_id': 'dogBreedId',
          'fieldLabel': 'Dog breed',
          'fieldName': 'DogBreed',
          'required': false,
          'type': 'apostrophe-forms-radio-field',
          'choices': [
            {
              'label': 'Irish Wolfhound',
              'value': 'Irish Wolfhound'
            },
            {
              'label': 'Cesky Terrier',
              'value': 'Cesky Terrier'
            },
            {
              'label': 'Dachshund',
              'value': 'Dachshund'
            },
            {
              'label': 'Pumi',
              'value': 'Pumi'
            }
          ]
        },
        {
          '_id': 'dogPhotoId',
          'fieldLabel': 'Photo of your dog',
          'fieldName': 'DogPhoto',
          'required': false,
          'type': 'apostrophe-forms-file-field'
        },
        {
          '_id': 'agreeId',
          'fieldLabel': 'Opt-in to participate',
          'fieldName': 'agree',
          'required': true,
          'checked': false,
          'type': 'apostrophe-forms-boolean-field'
        }
      ]
    },
    'enableQueryParams': true,
    'queryParamList': [
      {
        'id': 'source',
        'key': 'source'
      },
      {
        'id': 'memberId',
        'key': 'member-id',
        'lengthLimit': 6
      }
    ]
  };

  let savedForm1;

  it('should create a form', function () {
    const req = apos.tasks.getReq();

    return apos.docs.db.insert(form1)
      .then(function () {
        return apos.docs.getManager('apostrophe-forms').find(req, {}).toObject();
      })
      .then(function (form) {
        savedForm1 = form;
        assert(form);
        assert(form.title === 'First test form');
      })
      .catch(function (err) {
        assert(!err);
      });
  });

  it('should have the same widgets in conditional widget areas', function () {
    const formWidgets = forms.schema.find(field => {
      return field.name === 'contents';
    }).options.widgets;

    // Main form widgets has the conditional widget as an option.
    assert(formWidgets['apostrophe-forms-conditional']);

    delete formWidgets['apostrophe-forms-conditional'];

    const condWidgets = conditionalWidgets.schema.find(field => {
      return field.name === 'contents';
    }).options.widgets;

    assert(Object.keys(formWidgets).length === Object.keys(condWidgets).length);

    for (const widget in condWidgets) {
      assert(formWidgets[widget]);
    }
  });

  // Submitting gets 200 response
  const submission1 = {
    'DogName': 'Jasper',
    'DogTraits': [
      'Runs fast',
      'Likes treats'
    ],
    'DogBreed': 'Irish Wolfhound',
    'DogToy': 'Frisbee',
    'LifeStory': 'Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Donec ullamcorper nulla non metus auctor fringilla.',
    'agree': true,
    'queryParams': {
      'member-id': '123456789',
      'source': 'newspaper',
      'malicious': 'evil'
    }
  };

  it('should accept a valid submission', async function () {
    submission1._id = savedForm1._id;

    const response = await axios({
      method: 'post',
      url: `http://localhost:4242/modules/apostrophe-forms/submit`,
      data: submission1
    });

    assert(response.status === 200);
    assert(response.data.status === 'ok');
  });

  // Submission is stored in the db
  it('can find the form submission in the database', function (done) {
    apos.db.collection('aposFormSubmissions').findOne({
      'data.DogName': 'Jasper'
    }, function (err, doc) {
      assert(!err);
      assert(doc.data.DogBreed === 'Irish Wolfhound');

      return done();
    });
  });

  // Submission captures and limits query parameters
  it('can find query parameter data saved and limited', function (done) {
    apos.db.collection('aposFormSubmissions').findOne({
      'data.DogName': 'Jasper'
    }, function (err, doc) {
      assert(!err);
      assert(doc.data['member-id'] === '123456');
      assert(doc.data['source'] === 'newspaper');
      assert(doc.data['malicious'] === undefined);

      return done();
    });
  });

  // Submission is not stored in the db if disabled.
  let apos2;
  const form2 = { ...form1 };
  form2.slug = 'test-form-two';
  form2._id = 'form2';
  let savedForm2;
  let submission2 = { ...submission1 };

  it('should be a property of the apos2 object', function (done) {
    apos2 = require('apostrophe')({
      shortName: 'test2',
      baseUrl: 'http://localhost:5000',
      modules: {
        'apostrophe-express': {
          port: 5000,
          csrf: {
            exceptions: ['/modules/apostrophe-forms/submit']
          },
          session: {
            secret: 'test-the-forms-more'
          }
        },
        'apostrophe-forms': {
          saveSubmissions: false
        },
        ...formWidgets
      },
      afterInit: function (callback) {
        const forms = apos.modules['apostrophe-forms'];

        assert(forms.__meta.name === 'apostrophe-forms');

        return callback(null);
      },
      afterListen: function (err) {
        assert(!err);
        done();
      }
    });
  });

  it('should not save in the database if disabled', async function () {
    const req = apos2.tasks.getReq();

    await apos2.docs.db.insert(form2)
      .then(function () {
        return apos2.docs.getManager('apostrophe-forms').find(req, {}).toObject();
      })
      .then(function (form) {
        savedForm2 = form;
      })
      .catch(function (err) {
        assert(!err);
      });

    submission2._id = savedForm2._id;

    const response = await axios({
      method: 'post',
      url: `http://localhost:5000/modules/apostrophe-forms/submit`,
      data: submission2
    });

    assert(response.status === 200);

    const doc = await apos2.db.collection('aposFormSubmissions').findOne({
      'data.DogName': 'Jasper'
    });

    assert(!doc);
  });

  it('destroys the second instance', function (done) {
    testUtil.destroy(apos2, done);
  });

  // Get form errors returned from missing required data.
  const submission3 = {
    'agree': true
  };

  it('should return errors for missing data', async function () {
    submission3._id = savedForm1._id;

    const response = await axios({
      method: 'post',
      url: `http://localhost:4242/modules/apostrophe-forms/submit`,
      data: submission3
    });

    assert(response.status === 200);
    assert(response.data.status === 'error');
    assert(response.data.formErrors.length === 2);
    assert(response.data.formErrors[0].error === 'required');
    assert(response.data.formErrors[1].error === 'required');
  });

  // Test basic reCAPTCHA requirements.
  let apos3;
  let savedForm3;
  let submission4 = { ...submission1 };

  it('should be a property of the apos3 object', function (done) {
    apos3 = require('apostrophe')({
      shortName: 'test3',
      baseUrl: 'http://localhost:6000',
      modules: {
        'apostrophe-express': {
          port: 6000,
          csrf: {
            exceptions: ['/modules/apostrophe-forms/submit']
          },
          session: {
            secret: 'test-the-forms-again'
          }
        },
        'apostrophe-forms': {
          // reCAPTCHA test keys https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha-what-should-i-do
          recaptchaSite: '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI',
          recaptchaSecret: '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe'
        },
        ...formWidgets
      },
      afterInit: function (callback) {
        const forms = apos.modules['apostrophe-forms'];

        assert(forms.__meta.name === 'apostrophe-forms');

        return callback(null);
      },
      afterListen: function (err) {
        assert(!err);
        done();
      }
    });
  });

  it('should return a form error if missing required reCAPTHCA token', async function () {
    const req = apos3.tasks.getReq();

    await apos3.docs.db.insert(form1)
      .then(function () {
        return apos3.docs.getManager('apostrophe-forms').find(req, {})
          .toObject();
      })
      .then(function (form) {
        savedForm3 = form;
      })
      .catch(function (err) {
        console.log(err);
        assert(!err);
      });

    submission4._id = savedForm3._id;

    const response = await axios({
      method: 'post',
      url: `http://localhost:6000/modules/apostrophe-forms/submit`,
      data: submission4
    });

    assert(response.status === 200);
    assert(response.data.status === 'error');
    assert(response.data.formErrors[0].error === 'recaptcha');
    assert(response.data.formErrors[0].global === true);
  });

  it('should submit successfully with a reCAPTCHA token', async function () {
    submission4.recaptcha = 'validRecaptchaToken';

    const response = await axios({
      method: 'post',
      url: `http://localhost:6000/modules/apostrophe-forms/submit`,
      data: submission4
    });

    assert(response.status === 200);
    assert(response.data.status === 'ok');
    assert(!response.data.formErrors);
  });

  it('destroys the third instance', function (done) {
    testUtil.destroy(apos3, done);
  });

  // Individual tests for sanitizeFormField methods on field widgets.
  it('sanitizes text widget input', function (done) {
    const widget = { fieldName: 'textField' };
    const output1 = {};
    const input1 = { textField: 'A valid string.' };

    textWidgets.sanitizeFormField(null, null, widget, input1, output1);

    assert(output1.textField === 'A valid string.');

    const input2 = { textField: 127 };
    const output2 = {};

    textWidgets.sanitizeFormField(null, null, widget, input2, output2);

    assert(output2.textField === '127');

    const input3 = { textField: null };
    const output3 = {};

    textWidgets.sanitizeFormField(null, null, widget, input3, output3);

    assert(output3.textField === '');

    done();
  });

  it('sanitizes textArea widget input', function (done) {
    const widget = { fieldName: 'textAreaField' };
    const longText = 'Nullam id dolor id nibh ultricies vehicula ut id elit. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Aenean lacinia bibendum nulla sed consectetur.';
    const input1 = { textAreaField: longText };
    const output1 = {};

    textareaWidgets.sanitizeFormField(null, null, widget, input1, output1);
    assert(output1.textAreaField === longText);

    const input2 = { textAreaField: [127, 0] };
    const output2 = {};

    textareaWidgets.sanitizeFormField(null, null, widget, input2, output2);

    assert(!output2.textAreaField);

    done();
  });

  it('sanitizes select widget input', function (done) {
    const widget = {
      fieldName: 'selectField',
      choices: [
        { value: 'first' },
        { value: 'second' },
        { value: 'third' },
        { value: 'fourth' }
      ]
    };
    const input1 = { selectField: 'second' };
    const output1 = {};

    selectWidgets.sanitizeFormField(null, null, widget, input1, output1);

    assert(output1.selectField === 'second');

    const input2 = { selectField: 'ninetieth' };
    const output2 = {};

    selectWidgets.sanitizeFormField(null, null, widget, input2, output2);

    assert(!output2.selectField);
    done();
  });

  it('sanitizes radio widget input', function (done) {
    const widget = {
      fieldName: 'radioField',
      choices: [
        { value: 'first' },
        { value: 'second' },
        { value: 'third' },
        { value: 'fourth' }
      ]
    };
    const input1 = { radioField: 'second' };
    const output1 = {};

    radioWidgets.sanitizeFormField(null, null, widget, input1, output1);

    assert(output1.radioField === 'second');

    const input2 = { radioField: 'ninetieth' };
    const output2 = {};

    radioWidgets.sanitizeFormField(null, null, widget, input2, output2);

    assert(!output2.radioField);
    done();
  });

  it('sanitizes checkbox widget input', function (done) {
    const widget = {
      fieldName: 'checkboxField',
      choices: [
        { value: 'first' },
        { value: 'second' },
        { value: 'third' },
        { value: 'fourth' }
      ]
    };
    const input1 = { checkboxField: ['second', 'fourth', 'seventeenth'] };
    const output1 = {};

    checkboxesWidgets.sanitizeFormField(null, null, widget, input1, output1);

    assert(output1.checkboxField.length === 2);
    assert(output1.checkboxField[0] === 'second');
    assert(output1.checkboxField[1] === 'fourth');

    done();
  });

  let fileId;

  it('should upload a test file using the attachments api', function (done) {
    return fileUtils.insert('upload-test.txt', apos, function (result) {
      fileId = result._id;
      done();
    });
  });

  it('sanitizes file widget input', async function () {
    const widget = { fieldName: 'fileField' };
    const output1 = {};
    const input1 = { fileField: [fileId] };

    await fileWidgets.sanitizeFormField(null, null, widget, input1, output1);

    assert(output1.fileField[0] === `/uploads/attachments/${fileId}-upload-test.txt`);

    const input2 = { fileField: '8675309' };
    const output2 = {};

    await fileWidgets.sanitizeFormField(null, null, widget, input2, output2);

    assert(Array.isArray(output2.fileField));
    assert(output2.fileField.length === 0);
  });

  const uploadTarget = `${__dirname}/public/uploads/`;

  it('should clear uploads material if any', function (done) {
    fileUtils.wipeIt(uploadTarget, apos, done);
  });

  it('sanitizes boolean widget input', function (done) {
    const widget = { fieldName: 'booleanField' };
    const output1 = {};
    const input1 = { booleanField: true };

    booleanWidgets.sanitizeFormField(null, null, widget, input1, output1);

    assert(output1.booleanField === true);

    const input2 = { booleanField: false };
    const output2 = {};

    booleanWidgets.sanitizeFormField(null, null, widget, input2, output2);

    assert(output2.booleanField === false);

    done();
  });
});
