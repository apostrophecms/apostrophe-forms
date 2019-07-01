const assert = require('assert');

describe('Forms module', function () {

  let apos;

  this.timeout(25000);

  after(function (done) {
    require('apostrophe/test-lib/util').destroy(apos, done);
  });

  // Existance
  it('should be a property of the apos object', function (done) {
    apos = require('apostrophe')({
      testModule: true,
      baseUrl: 'http://localhost:4000',
      modules: {
        'apostrophe-express': {
          port: 4242,
          session: {
            secret: 'test-the-forms'
          }
        },
        'apostrophe-forms': {},
        'apostrophe-forms-widgets': {},
        'apostrophe-forms-text-field-widgets': {},
        'apostrophe-forms-textarea-field-widgets': {},
        'apostrophe-forms-select-field-widgets': {},
        'apostrophe-forms-radio-field-widgets': {},
        'apostrophe-forms-checkboxes-field-widgets': {},
        'apostrophe-forms-file-field-widgets': {},
        'apostrophe-forms-boolean-field-widgets': {}
      },
      afterInit: function (callback) {
        const forms = apos.modules['apostrophe-forms'];
        const widgets = apos.modules['apostrophe-forms-widgets'];
        const text = apos.modules['apostrophe-forms-text-field-widgets'];
        const textarea = apos.modules['apostrophe-forms-textarea-field-widgets'];
        const select = apos.modules['apostrophe-forms-select-field-widgets'];
        const radio = apos.modules['apostrophe-forms-radio-field-widgets'];
        const checkboxes = apos.modules['apostrophe-forms-checkboxes-field-widgets'];
        const file = apos.modules['apostrophe-forms-file-field-widgets'];
        const boolean = apos.modules['apostrophe-forms-boolean-field-widgets'];

        assert(forms.__meta.name === 'apostrophe-forms');
        assert(widgets.__meta.name === 'apostrophe-forms-widgets');
        assert(text.__meta.name === 'apostrophe-forms-text-field-widgets');
        assert(textarea.__meta.name === 'apostrophe-forms-textarea-field-widgets');
        assert(select.__meta.name === 'apostrophe-forms-select-field-widgets');
        assert(radio.__meta.name === 'apostrophe-forms-radio-field-widgets');
        assert(checkboxes.__meta.name === 'apostrophe-forms-checkboxes-field-widgets');
        assert(file.__meta.name === 'apostrophe-forms-file-field-widgets');
        assert(boolean.__meta.name === 'apostrophe-forms-boolean-field-widgets');

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

  it('should create a form', function () {
    const req = apos.tasks.getReq();

    return apos.docs.db.insert(form1)
      .then(function () {
        return apos.docs.getManager('apostrophe-forms').find(req, {}).toObject();
      })
      .then(function (form) {
        assert(form);
        assert(form.title === 'First test form');
      })
      .catch(function (err) {
        assert(!err);
      });
  });

  // Submitting gets 200 response
  // Submission is stored in the db
  // Submission is not stored in the db if disabled.
  // Get form errors returned from malformed data.
  // Email sending?
  // Captures query parameters
  // reCAPTCHA https://developers.google.com/recaptcha/docs/faq#id-like-to-run-automated-tests-with-recaptcha-what-should-i-do
  // Fail submission if reCAPTHCA token is wrong.

  // Individual tests for sanitizeFormField methods on field widgets.
});
