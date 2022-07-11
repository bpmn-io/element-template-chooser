import {
  html
} from 'htm/preact';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState
} from 'preact/hooks';

import {
  scrollIntoView,
  sanitizeImageUrl
} from '../utils';

import {
  ChangeMenuResult
} from '../common';

import {
  isAny
} from 'bpmn-js/lib/util/ModelUtil';

import clsx from 'clsx';

import './ElementTemplateChooser.css';


/**
 * An element template chooser that hooks into
 * properties panel fired "choose template" events.
 *
 * @param {Object} config
 * @param {EventBus} eventBus
 * @param {ElementTemplates} elementTemplates
 * @param {ChangeMenu} changeMenu
 */
export default function ElementTemplateChooser(
    config,
    eventBus,
    elementTemplates,
    changeMenu) {

  this._changeMenu = changeMenu;
  this._elementTemplates = elementTemplates;

  const enableChooser = !config || config.elementTemplateChooser !== false;

  enableChooser && eventBus.on('elementTemplates.select', (event) => {

    const { element } = event;

    const templates = this._getMatchingTemplates(element);

    this.open(templates).then(template => {
      this._applyTemplate(element, template);
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
  'changeMenu'
];

ElementTemplateChooser.prototype._applyTemplate = function(element, newTemplate) {
  this._elementTemplates.applyTemplate(element, newTemplate);
};

ElementTemplateChooser.prototype._getMatchingTemplates = function(element) {
  return this._elementTemplates.getAll().filter(template => {
    return isAny(element, template.appliesTo);
  });
};

ElementTemplateChooser.prototype._toEntries = function(templates) {

  return templates.map(template => {

    const {
      icon = {}
    } = template;

    return {
      ...template,
      imageUrl: sanitizeImageUrl(icon.contents)
    };
  });
};

ElementTemplateChooser.prototype.open = function(templates) {

  const renderFn = (onClose) => html`
    <${TemplateComponent}
      entries=${ this._toEntries(templates) }
      onClose=${ onClose }
    />
  `;

  return this._changeMenu.open(renderFn, {
    className: 'cmd-element-template-chooser'
  });
};


function TemplateComponent(props) {

  const {
    onClose
  } = props;

  const inputRef = useRef();
  const resultsRef = useRef();

  const [ value, setValue ] = useState('');

  const [ templates, setTemplates ] = useState(props.entries);
  const [ selectedTemplate, setSelectedTemplate ] = useState(templates[0]);

  useEffect(() => {

    const filter = (template) => {
      if (!value) {
        return true;
      }

      return [
        template.name,
        template.description || '',
        template.search || ''
      ].join('---').toLowerCase().includes(value.toLowerCase());
    };

    const templates = props.entries.filter(filter);

    if (!templates.includes(selectedTemplate)) {
      setSelectedTemplate(templates[0]);
    }

    setTemplates(templates);
  }, [ value, selectedTemplate, props.entries ]);

  // focus input on initial mount
  useLayoutEffect(() => {
    inputRef.current.focus();
  }, []);

  // scroll to keyboard selected result
  useLayoutEffect(() => {

    const containerEl = resultsRef.current;

    const selectedEl = containerEl.querySelector('.selected');

    if (selectedEl) {
      scrollIntoView(selectedEl);
    }
  }, [ selectedTemplate ]);

  const keyboardSelect = useCallback(direction => {

    const idx = templates.indexOf(selectedTemplate);

    let nextIdx = idx + direction;

    if (nextIdx < 0) {
      nextIdx = templates.length - 1;
    }

    if (nextIdx >= templates.length) {
      nextIdx = 0;
    }

    setSelectedTemplate(templates[nextIdx]);
  }, [ templates, selectedTemplate ]);

  const handleKeyDown = useCallback(event => {

    if (event.key === 'Enter' && selectedTemplate) {
      return onClose(selectedTemplate);
    }

    if (event.key === 'Escape') {
      return onClose();
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

  }, [ selectedTemplate, keyboardSelect ]);

  const handleKey = useCallback((event) => {
    setValue(() => event.target.value);
  }, []);

  return html`
    <div class="cmd-change-menu__header">
      <h3 class="cmd-change-menu__title">
        Choose element template
      </h3>
    </div>

    <div class="cmd-change-menu__body">
      <div class=${ clsx('cmd-change-menu__search', { hidden: props.entries.length < 5 }) }>
        <svg class="cmd-change-menu__search-icon" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" clip-rule="evenodd" d="M9.0325 8.5H9.625L13.3675 12.25L12.25 13.3675L8.5 9.625V9.0325L8.2975 8.8225C7.4425 9.5575 6.3325 10 5.125 10C2.4325 10 0.25 7.8175 0.25 5.125C0.25 2.4325 2.4325 0.25 5.125 0.25C7.8175 0.25 10 2.4325 10 5.125C10 6.3325 9.5575 7.4425 8.8225 8.2975L9.0325 8.5ZM1.75 5.125C1.75 6.9925 3.2575 8.5 5.125 8.5C6.9925 8.5 8.5 6.9925 8.5 5.125C8.5 3.2575 6.9925 1.75 5.125 1.75C3.2575 1.75 1.75 3.2575 1.75 5.125Z" fill="#22242A"/>
        </svg>

        <input
          ref=${ inputRef }
          type="text"
          onKeyup=${ handleKey }
          onKeydown=${ handleKeyDown }
        />
      </div>

      <ul class="cmd-change-menu__results" ref=${ resultsRef }>
        ${ templates.map((template, idx) => html`

          <${ChangeMenuResult}
            key=${ template.id }
            template=${ template }
            lastTemplate=${ templates[idx - 1] }
            selected=${ template === selectedTemplate }
            onMouseEnter=${ () => setSelectedTemplate(template) }
            onClick=${ () => onClose(template) }
          />

        `) }

        ${ !templates.length && html`
          <li class="cmd-change-menu__muted-entry">No template found</li>
        `}
      </ul>
    </div>
  `;
}
