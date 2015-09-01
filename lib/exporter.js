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

module.exports = function(self) {

  self._app.post(self._action + '/export', function(req, res) {

    var formsCollection = self._apos.db.collection('aposFormSubmissions');

    // ================================================================
    // CRITERIA & FORM
    // ================================================================

    // check first for `req.body.formId`. We need this to get the form.

    // build a criteria object, look at `req.body.start` and `req.body.end`
    // for possible date constraints.

    // do a self.get with the `formId` to get the form.

    // ================================================================
    // CSV SETUP
    // ================================================================

    // set up the csv-stringify module and make sure the delimiter is
    // set to ','

    // set the http headers so that the browser expects a csv file
    // download. you can also set the filename.
    //   `res.header('content-type','text/csv');`
    //   `res.header('content-disposition', 'attachment; filename=MY-EXPORT.csv');`

    // open up the stream:
    //   `stringifier.pipe(res);`

    // ================================================================
    // COLUMN HEADERS
    // ================================================================

    // loop through the form and grab each field's fieldId and label.

    // make your first call to stringifier.write([]) in order to write
    // the column headers.
    //   `stringifier.write([ 'label1', 'label2', 'label3', ... ]);`

    // ================================================================
    // EXPORT LOOP
    // ================================================================

    // using a `chunkSize` and `totalSubmission` sort of variables,
    // loop through the formSubmissions and write each one out as an
    // array of values. MAKE SURE the length is the same as the column
    // length (i.e. if a field has no value, you still need to write '')

    // ================================================================
    // FINISH
    // ================================================================

    // when it's complete or if you've errored out, you need to call
    // `stringifier.end()` to close the stream (otherwise the browser
    // will never know to stop downloading the file).

  });

};