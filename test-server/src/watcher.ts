import path from 'path';
import chokidar from 'chokidar';

export const createWatcher = () => {
  return chokidar.watch(path.resolve(__dirname, './schema'));
};