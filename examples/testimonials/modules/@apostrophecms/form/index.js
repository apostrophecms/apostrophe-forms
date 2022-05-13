// Extends form object to capture submission events and
// automagically create other piece types
module.exports = {
    handlers (self) {
        return {
            submission: {
                async createTestimonial (req, form, data) {
                    self.apos.modules.testimonial.addTestimony(req, data)
                }    
            }
        }
    }
}