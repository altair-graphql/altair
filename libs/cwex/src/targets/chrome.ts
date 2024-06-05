import fs from 'fs';
import path from 'path';
import {
  CwexConfig,
  ManifestIcons,
  ExtensionInfo,
  ExtensionCompilerOption,
  ExtensionCompiler,
  IDictionary,
  ManifestContentScriptOptions,
} from '../config.js';
import archiver from 'archiver';
import { ensureFile } from 'fs-extra';
import log from '../utils/logger.js';

const buildExtensionData = (
  config: CwexConfig
): chrome.runtime.ManifestV3 | undefined => {
  if (!config.manifestOptions) {
    return;
  }

  return {
    ...config.manifestOptions,
    manifest_version: 3,
  };
};

export const generateExtensionInfo = async (
  config: CwexConfig
): Promise<ExtensionInfo> => {
  const extensionData = buildExtensionData(config);
  return {
    content: extensionData ? JSON.stringify(extensionData, null, 2) : '',
    fileName: 'manifest.json',
    fileType: 'json',
  };
};

export const compileExtension: ExtensionCompiler = async (
  opts: ExtensionCompilerOption
) => {
  const outputPath = path.resolve(
    opts.extensionBuildOutputDir,
    opts.config.outFile ?? 'chrome.zip'
  );
  await ensureFile(outputPath);
  const output = fs.createWriteStream(outputPath);

  return new Promise((resolve, reject) => {
    // zip extension files
    const archive = archiver('zip');

    // listen for all archive data to be written
    // 'close' event is fired only when a file descriptor is involved
    output.on('close', () => {
      // log(archive.pointer() + ' total bytes');
      // log('archiver has been finalized and the output file descriptor has closed.');
      return resolve(true);
    });

    // This event is fired when the data source is drained no matter what was the data source.
    // It is not part of this library but rather from the NodeJS Stream API.
    // @see: https://nodejs.org/api/stream.html#stream_event_end
    output.on('end', () => {
      log('Data has been drained');
      return resolve(true);
    });

    // good practice to catch warnings (ie stat failures and other non-blocking errors)
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        // log warning
        log(err);
      } else {
        // throw error
        return reject(err);
      }
    });

    // good practice to catch this error explicitly
    archive.on('error', (err) => {
      return reject(err);
    });

    // pipe archive data to the file
    archive.pipe(output);

    // append files from a sub-directory, putting its contents at the root of archive
    archive.directory(opts.extensionFilesDir, false);

    // finalize the archive (ie we are done appending files but streams have to finish yet)
    // 'close', 'end' or 'finish' may be fired right after calling this method so register to them beforehand
    archive.finalize();
  });
};

export default generateExtensionInfo;
