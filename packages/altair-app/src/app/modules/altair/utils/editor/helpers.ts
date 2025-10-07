import { Text } from '@codemirror/state';
import { SyntaxNode } from '@lezer/common';

export function posToOffset(doc: Text, pos: IPosition) {
  return doc.line(pos.line + 1).from + pos.character;
}
export function offsetToPos(doc: Text, offset: number): Position {
  const line = doc.lineAt(offset);
  return new Position(line.number - 1, offset - line.from);
}

export interface IPosition {
  line: number;
  character: number;
  setLine(line: number): void;
  setCharacter(character: number): void;
  lessThanOrEqualTo(position: IPosition): boolean;
}

export class Position implements IPosition {
  constructor(
    public line: number,
    public character: number
  ) {}

  setLine(line: number) {
    this.line = line;
  }

  setCharacter(character: number) {
    this.character = character;
  }

  lessThanOrEqualTo(position: IPosition) {
    return (
      this.line < position.line ||
      (this.line === position.line && this.character <= position.character)
    );
  }
}

function pathFor(
  read: (node: SyntaxNode) => string,
  member: SyntaxNode,
  name: string
) {
  const path = [];
  for (;;) {
    const obj = member.firstChild;
    let prop;
    if (obj?.name == 'VariableName') {
      path.push(read(obj));
      return { path: path.reverse(), name };
    } else if (
      obj?.name == 'MemberExpression' &&
      (prop = obj.lastChild)?.name == 'PropertyName'
    ) {
      path.push(read(prop!));
      member = obj;
    } else {
      return null;
    }
  }
}
export const getListNodeChildren = (
  node: SyntaxNode,
  listOpen = '[',
  listClose = ']'
) => {
  const first = node.firstChild;
  if (first?.name !== listOpen) {
    return [];
  }
  let curNode = first.nextSibling;
  const children = [];
  while (curNode && curNode.name !== listClose) {
    children.push(curNode);
    curNode = curNode.nextSibling;
  }
  return children;
};
