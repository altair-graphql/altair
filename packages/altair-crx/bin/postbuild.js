import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outDir = resolve(__dirname, '..', 'dist');
// create zip file of the dist directory
const zip = new AdmZip();
zip.addLocalFolder(outDir);
zip.writeZip(resolve(__dirname, '..', 'altair.zip'));

console.log('Generated altair.zip');
