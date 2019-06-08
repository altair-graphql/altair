import { Component, OnInit, AfterViewInit, HostListener, ElementRef } from '@angular/core';
import { KEYS } from '../keys';
import { Cursor } from '../models/cursor';
import { debug } from '../../../utils/logger';
import { InputState, BlockEvent, BlockState } from '../models';


const VARIABLE_STRUCT = {
  open: '{{',
  close: '}}'
};

@Component({
  selector: 'app-smart-input',
  templateUrl: './smart-input.component.html',
  styleUrls: ['./smart-input.component.scss'],
  preserveWhitespaces: false,
})
export class SmartInputComponent implements OnInit, AfterViewInit {
  state: InputState = {
    lines: [
      {
        blocks: [
          { content: 'some ', isFocused: false, caretOffset: 0 },
          { type: 'some-class', content: 'other' },
          { content: ' content' },
        ]
      }
    ]
  };

  constructor(private element: ElementRef) { }

  ngAfterViewInit() {
    this.element.nativeElement.contentEditable = true;
  }

  ngOnInit() {
  }

  getBlockInfoFromData(data: BlockEvent) {
    const curBlockEl = data.cursor.selection.focusNode.parentElement;
    const lineIndex = +curBlockEl.getAttribute('data-line-index');
    const blockIndex = +curBlockEl.getAttribute('data-block-index');

    return { curBlockEl, lineIndex, blockIndex };
  }

  createNewBlock(data: BlockState): BlockState {
    return {
      content: data.content || '',
      isFocused: data.isFocused || false,
      caretOffset: data.caretOffset || null,
      type: data.type || '',
    };
  }
  getBlock({ lineIndex, blockIndex }) {
    return this.state.lines[lineIndex].blocks[blockIndex];
  }
  updateBlock(data: BlockState, { lineIndex, blockIndex }) {
    debug.log('updating..', data, lineIndex, blockIndex);
    this.state.lines[lineIndex].blocks = this.state.lines[lineIndex].blocks.map((block, i) => {
      if (i === blockIndex) {
        return { ...block, ...data };
      }

      if (data.isFocused) {
        // If this is not the block but isFocused is set for the chosen block,
        // then remove isFocused from all other blocks
        block.isFocused = false;
      }

      return block;
    });
  }

  replaceBlock(newBlocks: BlockState[], { lineIndex, blockIndex }) {
    const beforeBlocks = this.state.lines[lineIndex].blocks.slice(0, blockIndex);
    const afterBlocks = this.state.lines[lineIndex].blocks.slice(blockIndex + 1);
    this.state.lines[lineIndex].blocks = [ ...beforeBlocks, ...newBlocks, ...afterBlocks ];
  }

  deleteBlock(data, { lineIndex, blockIndex }) {
    this.state.lines[lineIndex].blocks = this.state.lines[lineIndex].blocks.filter((block, i) => {
      return i !== blockIndex;
    })
  }

  onBlockInput(data: BlockEvent) {
    debug.log(data);
    const { curBlockEl, lineIndex, blockIndex } = this.getBlockInfoFromData(data);
    const curBlock = this.getBlock({ lineIndex, blockIndex });
    const originalContent = curBlock.content;
    const output = [originalContent.slice(0, data.cursor.offset), data.value, originalContent.slice(data.cursor.offset)].join('');
    curBlock.content = output;
    curBlock.isFocused = data.isFocused;
    curBlock.caretOffset = data.cursor.offset + data.value.length;

    if (output.slice(curBlock.caretOffset - VARIABLE_STRUCT.open.length, curBlock.caretOffset) === VARIABLE_STRUCT.open) {
      // before - variable - after
      const beforeContent = output.slice(0, curBlock.caretOffset - 2);
      const afterContent = output.slice(curBlock.caretOffset);
      const variableContent = [VARIABLE_STRUCT.open, VARIABLE_STRUCT.close].join('');

      const newBlocks = [
        this.createNewBlock({
          content: beforeContent,
          isFocused: false
        }),
        this.createNewBlock({
          content: variableContent,
          caretOffset: VARIABLE_STRUCT.open.length,
          isFocused: true,
          type: 'special'
        }),
        this.createNewBlock({
          content: afterContent,
          isFocused: false
        }),
      ].filter(x => !!x.content);

      return this.replaceBlock(newBlocks, { lineIndex, blockIndex });
    }

    return this.updateBlock(curBlock, { lineIndex, blockIndex });
  }

  onBlockBackspace(data: BlockEvent) {
    const { curBlockEl, lineIndex, blockIndex } = this.getBlockInfoFromData(data);
    const curBlock = this.getBlock({ lineIndex, blockIndex });
    const previousBlock = this.getBlock({ lineIndex, blockIndex: blockIndex - 1 });
    const originalContent = curBlock.content;
    if (data.cursor.offset) {
      const output = [originalContent.slice(0, data.cursor.offset - 1), originalContent.slice(data.cursor.offset)].join('');
      curBlock.content = output;
      curBlock.isFocused = data.isFocused;
      curBlock.caretOffset = data.cursor.offset - 1;

      return this.updateBlock(curBlock, { lineIndex, blockIndex });
    }

    // Merge with previous block
    if (previousBlock) {
      // If previous is a special block, remove it instead.
      if (previousBlock.type === 'special') {
        return this.deleteBlock(null, { lineIndex, blockIndex: blockIndex - 1 });
      }

      previousBlock.caretOffset = previousBlock.content.length - 1;
      previousBlock.content = [previousBlock.content.slice(0, -1), curBlock.content].join('');
      previousBlock.isFocused = data.isFocused;
      // Delete curBlock
      this.deleteBlock(null, { lineIndex, blockIndex });
      return this.updateBlock(previousBlock, { lineIndex, blockIndex: blockIndex - 1 });
    }
  }

  onBlockMoveCursor(data: BlockEvent) {
    debug.log('ok', data);
    const { curBlockEl, lineIndex, blockIndex } = this.getBlockInfoFromData(data);
    switch (data.value) {
      case KEYS.UP:
        // Handle up
        const curLine = this.state.lines[lineIndex - 1];
        // if (curLine) {
        //   const curBlock = curLine.blocks[blockIndex]
        //   if (curBlock) {
        //     cur
        //   }
        // }
        return;
      case KEYS.LEFT: {
        const curBlock = this.getBlock({ lineIndex, blockIndex });
        const previousBlock = this.getBlock({ lineIndex, blockIndex: blockIndex - 1 });
        if (data.cursor.offset) {
          curBlock.caretOffset = data.cursor.offset - 1;
          curBlock.isFocused = data.isFocused;
          return this.updateBlock(curBlock, { lineIndex, blockIndex });
        }
        if (previousBlock) {
          previousBlock.caretOffset = previousBlock.content.length - 1;
          previousBlock.isFocused = data.isFocused;
          return this.updateBlock(previousBlock, { lineIndex, blockIndex: blockIndex - 1 });
        }
        return;
      }
      case KEYS.RIGHT: {
        const curBlock = this.getBlock({ lineIndex, blockIndex });
        const nextBlock = this.getBlock({ lineIndex, blockIndex: blockIndex + 1 });
        if (data.cursor.offset < curBlock.content.length) {
          curBlock.caretOffset = data.cursor.offset + 1;
          curBlock.isFocused = data.isFocused;
          return this.updateBlock(curBlock, { lineIndex, blockIndex });
        }
        if (nextBlock) {
          nextBlock.caretOffset = 1;
          nextBlock.isFocused = data.isFocused;
          return this.updateBlock(nextBlock, { lineIndex, blockIndex: blockIndex + 1 });
        }
        return;
      }
      default:
        return;
    }
  }


  setCaretPosition(offset: number) {
    const range = document.createRange();
    const sel = window.getSelection();
    // nativeElement -> smart-input-block
    // .childNodes[0] -> text
    range.setStart(
      this.element.nativeElement
        .childNodes[0],
      offset
    );
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
        this.onBlockBackspace(this.createBlockEvent(e.key));
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
        this.onBlockMoveCursor(this.createBlockEvent(e.key));
        break;
      case KEYS.END:
        // Handle move to end of line
        // With ctrl, handle move to end of last line
        cancel = true;
        this.onBlockMoveCursor(this.createBlockEvent('end'));
        break;
      case KEYS.HOME:
        // Handle move to start of line
        // With ctrl, handle move to start of first line
        cancel = true;
        this.onBlockMoveCursor(this.createBlockEvent('home'));
        break;

    }
    if (cancel) {
      event.preventDefault();
      event.stopPropagation();
    }
    debug.log('key down', e, window.getSelection());
  }

  @HostListener('keypress', [ '$event' ])
  onKeyPress(e) {
    if (e.metaKey) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    debug.log('keypress', e, String.fromCharCode(e.charCode));
    this.onBlockInput(this.createBlockEvent(String.fromCharCode(e.charCode)));
  }

  @HostListener('paste', [ '$event' ])
  onPaste(e) {
    // const text = e.clipboardData.getData('text/plain');
    // if (typeof text === 'string') {
    //   handler.onPaste(text);
    // }
    e.preventDefault();
    e.stopPropagation();
    debug.log('paste', e);
  }

  @HostListener('compositionstart', [ '$event' ])
  onCompositionStart(e) {
    e.preventDefault();
    // handler.onTextCompositionStart();
    debug.log('compositionstart', e);
  }

  @HostListener('compositionupdate', [ '$event' ])
  onCompositionUpdate(e) {
    debug.log('compositionupdate', e);
  }

  @HostListener('compositionend', [ '$event' ])
  onCompositionEnd(e) {
    // handler.onTextCompositionEnd();
    // handler.onInput(event.data);
    e.preventDefault();
    e.stopPropagation();
    debug.log('compositionend', e);
  }

  @HostListener('input', [ '$event' ])
  onInput(e) {
    debug.log('input', e.data);
    e.preventDefault();
    e.stopPropagation();
  }

  @HostListener('textInput', [ '$event' ])
  onTextInput(e) {
    debug.log('textInput', e);
  }

  trackByIndex(index) {
    return index;
  }

}
