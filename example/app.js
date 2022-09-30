import ZeebeModdle from 'zeebe-bpmn-moddle/resources/zeebe.json';

import ZeebeBehaviorModule from 'camunda-bpmn-js-behaviors/lib/camunda-cloud';

import {
  BpmnPropertiesPanelModule,
  BpmnPropertiesProviderModule,
  ZeebePropertiesProviderModule,
  CloudElementTemplatesPropertiesProviderModule
} from 'bpmn-js-properties-panel';

import BpmnModeler from 'bpmn-js/lib/Modeler';

import AddExporterModule from '@bpmn-io/add-exporter';

import fileDrop from 'file-drops';

import fileOpen from 'file-open';

import download from 'downloadjs';

import ElementTemplateChooserModule from '../src';

import TEMPLATES from './.camunda/element-templates/example.json';

import exampleXML from './diagram.bpmn';

import './style.css';


const url = new URL(window.location.href);

const persistent = url.searchParams.has('p');
const presentationMode = url.searchParams.has('pm');

let fileName = 'diagram.bpmn';

const initialDiagram = (() => {
  try {
    return persistent && localStorage['diagram-xml'] || exampleXML;
  } catch (err) {
    return exampleXML;
  }
})();

function hideDropMessage() {
  const dropMessage = document.querySelector('.drop-message');

  dropMessage.style.display = 'none';
}

if (persistent) {
  hideDropMessage();
}

const modeler = new BpmnModeler({
  container: '#canvas',
  additionalModules: [
    AddExporterModule,
    ElementTemplateChooserModule,
    BpmnPropertiesPanelModule,
    BpmnPropertiesProviderModule,
    ZeebePropertiesProviderModule,
    CloudElementTemplatesPropertiesProviderModule,
    ZeebeBehaviorModule
  ],
  exporter: {
    name: 'element-template-chooser-demo',
    version: '0.0.0'
  },
  keyboard: {
    bindTo: document
  },
  propertiesPanel: {
    parent: '#properties-panel'
  },
  moddleExtensions: {
    zeebe: ZeebeModdle
  }
});

modeler.on('elementTemplates.errors', event => {

  const { errors } = event;

  showTemplateErrors(errors);
});

modeler.get('elementTemplatesLoader').setTemplates(TEMPLATES);

modeler.openDiagram = function(diagram) {
  return this.importXML(diagram)
    .then(({ warnings }) => {
      if (warnings.length) {
        console.warn(warnings);
      }

      if (persistent) {
        localStorage['diagram-xml'] = diagram;
      }

      this.get('canvas').zoom('fit-viewport');
    })
    .catch(err => {
      console.error(err);
    });
};

if (presentationMode) {
  document.body.classList.add('presentation-mode');
}

function showTemplateErrors(errors) {
  console.error('Failed to parse element templates', errors);

  const errorMessage = `Failed to parse element templates:

    ${ errors.map(error => error.message).join('\n    ') }

Check the developer tools for details.`;

  document.querySelector('.error-panel pre').textContent = errorMessage;
  document.querySelector('.error-panel').classList.toggle('hidden');
}

function openFile(files) {

  // files = [ { name, contents }, ... ]

  if (!files.length) {
    return;
  }

  hideDropMessage();

  fileName = files[0].name;

  modeler.openDiagram(files[0].contents);
}

document.body.addEventListener('dragover', fileDrop('Open BPMN diagram', openFile), false);

function downloadDiagram() {
  modeler.saveXML({ format: true }, function(err, xml) {
    if (!err) {
      download(xml, fileName, 'application/xml');
    }
  });
}

document.querySelector('.error-panel .toggle').addEventListener('click', () => {
  document.querySelector('.error-panel').classList.toggle('hidden');
});

document.body.addEventListener('keydown', function(event) {
  if (event.code === 'KeyS' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();

    downloadDiagram();
  }

  if (event.code === 'KeyO' && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();

    fileOpen().then(openFile);
  }
});

document.querySelector('#download-button').addEventListener('click', function(event) {
  downloadDiagram();
});

modeler.openDiagram(initialDiagram);