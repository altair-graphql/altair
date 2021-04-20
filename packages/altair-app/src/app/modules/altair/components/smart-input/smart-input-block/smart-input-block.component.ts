import {
  Component,
  OnInit,
  Input,
  AfterViewInit,
  ElementRef,
  HostListener,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  HostBinding
} from '@angular/core';
import { Cursor } from '../models/cursor';
import { KEYS } from '../keys';
import { debug } from '../../../utils/logger';
import { BlockState } from '../models';

@Component({
  selector: 'app-smart-input-block',
  templateUrl: './smart-input-block.component.html',
  styleUrls: ['./smart-input-block.component.scss'],
  preserveWhitespaces: false,
})
export class SmartInputBlockComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() block: BlockState;

  @HostBinding('class.special-block') isSpecialBlock = false;

  constructor(private element: ElementRef) { }

  ngAfterViewInit() {
    // this.element.nativeElement.contentEditable = true;

    this.renderUIChanges();
  }

  ngOnInit() {
    this.isSpecialBlock = this.block && this.block.type === 'special';
  }

  renderUIChanges() {
    if (this.block.caretOffset !== null && this.block.caretOffset !== undefined) {
      this.setCaretPosition(this.block.caretOffset);
    }
    if (this.block.isFocused) {
      this.element.nativeElement.focus();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    debug.log('change', changes);
  }

  setCaretPosition(offset: number) {
    const range = document.createRange();
    const sel = window.getSelection();
    // nativeElement -> smart-input-block
    // .childNodes[0] -> span
    // .childNodes[0] -> text
    range.setStart(this.element.nativeElement
        // .childNodes[0]
        .childNodes[0], offset);
    range.collapse(true);
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  /**
   * Formats the content:
   * - replacing leading and trailing spaces with &nbsp;
   */
  formatContent(content: string) {
    return content.replace(/(^\s+|\s+$)/g, '\u00A0');
  }
}
