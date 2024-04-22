// import { buildProject, buildTarget } from './build';
// import fsExtra from 'fs-extra';
// import path from 'path';
// const config = require('../config');
// const utils = require('../utils');
// const build = require('./build');

// jest.mock('fs-extra', () => {
//   return {
//     remove: jest.fn(),
//     copy: jest.fn((src, dest, opts) => opts.filter(src)),
//     outputFile: jest.fn(),
//   };
// });
// jest.mock('path', () => {
//   return {
//     resolve: jest.fn((...args) => args.join('/')),
//     basename: jest.fn(_ => _),
//     posix: {}
//   }
// });
// config.getConfig = jest.fn();
// utils.getFiles = jest.fn();
// utils.getResolvedModule = jest.fn();
// utils.getResolvedTargetModule = jest.fn();

// describe('buildTarget', () => {
//   beforeEach(() => {
//     utils.getResolvedModule.mockImplementation((path: string) => `/path/to/module/${path}`);
//     utils.getResolvedTargetModule.mockImplementation((path: string) => `/path/to/target/module/${path}`);
//   });
//   afterEach(() => {
//     utils.getResolvedModule.mockClear();
//     utils.getResolvedTargetModule.mockClear();
//     utils.getFiles.mockClear();
//   });

//   it('should do nothing if target module is not resolved (found)', async () => {
//     utils.getResolvedTargetModule.mockImplementation((path: string) => ``);
//     const generateExtensionInfo = jest.fn();
//     const compileExtension = jest.fn();
//     const _req = jest.fn((path: string) => {
//       return {
//         compileExtension,
//         generateExtensionInfo,
//       };
//     });
//     await buildTarget({
//       targets: [ 'target1' ],
//       exclude: [ 'exclude\/regex' ],
//       beforeCompile: '/path/to/before-compile-script.js',
//       include: [ 'file3', 'file4' ],
//       rootDir: '',
//       outDir: '',
//     }, 'target1', { _require: _req });
//     expect(generateExtensionInfo).not.toHaveBeenCalled();
//     expect(compileExtension).not.toHaveBeenCalled();
//   });

//   it('should run and compile extension', async () => {
//     utils.getResolvedModule.mockImplementation((path: string) => `/path/to/module/${path}`);
//     utils.getResolvedTargetModule.mockImplementation((path: string) => `/path/to/target/module/${path}`);
//     utils.getFiles.mockImplementation(() => Promise.resolve([ 'file3', 'file4' ]));
//     const generateExtensionInfo = jest.fn(() => Promise.resolve({
//       content: 'test content',
//       fileName: 'test.json',
//     }));
//     const compileExtension = jest.fn();
//     const beforeCompileScript = jest.fn();
//     const _req = jest.fn((path: string) => {
//       if (path.includes('before-compile-script.js')) {
//         return beforeCompileScript;
//       }
//       return {
//         compileExtension,
//         generateExtensionInfo,
//       };
//     });

//     await buildTarget({
//       targets: [ 'target1' ],
//       exclude: [ 'exclude\/regex' ],
//       beforeCompile: '/path/to/before-compile-script.js',
//       include: [ 'file3', 'file4' ],
//       rootDir: '',
//       outDir: '',
//     }, 'target1', { _require: _req });

//     expect(utils.getResolvedModule).toHaveBeenCalled();
//     expect(fsExtra.copy).toHaveBeenCalledWith('file3', '/target1-files/file3', expect.anything());
//     expect(fsExtra.copy).toHaveBeenCalledWith('file4', '/target1-files/file4', expect.anything());
//     expect(fsExtra.outputFile).toHaveBeenCalled();
//     expect(fsExtra.outputFile).toHaveBeenCalledWith(expect.stringMatching(/test.json$/), 'test content', 'utf8');
//   });
// });

// describe('buildProject', () => {
//   let _buildTarget: any;
//   beforeEach(() => {
//     _buildTarget = build.buildTarget;
//     build.buildTarget = jest.fn();
//   });
//   afterEach(() => {
//     build.buildTarget = _buildTarget;
//     config.getConfig.mockClear();
//   });

//   it('should run and compile extension', async () => {
//     config.getConfig.mockImplementation(() => ({
//       targets: [ 'target1' ],
//       exclude: [ 'exclude\/regex' ],
//       beforeCompile: '/path/to/before-compile-script.js',
//       outDir: 'test-out',
//       rootDir: 'root',
//     }));
//     await buildProject();
//     expect(build.buildTarget).toHaveBeenCalledWith({
//       targets: [ 'target1' ],
//       exclude: [ 'exclude\/regex' ],
//       beforeCompile: '/path/to/before-compile-script.js',
//       outDir: 'test-out',
//       rootDir: 'root',
//     }, 'target1', expect.objectContaining({
//       outDir: 'root/test-out',
//     }));
//   });

//   it('should merge target-specific config when passing config to target plugin', async () => {
//     config.getConfig.mockImplementation(() => ({
//       targets: [ 'target1' ],
//       exclude: [ 'exclude\/regex' ],
//       beforeCompile: '/path/to/before-compile-script.js',
//       outDir: 'test-out',
//       rootDir: 'root',
//       targetOptions: {
//         target1: {
//           include: [ 'target1-file1', 'target1-file2' ],
//           exclude: [ 'target1.exclude.pattern' ],
//         }
//       }
//     }));
//     // utils.getFiles.mockImplementation(() => Promise.resolve([ 'file1', 'file2' ]));
//     await buildProject();
//     expect(build.buildTarget).toHaveBeenCalledWith(expect.objectContaining({
//       targets: [ 'target1' ],
//       include: [ 'target1-file1', 'target1-file2' ],
//       exclude: [ 'target1.exclude.pattern' ],
//       beforeCompile: '/path/to/before-compile-script.js',
//       outDir: 'test-out',
//       rootDir: 'root',
//     }), 'target1', expect.objectContaining({
//       outDir: 'root/test-out',
//     }));
//   });
// });
