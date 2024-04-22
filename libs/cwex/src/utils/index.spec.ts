// import { getFiles, getResolvedModule, getResolvedTargetModule } from './index';
// import globby from 'globby';
// jest.mock('globby');
// const utils = require('./index');

// describe('getFiles', () => {
//   beforeEach(() => {
//     (globby as any).mockClear();
//   });

//   it('should call globby with the passed arguments', async () => {
//     await getFiles([ 'pattern1', 'pattern2' ], {});
//     expect(globby).toHaveBeenCalled();
//     expect(globby).toHaveBeenCalledWith([ 'pattern1', 'pattern2' ], {});
//   });
// });

// describe('getResolvedModule', () => {
//   let _reqResolve = require.resolve;
//   beforeEach(() => {
//     _reqResolve = require.resolve;
//     require.resolve = jest.fn() as any;
//   });
//   afterEach(() => {
//     require.resolve = _reqResolve;
//   });

//   it('should call require.resolve with specified path', () => {
//     const res = getResolvedModule('module/path', { resolver: require.resolve });
//     expect(require.resolve).toHaveBeenCalled();
//     expect(require.resolve).toHaveBeenCalledWith('module/path');
//   });

//   it('should return the resolved path', () => {
//     require.resolve = jest.fn(() => 'resolved/module/path') as any;
//     const res = getResolvedModule('module/path', { resolver: require.resolve });
//     expect(require.resolve).toHaveBeenCalled();
//     expect(res).toBe('resolved/module/path');
//   });

//   it('should return empty string if module not found', () => {
//     require.resolve = jest.fn(() => {
//       throw new Error('fake!');
//     }) as any;
//     const res = getResolvedModule('module/path', { resolver: require.resolve });
//     expect(require.resolve).toHaveBeenCalled();
//     expect(res).toBe('');
//   });
// });

// describe('getResolvedTargetModule', () => {
//   beforeEach(() => {
//     utils.getResolvedModule = jest.fn();
//   });
//   afterEach(() => {
//     utils.getResolvedModule.mockClear();
//   });

//   it('should call getResolvedModule with modified path', () => {
//     getResolvedTargetModule('module/path');
//     expect(utils.getResolvedModule).toHaveBeenCalled();
//     expect(utils.getResolvedModule).toHaveBeenCalledWith('../targets/module/path', expect.anything());
//   });
// });
