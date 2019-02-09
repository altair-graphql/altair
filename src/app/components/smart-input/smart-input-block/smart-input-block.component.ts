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
  SimpleChanges
} from '@angular/core';
import { Cursor } from '../models/cursor';
import { KEYS } from '../keys';

@Component({
  selector: 'app-smart-input-block',
  templateUrl: './smart-input-block.component.html',
  styleUrls: ['./smart-input-block.component.scss'],
  preserveWhitespaces: false,
})
export class SmartInputBlockComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() block;
  @Output() inputChange = new EventEmitter();
  @Output() cursorMoveChange = new EventEmitter();

  constructor(private element: ElementRef) { }

  ngAfterViewInit() {
    this.element.nativeElement.contentEditable = true;

    // Since component is always created, we can perform all the state setting operations here for now..
    if (this.block.isFocused) {
      this.setCaretPosition(this.block.caretOffset);
      this.element.nativeElement.focus();
    }
  }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('change', changes);
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
    sel.removeAllRanges();
    sel.addRange(range);
  }

  createBlockEvent(payload) {
    return {
      value: payload,
      cursor: new Cursor(),
      isFocused: document.activeElement === this.element.nativeElement
    };
  }

  /**
   * Formats the content:
   * - replacing leading and trailing spaces with &nbsp;
   */
  formatContent(content: string) {
    return content.replace(/(^\s+|\s+$)/g, '\u00A0');
  }

  @HostListener('keydown', [ '$event' ])
  onKeydown(e: KeyboardEvent) {
    // Handle non value key events
    let cancel = false;

    if (e.metaKey || e.ctrlKey) {
      cancel = true;
    }
    switch (e.key) {
      case KEYS.BACKSPACE:
        // Handle backspace
        cancel = true;
        break;
      case KEYS.DELETE:
        // Handle forward delete
        cancel = true;
        break;
      case KEYS.LEFT:
      case KEYS.RIGHT:
      case KEYS.DOWN:
      case KEYS.UP:
      case KEYS.PAGE_UP:
      case KEYS.PAGE_DOWN:
        // Handle move cursor
        cancel = true;
        this.cursorMoveChange.next(this.createBlockEvent(e.key));
        break;
      case KEYS.END:
        // Handle move to end of line
        // With ctrl, handle move to end of last line
        cancel = true;
        this.cursorMoveChange.next(this.createBlockEvent('end'));
        break;
      case KEYS.HOME:
        // Handle move to start of line
        // With ctrl, handle move to start of first line
        cancel = true;
        this.cursorMoveChange.next(this.createBlockEvent('home'));
        break;

    }
    if (cancel) {
      event.preventDefault();
      event.stopPropagation();
    }
    console.log('key down', e, window.getSelection());
  }

  @HostListener('keypress', [ '$event' ])
  onKeyPress(e) {
    if (e.metaKey) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    console.log('keypress', e, String.fromCharCode(e.charCode));
    this.inputChange.next(this.createBlockEvent(String.fromCharCode(e.charCode)));
  }

  @HostListener('paste', [ '$event' ])
  onPaste(e) {
    // const text = e.clipboardData.getData('text/plain');
    // if (typeof text === 'string') {
    //   handler.onPaste(text);
    // }
    e.preventDefault();
    e.stopPropagation();
    console.log('paste', e);
  }

  @HostListener('compositionstart', [ '$event' ])
  onCompositionStart(e) {
    e.preventDefault();
    // handler.onTextCompositionStart();
    console.log('compositionstart', e);
  }

  @HostListener('compositionupdate', [ '$event' ])
  onCompositionUpdate(e) {
    console.log('compositionupdate', e);
  }

  @HostListener('compositionend', [ '$event' ])
  onCompositionEnd(e) {
    // handler.onTextCompositionEnd();
    // handler.onInput(event.data);
    e.preventDefault();
    e.stopPropagation();
    console.log('compositionend', e);
  }

  @HostListener('input', [ '$event' ])
  onInput(e) {
    console.log('input', e.data, this.block.content);
    e.preventDefault();
    e.stopPropagation();
  }

  @HostListener('textInput', [ '$event' ])
  onTextInput(e) {
    console.log('textInput', e);
  }

}
