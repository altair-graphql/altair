// import debug from 'debug';
// import { log, setLogging } from './logger';

// jest.mock('debug', () => {
//   const mockDebugInstance = jest.fn();

//   const mockDebug = jest.fn(() => {
//     return mockDebugInstance;
//   });

//   (mockDebug as any).enable = jest.fn();
//   (mockDebug as any).disable = jest.fn();

//   return mockDebug;
// });

// describe('logger', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//   });
//   describe('log', () => {
//     it('should call debug instance with message', () => {
//       log('test message');
//       const mockDebugInstance = debug('x');
//       expect(debug).toHaveBeenCalled();
//       expect(mockDebugInstance).toHaveBeenCalledWith('test message');
//     });
//   });

//   describe('setLogging', () => {
//     it('should enable debug if true is passed', () => {
//       setLogging(true);
//       expect(debug.enable).toHaveBeenCalled();
//       expect(debug.disable).not.toHaveBeenCalled();
//     });

//     it('should disable debug if false is passed', () => {
//       setLogging(false);
//       expect(debug.disable).toHaveBeenCalled();
//       expect(debug.enable).not.toHaveBeenCalled();
//     });
//   });
// });
