import { describe, expect, it } from '@jest/globals';
import { Text } from '@codemirror/state';
import {
  posToOffset,
  offsetToPos,
  Position,
} from './helpers';

describe('helpers', () => {
  describe('posToOffset', () => {
    it('should convert position to offset correctly', () => {
      const doc = Text.of(['line1', 'line2', 'line3']);

      expect(posToOffset(doc, new Position(0, 0))).toBe(0);
      expect(posToOffset(doc, new Position(0, 3))).toBe(3);
      expect(posToOffset(doc, new Position(1, 0))).toBe(6);
      expect(posToOffset(doc, new Position(1, 3))).toBe(9);
      expect(posToOffset(doc, new Position(2, 0))).toBe(12);
      expect(posToOffset(doc, new Position(2, 3))).toBe(15);
    });

    it('should handle empty document', () => {
      const doc = Text.of(['']);
      expect(posToOffset(doc, new Position(0, 0))).toBe(0);
    });

    it('should handle position beyond line length', () => {
      const doc = Text.of(['abc']);
      expect(posToOffset(doc, new Position(0, 10))).toBe(10);
    });

    it('should handle last line', () => {
      const doc = Text.of(['line1', 'line2']);
      expect(posToOffset(doc, new Position(1, 4))).toBe(10);
    });

    it('should handle zero character position', () => {
      const doc = Text.of(['hello', 'world']);
      expect(posToOffset(doc, new Position(0, 0))).toBe(0);
      expect(posToOffset(doc, new Position(1, 0))).toBe(6);
    });
  });

  describe('offsetToPos', () => {
    it('should convert offset to position correctly', () => {
      const doc = Text.of(['line1', 'line2', 'line3']);

      expect(offsetToPos(doc, 0)).toEqual(new Position(0, 0));
      expect(offsetToPos(doc, 3)).toEqual(new Position(0, 3));
      expect(offsetToPos(doc, 6)).toEqual(new Position(1, 0));
      expect(offsetToPos(doc, 9)).toEqual(new Position(1, 3));
      expect(offsetToPos(doc, 12)).toEqual(new Position(2, 0));
      expect(offsetToPos(doc, 15)).toEqual(new Position(2, 3));
    });

    it('should handle empty document', () => {
      const doc = Text.of(['']);
      expect(offsetToPos(doc, 0)).toEqual(new Position(0, 0));
    });

    it('should handle offset at line boundary', () => {
      const doc = Text.of(['abc', 'def']);
      expect(offsetToPos(doc, 3)).toEqual(new Position(0, 3));
      expect(offsetToPos(doc, 4)).toEqual(new Position(1, 0));
    });

    it('should handle offset at end of document', () => {
      const doc = Text.of(['abc', 'def']);
      expect(offsetToPos(doc, 7)).toEqual(new Position(1, 3));
    });

    it('should handle single character offset', () => {
      const doc = Text.of(['test']);
      expect(offsetToPos(doc, 1)).toEqual(new Position(0, 1));
    });
  });
});
