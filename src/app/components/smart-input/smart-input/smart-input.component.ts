import { Component, OnInit, AfterViewInit, HostListener, ElementRef } from '@angular/core';
import { KEYS } from '../keys';

@Component({
  selector: 'app-smart-input',
  templateUrl: './smart-input.component.html',
  styleUrls: ['./smart-input.component.scss'],
  preserveWhitespaces: false,
})
export class SmartInputComponent implements OnInit, AfterViewInit {
  state = {
    lines: [
      {
        blocks: [
          { content: 'some ', isFocused: false, caretOffset: 0 },
          { element: 'span', class: 'some-class', content: 'other' },
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

  updateBlock(data, { lineIndex, blockIndex }) {
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
    })
  }

  onBlockInput(data, { lineIndex, blockIndex }) {
    console.log(data);
    const curBlock = this.state.lines[lineIndex].blocks[blockIndex];
    const originalContent = curBlock.content;
    const output = [originalContent.slice(0, data.cursor.offset), data.value, originalContent.slice(data.cursor.offset)].join('');
    curBlock.content = output;
    curBlock.isFocused = data.isFocused;
    curBlock.caretOffset = data.cursor.offset + data.value.length;

    this.updateBlock(curBlock, { lineIndex, blockIndex });
  }

  onBlockMoveCursor(data, { lineIndex, blockIndex }) {
    console.log('ok', data);
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
        const curBlock = this.state.lines[lineIndex].blocks[blockIndex];
        const previousBlock = this.state.lines[lineIndex].blocks[blockIndex - 1];
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
        const curBlock = this.state.lines[lineIndex].blocks[blockIndex];
        const nextBlock = this.state.lines[lineIndex].blocks[blockIndex + 1];
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

  @HostListener('keydown', [ '$event' ])
  onKeydown(e) {
    // var cancel = false;
    // 	if(event.keyCode === 8) {
    // 		handler.onBackspace();
    // 		cancel = true;
    // 	}
    // 	if(event.keyCode === 46) {
    // 		handler.onDelete();
    // 		cancel = true;
    // 	}
    // 	if(event.metaKey && metaShortcutKeys.indexOf(event.keyCode) !== -1) {
    // 		handler.onMetaShortcut(event.keyCode);
    // 		cancel = true;
    // 	}
    // 	if(cancel) {
    // 		event.preventDefault();
    // 		event.stopPropagation();
    // 	}
    // e.preventDefault();
    // e.stopPropagation();
    console.log('key down', e, window.getSelection());
  }

  @HostListener('keypress', [ '$event' ])
  onKeyPress(e) {
    if (e.metaKey) {
      return;
    }
    // var keychar = String.fromCharCode(event.charCode);
    // handler.onInput(keychar);
    // e.preventDefault();
    // e.stopPropagation();
    console.log('keypress', e);
  }

  @HostListener('paste', [ '$event' ])
  onPaste(e) {
    // const text = e.clipboardData.getData('text/plain');
    // if (typeof text === 'string') {
    //   handler.onPaste(text);
    // }
    // e.preventDefault();
    // e.stopPropagation();
    console.log('paste', e);
  }

  @HostListener('compositionstart', [ '$event' ])
  onCompositionStart(e) {
    // e.preventDefault();
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
    // e.preventDefault();
    // e.stopPropagation();
    console.log('compositionend', e);
  }

  @HostListener('input', [ '$event' ])
  onInput(e) {
    console.log('input', e.data);
    // e.preventDefault();
    // e.stopPropagation();
  }

  @HostListener('textInput', [ '$event' ])
  onTextInput(e) {
    console.log('textInput', e);
  }
}
