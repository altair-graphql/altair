import { Cursor } from './cursor';

export interface BlockEvent {
  value: any;
  cursor: Cursor;
  isFocused: boolean;
}

export interface BlockOption {
  lineIndex: number;
  blockIndex: number;
}

export interface BlockState {
  content: string;
  isFocused?: boolean;
  caretOffset?: number;
  type?: string;
}

export interface InputLineState {
  blocks: BlockState[];
}

export interface InputState {
  lines: InputLineState[];
}
