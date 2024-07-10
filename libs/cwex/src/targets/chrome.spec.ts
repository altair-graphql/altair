// import { generateExtensionInfo, compileExtension } from './chrome';
// import path from 'path';
// import fs from 'fs';
// import fsExtra from 'fs-extra';
// import archiver from 'archiver';

// jest.useFakeTimers();

// jest.mock('path');
// jest.mock('fs', () => {
//   const _on = jest.fn((ev, cb) => {
//     if (ev === 'end' || ev === 'close') {
//       setTimeout(cb, 100000);
//     }
//   });
//   return {
//     createWriteStream: jest.fn(() => ({ on: _on })),
//   };
// });
// jest.mock('fs-extra', () => {
//   return {
//     ensureFile: jest.fn(),
//   };
// });
// const _archiveDirectory = jest.fn();
// const _archive = {
//   on: jest.fn(),
//   pipe: jest.fn(),
//   directory: _archiveDirectory,
//   finalize: jest.fn(() => {
//     jest.runAllTimers();
//   }),
// };
// jest.mock('archiver', () => {
//   return jest.fn(() => _archive);
// });

// describe('chrome target', () => {
//   describe('generateExtensionInfo', () => {
//     it('should generate empty content if no manifest option', async () => {
//       const extensionInfo = await generateExtensionInfo({
//         exclude: [],
//         include: [],
//         outDir: '',
//         rootDir: '',
//         targets: [],
//       });
//       expect(extensionInfo.content).toBe('');
//       expect(extensionInfo.fileName).toBe('manifest.json');
//       expect(extensionInfo.fileType).toBe('json');
//     });

//     it('should generate the manifest content if manifest option provided', async () => {
//       const extensionInfo = await generateExtensionInfo({
//         exclude: [],
//         include: [],
//         outDir: '',
//         rootDir: '',
//         targets: [],
//         manifestOptions: {
//           name: 'Test extension',
//           version: '0.0.1',
//           background: {
//             service_worker: '',
//             scripts: [],
//           },
//           browser_action: {
//             default_icon: '',
//             default_title: '',
//             default_popup: '',
//           },
//           content_security_policy: '',
//           description: 'Test extension description',
//           icons: '',
//           offline_enabled: false,
//           page_action: {
//             default_icon: '',
//             default_title: '',
//             default_popup: '',
//           },
//           permissions: [],
//           options_ui: {
//             page: '',
//             open_in_tab: false,
//           },
//           short_name: 'Test',
//         },
//       } as any);
//       expect(extensionInfo.content).toBeTruthy();
//       expect(JSON.parse(extensionInfo.content)).toMatchSnapshot();
//       expect(extensionInfo.fileName).toBe('manifest.json');
//       expect(extensionInfo.fileType).toBe('json');
//     });
//   });

//   describe('compileExtension', () => {
//     it('should call archiver', async () => {
//       await compileExtension({
//         config: {
//           exclude: [],
//           include: [],
//           outDir: '',
//           rootDir: '',
//           targets: [],
//         },
//         extensionBuildOutputDir: 'path/to/output',
//         extensionFilesDir: 'path/to/files',
//       });

//       expect(archiver).toHaveBeenCalledWith('zip');
//       expect(path.resolve).toHaveBeenCalledWith('path/to/output', 'chrome.zip');
//       expect(_archiveDirectory).toHaveBeenCalledWith('path/to/files', false);
//     });
//     it('should throw an error if something fails', async () => {
//       _archive.on.mockImplementation((ev, cb) => {
//         if (ev === 'error') {
//           throw new Error('fake!');
//         }
//       });
//       await expect(
//         compileExtension({
//           config: {
//             exclude: [],
//             include: [],
//             outDir: '',
//             rootDir: '',
//             targets: [],
//           },
//           extensionBuildOutputDir: 'path/to/output',
//           extensionFilesDir: 'path/to/files',
//         })
//       ).rejects.toThrowError();
//     });
//   });
// });
