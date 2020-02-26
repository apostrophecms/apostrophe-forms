# Change log

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
