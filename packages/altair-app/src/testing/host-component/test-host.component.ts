import { Component, OnInit, Output, EventEmitter, Input, ComponentFactoryResolver, ViewChild, } from '@angular/core';

@Component({
  selector: 'app-test-host',
  template: `<p>my test component works</p>`,
})
export class TestHostComponent implements OnInit {

  // @Input() showDialog = false;

  // @Output() toggleDialogChange = new EventEmitter();

  constructor(
    private componentFactoryResolve: ComponentFactoryResolver,
  ) { }

  ngOnInit() {}
}
