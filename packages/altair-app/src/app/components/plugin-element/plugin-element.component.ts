import { Component, ViewChild, ElementRef, Input, OnChanges } from '@angular/core';
import { debug } from 'app/utils/logger';
import { PluginComponentData, PluginElement } from 'app/services/plugin/plugin';

@Component({
  selector: 'app-plugin-element',
  templateUrl: './plugin-element.component.html',
  styles: []
})
export class PluginElementComponent implements OnChanges {

  @Input() pluginData?: PluginComponentData;

  @ViewChild('pluginElRef', { static: true }) pluginElRef: ElementRef;
  pluginElement: PluginElement;

  isAppended = false;

  constructor() { }

  ngOnChanges() {
    if (!this.isAppended && this.pluginData && this.pluginData.isActive) {
      this.appendPluginElement();
    }
    this.renderElement();
  }

  appendPluginElement() {
    if (this.pluginData) {
      const elementName = (this.pluginData.sidebar_opts && this.pluginData.sidebar_opts.element_name) || this.pluginData.name;
      this.pluginElement = document.createElement(elementName);
      if (!this.pluginElement) {
        debug.error(`Plugin "${elementName}" does not have a custom element defined!`);
        return;
      }

      this.pluginElRef.nativeElement.appendChild(this.pluginElement);
      this.isAppended = true;
    }
  }
  renderElement() {
    if (this.pluginElement && this.pluginData) {
      this.pluginElement.props = this.pluginData.props;
    }
  }

}
