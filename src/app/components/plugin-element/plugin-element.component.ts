import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, Input, OnChanges } from '@angular/core';
import { debug } from 'app/utils/logger';
import { PluginComponentData } from 'app/services/plugin/plugin';

@Component({
  selector: 'app-plugin-element',
  templateUrl: './plugin-element.component.html',
  styles: []
})
export class PluginElementComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() pluginData: PluginComponentData | undefined;

  @ViewChild('pluginElRef', { static: true }) pluginElRef: ElementRef;
  pluginElement: HTMLElement;

  constructor() { }

  ngOnInit() {
  }
  ngAfterViewInit() {
    if (!this.pluginData) {
      return;
    }
    const elementName = (this.pluginData.sidebar_opts && this.pluginData.sidebar_opts.element_name) || this.pluginData.name;
    this.pluginElement = document.createElement(elementName);
    if (!this.pluginElement) {
      debug.error(`Plugin "${elementName}" does not have a custom element defined!`);
      return;
    }

    this.pluginElRef.nativeElement.appendChild(this.pluginElement);
    this.renderElement();
  }
  ngOnChanges() {
    this.renderElement();
  }

  renderElement() {
    if (this.pluginElement && this.pluginData) {
      this.pluginElement['props'] = {
        ...this.pluginData.props,
        ctx: this.pluginData.context,
      };
    }
  }

}
