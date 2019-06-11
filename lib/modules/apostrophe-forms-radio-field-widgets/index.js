module.exports = {
  extend: 'apostrophe-forms-select-field-widgets',
  label: 'Radio Input',
  addFields: [
    {
      name: 'options',
      label: 'Radio Input Options',
      type: 'array',
      titleField: 'optionLabel',
      required: true,
      schema: [
        {
          type: 'string',
          name: 'optionLabel',
          required: true,
          label: 'Option Label',
          help: 'The readable label displayed to users.'
        },
        {
          type: 'string',
          name: 'optionValue',
          label: 'Option Value',
          required: true,
          help: 'The value saved (as text) in the database.'
        }
      ]
    }
  ]
};
