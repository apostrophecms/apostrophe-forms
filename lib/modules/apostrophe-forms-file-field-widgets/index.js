module.exports = {
  extend: 'apostrophe-forms-base-field-widgets',
  label: 'File Attachment',
  construct: function(self, options) {
    self.pushAsset('script', 'lean', { when: 'lean' });
    self.sanitizeFormField = async function(req, form, widget, input, output) {
      const fileIds = self.apos.launder.ids(input[widget.fieldName]);

      if (!input[widget.fieldName] || input[widget.fieldName].length === 0) {
        output[widget.fieldName] = null;
        return;
      }

      // File IDs are stored in an array to allow multiple-file uploads.
      output[widget.fieldName] = [];

      for (let id of fileIds) {
        const info = await self.apos.attachments.db.findOne({
          _id: id
        });

        if (!info) {
          return;
        }

        output[widget.fieldName].push(self.apos.attachments.url(info, {
          size: 'original'
        }));
      }
    };
  }
};
