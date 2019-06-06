module.exports = {
  extend: 'apostrophe-forms-base-field-widgets',
  label: 'File Attachment',
  construct: function(self, options) {
    self.pushAsset('script', 'lean', { when: 'lean' });
    self.sanitizeFormField = async function(req, widget, input, output) {
      const _id = self.apos.launder.id(input[widget.fieldName]);
      const info = await self.apos.attachments.db.findOne({ _id: _id });
      if (!info) {
        output[widget.fieldName] = null;
        return;
      }
      output[widget.fieldName] = self.apos.attachments.url(info, { size: 'original' });
    };
  }
};
