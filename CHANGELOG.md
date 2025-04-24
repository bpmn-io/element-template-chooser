# Changelog

All notable changes to [@bpmn-io/element-template-chooser](https://github.com/camunda/element-template-chooser) are documented here. We use [semantic versioning](http://semver.org/) for releases.

## Unreleased

___Note:__ Yet to be released changes appear here._

## 1.1.1

_Reverts `v1.1.0` due to breaking changes._

## 1.1.0

* `FEAT`: forward keywords to make them searchable ([#24](https://github.com/bpmn-io/element-template-chooser/pull/24))
* `DEPS`: update peer to `diagram-js@15.3.0`

## 1.0.0

* `FEAT`: use modern popup menu foundations
* `DEPS`: update to `bpmn-js@11`

### Breaking Changes

* API changed to `ElementTemplateChooser.open(element) => Promise<Template>`

## 0.1.0

* `DEPS`: bump dependencies

## 0.0.5

* `FEAT`: support `icon`
* `FEAT`: support `documentationRef`

## 0.0.4

* `FEAT`: improve mixed keyboard + mouse interaction
* `FEAT`: support categories and search ([#5](https://github.com/bpmn-io/element-template-chooser/issues/5))
* `FIX`: corrent scroll to element not working on Firefox ([#10](https://github.com/bpmn-io/element-template-chooser/issues/10))

## 0.0.3

* `FIX`: correct chooser title

## 0.0.2

* `FEAT`: update styles
* `FEAT`: provide pre-built distribution + styles ([#1](https://github.com/bpmn-io/element-template-chooser/issues/1))
* `FEAT`: make agnostic of `elementTemplates` implementation ([#2](https://github.com/bpmn-io/element-template-chooser/issues/2))
* `FIX`: scroll to keyboard selected entries ([#6](https://github.com/bpmn-io/element-template-chooser/issues/6))
* `CHORE`: change programmatic API

## 0.0.1

_Initial release._
