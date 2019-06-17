module.exports = {
  extend: 'apostrophe-forms-select-field-widgets',
  label: 'Radio Input',
  addFields: [
    {
      name: 'options',
      label: 'Radio Input Options',
      type: 'array',
      titleField: 'label',
      required: true,
      schema: [
        {
          type: 'string',
          name: 'label',
          required: true,
          label: 'Option Label',
          help: 'The readable label displayed to users.'
        },
        {
          type: 'string',
          name: 'value',
          label: 'Option Value',
          help: 'The value saved (as text) in the database. If not entered, the label will be used.'
        }
      ]
    }
  ]
};
