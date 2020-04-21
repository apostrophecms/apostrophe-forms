# Change log

## 1.8.1 2020-04-22

- Fixes IE11 bug by converting a NodeList to an Array before using `.forEach()`.

## 1.8.0 2020-03-25

- Moves the mechanism that sends emails into the `self.sendEmail` method, allowing for this to be more easily overridden in a project. The initiating purpose was to add project-level subject line functionality that might not make sense for everyone. Thanks to [Ricky Rodríguez Álvarez](https://github.com/rjrodriguezalvarez97) for the contribution.
- Adds event emission on the body element for form submission (`apostrophe-forms:submission-form`) and submission failure (`apostrophe-forms:submission-failed`). Again, thanks to Ricky Álverez for the contribution.
- Adds the option to use a custom class prefix to add classes to the form templates in addition to the `.apos-form-` classes. Thanks to [Brett Gaynor](https://github.com/bgaynor78) for the contribution.
- Adds `date` as an input type option to the string input widget.
- Updates the ESLint configuration to `eslint-config-apostrophe@3.10` and fixes linter errors.

## 1.7.1 2020-03-25

- Adds error handling to the confirmation email sending event handler.

## 1.7.0 2020-03-16

- Adds submission data from the end user to an `input` property sent to the `emailConfirmation` template. Thanks to Ricky Rodríguez Álvarez for the contribution.

## 1.6.0 2020-02-26

- Adds the option to select a more specific input type for text fields (e.g., email, password, telephone). Thanks to Jose96GIT for the contribution.

## 1.5.1 2020-01-22

- Fixes a bug where the submission notification process did not test comma-separated values property for values stored as strings.

## 1.5.0 2020-01-08

- Adds checkbox fields as an option for a conditional fieldset control.

## 1.4.2 2019-12-17

- Makes the "Query Parameter Keys" field required again following an ApostropheCMS core fix.

## 1.4.1 2019-12-17

- Returns an `email` field that had  been removed to allow sending results to multiple email addresses, but it's still needed to send messages from the app in some transports. Fixes a test.

## 1.4.0 2019-10-30

- Adds a feature to email submission notifications to make those emails conditional on another field's value. Also adds the ability to set placeholder values on text and textarea form fields.

## 1.3.1: 2019-10-02

- Removes default parameter usage. Fixes a typo in the README's default app.js configuration.

## 1.3.0: 2019-08-08

- Adds an email confirmation option post-submission. Improves error handling with message label. Arranges fields in form field widgets. Prevents `apostrophe-anchors` from adding fields to each form input widget.

## 1.2.1: 2019-07-22

- Added error handling for misconfigured email submission sending.

## 1.2.0: 2019-07-22

- Adds the conditional field group widget, availble to be triggered by boolean, select, or radio fields.
