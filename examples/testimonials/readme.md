# Forms example - Testimonial
This is an example of using a form submission to automatically create a piece type in your Apostrophe 3 project.
## Installation
* Copy the `modules/@apostrophe/form` folder into your project
* Copy the `modules/testimonial` folder into your project
* Add the testimonial module to app.js as `testimonial: {},`
## Extending the form module
* `form/index.js` adds the async function `createTestimonial`, which is called on form submission.  This calls the `testimonial.addTestimony()` function to create our new testimonial piece.
## The testimonial piece
### `index.js`
The fields `names`, `emailaddress`, `phonenumber`, `testimonial` and `helpneeded` need to be matched by fields in the created form.  When the form is submitted, that data is passed to `addTestimony`, these fields build our new piece.  There are two extra fields in the `testimonial` piece type:
* `photo` - we want to be able to add a photograph of the person submitting the testimonial, but we don't want to expose our site to file uploads on this first implementation.
* `active` - this is a flag that defaults to false when the testimonial is created.  When approved by an editor or admin, changing this flag to true will allow the testimonial to appear in the display component.

Finally in this piece, we have the `latest` component which returns a list of the active testimonials.