import { readFileSync } from 'fs';
import { resolve } from 'path';

export default function getAltairHtml() {
  return readFileSync(resolve(__dirname, 'dist/index.html'), 'utf8');
}
