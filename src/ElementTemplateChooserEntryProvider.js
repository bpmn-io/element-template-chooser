import {
  getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

/**
 * A entry provider for the <element-template-chooser> popup menu.
 */
export default function ElementTemplateChooserEntryProvider(popupMenu, eventBus, translate, elementTemplates) {

  this._popupMenu = popupMenu;
  this._eventBus = eventBus;
  this._translate = translate;
  this._elementTemplates = elementTemplates;

  this.register();
}

ElementTemplateChooserEntryProvider.$inject = [
  'popupMenu',
  'eventBus',
  'translate',
  'elementTemplates'
];

/**
 * Register replace menu provider in the popup menu
 */
ElementTemplateChooserEntryProvider.prototype.register = function() {
  this._popupMenu.registerProvider('element-template-chooser', this);
};

/**
 * Adds the element templates to the replace menu.
 * @param {djs.model.Base} element
 *
 * @returns {Object}
 */
ElementTemplateChooserEntryProvider.prototype.getPopupMenuEntries = function(element) {

  // convert to object
  return this.getTemplateEntries(element).reduce((entries, [ key, value ]) => {
    entries[key] = value;

    return entries;
  }, {});

};

/**
 * Get all element templates that can be used to replace the given element.
 *
 * @param {djs.model.Base} element
 *
 * @return {Array<Object>} a list of element templates as menu entries
 */
ElementTemplateChooserEntryProvider.prototype.getTemplateEntries = function(element) {

  const eventBus = this._eventBus;
  const translate = this._translate;

  return this._getMatchingTemplates(element).map(template => {

    const {
      icon = {},
      category,
      keywords = []
    } = template;

    const entryId = `apply-template-${ template.id }`;

    return [ entryId, {
      label: template.name && translate(template.name),
      description: template.description && translate(template.description),
      documentationRef: template.documentationRef,
      imageUrl: icon.contents,
      search: keywords,
      group: category && { ...category, name: translate(category.name) },
      action: () => {
        eventBus.fire('elementTemplateChooser.chosen', { element, template });
      }
    } ];
  });
};

/**
 * Returns the templates that can the element can be replaced with.
 *
 * @param  {djs.model.Base} element
 *
 * @return {Array<ElementTemplate>}
 */
ElementTemplateChooserEntryProvider.prototype._getMatchingTemplates = function(element) {
  return this._elementTemplates.getLatest(element).filter(template => {
    return !isTemplateApplied(element, template);
  });
};


// helpers ////////////

export function isTemplateApplied(element, template) {
  const businessObject = getBusinessObject(element);

  if (businessObject) {
    return businessObject.get('modelerTemplate') === template.id;
  }

  return false;
}