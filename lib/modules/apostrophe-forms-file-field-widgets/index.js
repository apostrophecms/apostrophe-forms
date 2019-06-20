module.exports = {
  extend: 'apostrophe-forms-base-field-widgets',
  label: 'File Attachment',
  construct: function(self, options) {
    self.pushAsset('script', 'lean', { when: 'lean' });
    self.sanitizeFormField = async function(req, form, widget, input, output) {
      const fileIds = input[widget.fieldName].split(',');
      // File IDs are stored in an array to allow multiple-file uploads.
      output[widget.fieldName] = [];

      fileIds.forEach(async fileId => {
        const _id = self.apos.launder.id(fileId);
        const info = await self.apos.attachments.db.findOne({ _id: _id });

        if (!info) {
          return;
        }

        output[widget.fieldName].push(self.apos.attachments.url(info, {
          size: 'original'
        }));
      });
    };
  }
};
