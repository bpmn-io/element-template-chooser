import {
  html,
  render
} from 'htm/preact';

import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'preact/hooks';

import {
  domify,
  remove as domRemove
} from 'min-dom';

import clsx from 'clsx';

import './ElementTemplateChooser.css';

import {
  isAny
} from 'bpmn-js/lib/features/modeling/util/ModelingUtil';


export default function ElementTemplateChooser(
    config,
    eventBus, elementTemplates, injector) {

  this._elementTemplates = elementTemplates;
  this._injector = injector;

  this._container = this._createContainer(config);

  eventBus.on('diagram.destroy', () => {
    this._destroy();
  });

  eventBus.on('elementTemplates.select', (event) => {

    const { element } = event;

    const templates = this._getMatchingTemplates(element);

    this.choose(templates).then(template => {
      this._updateTemplate(element, template);
    }).catch(err => {
      if (err === 'user-canceled') {
        console.log('elementTemplate.select :: user canceled');
      }

      console.error('elementTemplate.select', err);
    });
  });
}

ElementTemplateChooser.$inject = [
  'config.elementTemplateChooser',
  'eventBus',
  'elementTemplates',
  'injector'
];


ElementTemplateChooser.prototype.choose = function(templates, position) {

  return new Promise((resolve, reject) => {

    const onSelect = (template) => {
      this.reset();

      resolve(template);
    };

    const onError = (err) => {
      this.reset();

      reject(err);
    };

    const onCancel = () => {
      onError('user-canceled');
    };

    render(html`
        <${TemplateComponent}
          templates=${ templates }
          position=${ position }
          onSelect=${ onSelect }
          onError=${ onError }
          onCancel=${ onCancel }
        />
      `, this._container
    );
  });
};

ElementTemplateChooser.prototype.reset = function() {
  render(null, this._container);
};

ElementTemplateChooser.prototype._getMatchingTemplates = function(element) {
  return this._elementTemplates.getAll().filter(template => {
    return isAny(element, template.appliesTo);
  });
};

ElementTemplateChooser.prototype._updateTemplate = function(element, newTemplate) {

  const commandStack = this._injector.get('commandStack'),
        elementTemplates = this._injector.get('elementTemplates');

  const oldTemplate = elementTemplates.get(element);

  // TODO(nikku): must be `propertiesPanel.camunda.changeTemplate` for Camunda Platform 7
  commandStack.execute('propertiesPanel.zeebe.changeTemplate', {
    element: element,
    newTemplate,
    oldTemplate
  });
};

ElementTemplateChooser.prototype._createContainer = function(config) {

  let parent = config && config.parent || 'body';

  if (typeof parent === 'string') {
    parent = document.querySelector(parent);
  }

  const container = domify('<div class="bpp-element-template-chooser-parent"></div>');

  parent.appendChild(container);

  return container;
};

ElementTemplateChooser.prototype._destroy = function() {
  domRemove(this._container);
};


/**
 * A template chooser UI component
 */
function TemplateComponent(props) {

  const {
    onSelect,
    onCancel,
    position
  } = props;

  const inputRef = useRef();

  const [ value, setValue ] = useState('');

  const [ templates, setTemplates ] = useState(props.templates);
  const [ keyboardSelectedTemplate, setKeyboardSelectedTemplate ] = useState(null);
  const [ mouseSelectedTemplate, setMouseSelectedTemplate ] = useState(null);
  const [ selectedTemplate, setSelectedTemplate ] = useState(null);

  useEffect(() => {

    const filter = (template) => {
      if (!value) {
        return true;
      }

      return [ template.name, template.description || '' ].join('---').toLowerCase().includes(value.toLowerCase());
    };

    const templates = props.templates.filter(filter);

    if (!templates.includes(keyboardSelectedTemplate)) {
      setKeyboardSelectedTemplate(templates[0]);
    }

    if (!templates.includes(mouseSelectedTemplate)) {
      setMouseSelectedTemplate(null);
    }

    setTemplates(templates);
  }, [ value, keyboardSelectedTemplate, mouseSelectedTemplate, props.templates ]);


  // focus input on initial mount
  useEffect(() => {
    inputRef.current.focus();
  }, []);

  useEffect(() => {
    setSelectedTemplate(mouseSelectedTemplate || keyboardSelectedTemplate);
  }, [ keyboardSelectedTemplate, mouseSelectedTemplate ]);


  const keyboardSelect = useCallback(direction => {

    const idx = templates.indexOf(keyboardSelectedTemplate);

    let nextIdx = idx + direction;

    if (nextIdx < 0) {
      nextIdx = templates.length - 1;
    }

    if (nextIdx >= templates.length) {
      nextIdx = 0;
    }

    setKeyboardSelectedTemplate(templates[nextIdx]);
  }, [ templates, keyboardSelectedTemplate ]);

  const handleKeyDown = useCallback(event => {

    if (event.key === 'Enter' && selectedTemplate) {
      return onSelect(selectedTemplate);
    }

    if (event.key === 'Escape') {
      return onCancel();
    }

    // ARROW_UP or SHIFT + TAB navigation
    if (event.key === 'ArrowUp' || (event.key === 'Tab' && event.shiftKey)) {
      keyboardSelect(-1);

      return event.preventDefault();
    }

    // ARROW_DOWN or TAB navigation
    if (event.key === 'ArrowDown' || event.key === 'Tab') {
      keyboardSelect(1);

      return event.preventDefault();
    }

  }, [ selectedTemplate ]);

  const handleKey = useCallback((event) => {
    setValue(() => event.target.value);
  }, []);

  return html`
    <div class="bpp-element-template-chooser">
      <div class="bpp-element-template-chooser__backdrop" onClick=${ onCancel }></div>
      <div class="bpp-element-template-chooser__overlay" style=${ chooserPosition(position) }>

        <div class="bpp-element-template-chooser__search">
          <input
            ref=${ inputRef }
            placeholder="Choose task type"
            type="text"
            onKeyup=${ handleKey }
            onKeydown=${ handleKeyDown }
          />
        </div>

        <ul class="bpp-element-template-chooser__results">
          ${templates.map(template => html`
            <li
              key=${template.id}
              class=${ clsx('bpp-element-template-chooser__entry', { selected: template === selectedTemplate }) }
              onMouseEnter=${ () => setMouseSelectedTemplate(template) }
              onMouseLeave=${ () => setMouseSelectedTemplate(null) }
              onClick=${ () => onSelect(template) }
            >
              <span class="bpp-element-template-chooser__name">
                ${template.name}
              </span>
              <span class="bpp-element-template-chooser__description">
                ${template.description || ''}
              </span>
            </li>
          `)}

          ${!templates.length && html`
            <li class="bpp-element-template-chooser__muted-entry">No template found</li>
          `}
        </ul>
      </div>
    </div>
  `;
}


// helpers ////////////

function chooserPosition(position) {
  return position ? {
    left: position.x + 'px',
    top: position.y + 'px'
  } : {};
}