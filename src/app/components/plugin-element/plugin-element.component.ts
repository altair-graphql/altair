import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, Input, OnChanges } from '@angular/core';

@Component({
  selector: 'app-plugin-element',
  templateUrl: './plugin-element.component.html',
  styles: []
})
export class PluginElementComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() plugin = null;

  @ViewChild('pluginElRef') pluginElRef: ElementRef;
  pluginElement = null;

  constructor() { }

  ngOnInit() {
  }
  ngAfterViewInit() {
    const elementName = (this.plugin.sidebar_opts && this.plugin.sidebar_opts.element_name) || this.plugin.name;
    this.pluginElement = document.createElement(elementName);
    if (!this.pluginElement) {
      console.error(`Plugin "${elementName}" does not have a custom element defined!`);
      return;
    }

    this.pluginElRef.nativeElement.appendChild(this.pluginElement);
    this.renderElement();
  }
  ngOnChanges() {
    this.renderElement();
  }

  renderElement() {
    if (this.pluginElement) {
      this.pluginElement.props = {
        ...this.plugin.props,
        ctx: this.plugin.context,
      };
    }
  }

}
