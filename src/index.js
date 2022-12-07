import ElementTemplateChooser from './ElementTemplateChooser';
import ElementTemplateChooserEntryProvider from './ElementTemplateChooserEntryProvider';

export default {
  __init__: [
    'elementTemplateChooser',
    'elementTemplateChooserEntryProvider'
  ],
  elementTemplateChooser: [ 'type', ElementTemplateChooser ],
  elementTemplateChooserEntryProvider: [ 'type', ElementTemplateChooserEntryProvider ]
};
