// import { getConfig, defaultConfig } from './config';
// import { findUp } from 'find-up';
// import yaml from 'yaml';
// import fs from 'fs';

// jest.mock('find-up');
// jest.mock('yaml');
// jest.mock('fs');

// describe('config', () => {
//   describe('getConfig', () => {
//     beforeEach(() => {});
//     afterEach(() => {
//       (findUp as jest.MockedFunction<typeof findUp>).mockClear();
//     });
//     it('should return default config if config file not found', async () => {
//       const config = await getConfig();
//       expect(config).toStrictEqual(defaultConfig);
//     });

//     it('should merge config from config file with default config', async () => {
//       const configFromFile = {
//         include: ['file1', 'file2'],
//         rootDir: './new/root',
//         beforeCompile: './new/before-compile.js',
//         targets: ['new-target1', 'new-target2'],
//         exclude: ['new.exclude.pattern'],
//         manifestOptions: {
//           name: 'New test',
//         },
//       };
//       (findUp as jest.MockedFunction<typeof findUp>).mockImplementationOnce(
//         async () => {
//           return 'path/to/config/file';
//         }
//       );
//       (yaml.parse as any).mockImplementation(() => {
//         return configFromFile;
//       });
//       const config = await getConfig('path/to/config');
//       expect(config).toMatchSnapshot();
//     });
//     it('should throw an error if config file is invalid', async () => {
//       (findUp as jest.MockedFunction<typeof findUp>).mockImplementationOnce(
//         async () => {
//           return 'path/to/config/file';
//         }
//       );
//       (yaml.parse as any).mockImplementation(() => {
//         throw new Error('fake!');
//       });

//       await expect(getConfig('path/to/config')).rejects.toThrow();
//     });
//   });
// });
