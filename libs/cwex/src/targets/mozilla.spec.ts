// import { generateExtensionInfo, compileExtension } from './mozilla';
// import path from 'path';
// import fs from 'fs';
// import fsExtra from 'fs-extra';
// const webExtModule = require('web-ext');

// jest.useFakeTimers();

// jest.mock('path');
// jest.mock('fs');
// jest.mock('fs-extra');

// describe('mozilla target', () => {
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
//     it('should call web-ext build command with specified parameters', async () => {
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

//       expect(webExtModule.default.cmd.build).toHaveBeenCalledWith({
//         sourceDir: 'path/to/files',
//         artifactsDir: 'path/to/output',
//         overwriteDest: true,
//       });
//     });
//   });
// });
