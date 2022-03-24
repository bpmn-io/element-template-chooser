import './ChangeMenu.css';

import {
  html,
  render
} from 'htm/preact';

import {
  domify,
  remove as domRemove
} from 'min-dom';

import {
  useLayoutEffect,
  useRef
} from 'preact/hooks';

import clsx from 'clsx';


/**
 * A modern change / append / replace menu foundation.
 *
 * Wraps all needed structural and UX changes (i.e. positioning logic)
 * so components can build on top to do actual things.
 *
 * @param {EventBus} eventBus
 */
export default function ChangeMenu(eventBus) {

  this._container = this._createContainer({});

  eventBus.on('diagram.destroy', () => {
    this._destroy();
  });

  eventBus.on('element.changed', event => {

    const element = this._open && this._open.element;

    if (event.element === element) {
      this._refresh();
    }
  });
}

ChangeMenu.$inject = [
  'eventBus'
];

ChangeMenu.prototype._refresh = function() {

  const {
    renderFn,
    position: _position,
    className
  } = this._open;

  const position = _position && (
    (container) => this._ensureVisible(container, _position)
  );

  const onClose = result => this.close(result);

  render(html`
      <${ChangeMenuComponent}
        onClose=${ onClose }
        position=${ position }
        className=${ className }
      >
        ${ renderFn(onClose) }
      </${ChangeMenu}>
    `, this._container
  );
};

ChangeMenu.prototype.open = function(renderFn, options = {}) {

  const {
    position,
    className,
    element
  } = options;

  if (this._open) {
    this.close();
  }

  const {
    promise,
    resolve
  } = defer();

  this._open = {
    renderFn,
    promise,
    resolve,
    position,
    className,
    element
  };

  this._refresh();

  return this._open.promise;
};

ChangeMenu.prototype.close = function(result) {

  const open = this._open;

  this.reset();

  this._open = null;

  if (open) {
    open.resolve(result);
  }
};

ChangeMenu.prototype.reset = function() {
  render(null, this._container);
};

ChangeMenu.prototype._createContainer = function(config) {

  let parent = config && config.parent || 'body';

  if (typeof parent === 'string') {
    parent = document.querySelector(parent);
  }

  const container = domify('<div class="cmd-change-menu-parent"></div>');

  parent.appendChild(container);

  return container;
};

ChangeMenu.prototype._destroy = function() {
  domRemove(this._container);
};

ChangeMenu.prototype._ensureVisible = function(container, position) {
  var documentBounds = document.documentElement.getBoundingClientRect();
  var containerBounds = container.getBoundingClientRect();

  var overAxis = {},
      left = position.x,
      top = position.y;

  if (position.x + containerBounds.width > documentBounds.width) {
    overAxis.x = true;
  }

  if (position.y + containerBounds.height > documentBounds.height) {
    overAxis.y = true;
  }

  if (overAxis.x && overAxis.y) {
    left = position.x - containerBounds.width;
    top = position.y - containerBounds.height;
  } else if (overAxis.x) {
    left = position.x - containerBounds.width;
    top = position.y;
  } else if (overAxis.y && position.y < containerBounds.height) {
    left = position.x;
    top = 10;
  } else if (overAxis.y) {
    left = position.x;
    top = position.y - containerBounds.height;
  }

  return {
    x: left,
    y: top
  };
};


function ChangeMenuComponent(props) {

  const {
    children,
    onClose,
    className
  } = props;

  const overlayRef = useRef();

  useLayoutEffect(() => {

    if (typeof props.position !== 'function') {
      return;
    }

    const overlayEl = overlayRef.current;

    const position = props.position(overlayEl);

    overlayEl.style.left = `${position.x}px`;
    overlayEl.style.top = `${position.y}px`;
  }, [ overlayRef.current, props.position ]);

  return html`
    <div class=${ clsx('cmd-change-menu', className) }>
      <div class="cmd-change-menu__backdrop" onClick=${ () => onClose() }></div>
      <div class="cmd-change-menu__overlay" ref=${ overlayRef }>
        ${children}
      </div>
    </div>
  `;
}


function defer() {

  var resolve, reject;

  var promise = new Promise((_resolve, _reject) => {
    resolve = _resolve;
    reject = _reject;
  });

  return {
    promise,
    resolve,
    reject
  };
}