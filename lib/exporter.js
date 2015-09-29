/*

CSV EXPORTER
============

1. Build a criteria object
2. Get the form itself
3. Set up the csv module (set the http headers)
4. Set the column headers based on the form fields
5. Loop through database chunks
6. Do the work

*/

var async     = require('async'),
    moment    = require('moment'),
    stringify = require('csv-stringify'),
    _         = require('lodash'),
    Promise   = require('es6-promise').Promise;

module.exports = function(self) {

  self._app.post(self._action + '/export', function(req, res) {
    var formsCollection = self._apos.db.collection('aposFormSubmissions');

    // ================================================================
    // CRITERIA & FORM
    // ================================================================

    // check first for `req.body.formId`. We need this to get the form.
    if(!req.body.formId){
      res.statusCode = 500;
      return res.send('Bad request.');
    }
    var formId = req.body.formId;

    // build a criteria object, look at `req.body.start` and `req.body.end`
    // for possible date constraints.
    var criteria = {
      _id: formId,
      type: 'form'
    }

    /*
      (1) get form to generate csv headers
      (2) generate csv file
    */
    async.waterfall([
      getForm,
      generateCsv
    ], function(err, result) {
      //response has already been sent in generateCsv()
    });

    function getForm(callback){
      self._apos.db.collection('aposPages').find(criteria).toArray( function(err, form) {
        if(err){
          callback(err);
        }
        callback(null, form);
      });
    }

    function generateCsv(form, callback){
      // ================================================================
      // CSV SETUP
      // ================================================================
      // set up the csv-stringify module and make sure the delimiter is
      // set to ','
      stringifier = stringify({ delimiter: ',' });

      // set the http headers so that the browser expects a csv file
      // download. you can also set the filename.
      res.header('content-type','text/csv');
      res.header('content-disposition', 'attachment; filename=form-submissions.csv');

      // open up the stream:
      stringifier.pipe(res);

      // prepare some variables for use in the streaming logic.
      var currentCount = 0,
          chunkSize    = 10,
          // this will get changed but we want a high initial value.
          total        = 100;

      // ================================================================
      // COLUMN HEADERS
      // ================================================================

      // loop through the form and grab each field's fieldId and label.
      //var fieldIds = [];
      var formItems = _.get(form[0], "body.items");
      var labels = _.pluck(formItems, "label");
      var labelIds = _.pluck(formItems, "fieldId");

      // make your first call to stringifier.write([]) in order to write
      // the column headers.
      stringifier.write(labels);

      // ================================================================
      // CONTROL FLOW
      // ================================================================
      async.whilst(
        // this decides when to stop running `whilst`
        shouldContinue,
        // this takes care of csv conversion and streaming
        convertAndStream,
        // this handles errors or closes the stream at the end.
        closeStreamOrError
      );

      // determine if we should continue to the next chunk of the DB results
      function shouldContinue() {
        return currentCount < total;
      }

      // ================================================================
      // EXPORT LOOP
      // ================================================================
      // using a `chunkSize` and `totalSubmission` sort of variables,
      // loop through the formSubmissions and write each one out as an
      // array of values. MAKE SURE the length is the same as the column
      // length (i.e. if a field has no value, you still need to write '')
    
      // grab some submissions
      function convertAndStream(callback) {
        //getSubmissions() is gathering a chunk of data
        getSubmissions(form, chunkSize, currentCount)
          //go through the data chunk and write rows
          .then(function(submissionChunk) {
            _.forEach(submissionChunk, function(chunk) {
              //Parse the chunk to form the row we need based on the form fields
              var values = parseChunk(chunk)._result;
              _.each(values, function(row) {
                stringifier.write(row);
              });
            });

            // done: run the next loop!
            currentCount += chunkSize;
            return callback(null);
          })
          .catch(function(error) {
            return callback(error);
          });
      }

      // ================================================================
      // FINISH
      // ================================================================
      // when it's complete or if you've errored out, you need to call
      // `stringifier.end()` to close the stream (otherwise the browser
      // will never know to stop downloading the file).
      function closeStreamOrError(err) {
        if(err){
          res.statusCode = 500;
        }

        // close the stream.
        stringifier.end();

        //the waterfall will handle error status
        return callback(err);
      }


      // ================================================================
      // THINGS THAT DO STUFF
      // ================================================================

      function getSubmissions(form, limit, skip){
        criteria = {
          formId: formId
        }

        //TODO test this formatting when front end date selector is in place
        if(req.body.startDate || req.body.endDate){
          criteria.submittedAt = {};

          if(req.body.startDate){
            criteria.submittedAt.$gte = moment(req.body.startDate).format('YYYY-MM-DD HH:mm:ss');
          }
          if(req.body.endDate){
            criteria.submittedAt.$lte = moment(req.body.endDate).format('YYYY-MM-DD HH:mm:ss');
          }
        }

        return new Promise( function(resolve, reject) {
          formsCollection.find(criteria).skip(skip).limit(limit).toArray(function(err, submissions){
            if(err) {
              return reject(err);
            }

            total = submissions.total;
            return resolve(submissions);
          });
        });
      }


      // do the work of parsing submission chunk.
      // output should be an array of values corresponding to the global form keys:
      function parseChunk(chunk) {
        return new Promise( function(resolve, reject) {
          var row = [];
          _.forEach(labelIds, function(field){
            row.push(chunk[field].value);
          });

          return resolve( row );
        });
      }
    }
  });
};