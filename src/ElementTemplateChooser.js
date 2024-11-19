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
 * @param {Canvas} canvas
 */
export default function ElementTemplateChooser(
    config,
    eventBus,
    elementTemplates,
    translate,
    popupMenu,
    canvas) {

  this._eventBus = eventBus;
  this._elementTemplates = elementTemplates;
  this._translate = translate;
  this._popupMenu = popupMenu;
  this._canvas = canvas;

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
  'popupMenu',
  'canvas'
];

ElementTemplateChooser.prototype.open = function(element) {

  const popupMenu = this._popupMenu;
  const translate = this._translate;
  const eventBus = this._eventBus;
  const canvas = this._canvas;

  const restoreCanvasFocus = () => {

    // Only available with diagram-js >= 15.0.0
    if (canvas && canvas.restoreFocus) {
      canvas.restoreFocus();
    }
  };

  return new Promise((resolve, reject) => {

    const handleClosed = () => {
      reject('user-canceled');
      restoreCanvasFocus();
    };

    eventBus.once('popupMenu.close', handleClosed);

    eventBus.once('elementTemplateChooser.chosen', event => {

      const { template } = event;

      eventBus.off('popupMenu.close', handleClosed);

      resolve(template);
      restoreCanvasFocus();
    });

    popupMenu.open(element, 'element-template-chooser', { x: 0, y: 0 }, {
      title: translate('Choose element template'),
      search: true,
      width: 350
    });
  });

};