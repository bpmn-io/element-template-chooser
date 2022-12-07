import './ElementTemplateChooser.css';


/**
 * An element template chooser that hooks into
 * properties panel fired "choose template" events.
 *
 * @param {Object} config
 * @param {EventBus} eventBus
 * @param {ElementTemplates} elementTemplates
 * @param {Translate} translate
 * @param {PopupMenu} popupMenu
 */
export default function ElementTemplateChooser(
    config,
    eventBus,
    elementTemplates,
    translate,
    popupMenu) {

  this._eventBus = eventBus;
  this._elementTemplates = elementTemplates;
  this._translate = translate;
  this._popupMenu = popupMenu;

  const enableChooser = !config || config.elementTemplateChooser !== false;

  enableChooser && eventBus.on('elementTemplates.select', (event) => {

    const { element } = event;

    this.open(element).then(template => {
      elementTemplates.applyTemplate(element, template);
    }).catch(err => {
      if (err !== 'user-canceled') {
        console.error('elementTemplate.select :: error', err);
      }
    });
  });
}

ElementTemplateChooser.$inject = [
  'config.connectorsExtension',
  'eventBus',
  'elementTemplates',
  'translate',
  'popupMenu'
];

ElementTemplateChooser.prototype.open = function(element) {

  const popupMenu = this._popupMenu;
  const translate = this._translate;
  const eventBus = this._eventBus;

  return new Promise((resolve, reject) => {

    const handleClosed = () => reject('user-canceled');

    eventBus.once('popupMenu.close', handleClosed);

    eventBus.once('elementTemplateChooser.chosen', event => {

      const { template } = event;

      eventBus.off('popupMenu.close', handleClosed);

      resolve(template);
    });

    popupMenu.open(element, 'element-template-chooser', { x: 0, y: 0 }, {
      title: translate('Choose element template'),
      search: true,
      width: 350
    });
  });

};