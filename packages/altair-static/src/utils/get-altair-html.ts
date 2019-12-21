import { readFileSync } from 'fs';
import { resolve } from 'path';
import { getDistDirectory } from './get-dist';

export default function getAltairHtml() {
  return readFileSync(resolve(getDistDirectory(), 'index.html'), 'utf8');
}
