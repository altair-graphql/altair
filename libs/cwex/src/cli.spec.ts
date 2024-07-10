// import commander from 'commander';
// import { buildProject } from './index';

// jest.mock('./index');
// jest.mock('commander', () => {

//   const commandInstance = {} as any;
//   const commandInstanceMethod = jest.fn(() => commandInstance);
//   commandInstance.command = commandInstanceMethod;
//   commandInstance.description = commandInstanceMethod;
//   commandInstance.option = commandInstanceMethod;
//   commandInstance.action = jest.fn(cb => cb({}) || commandInstance);
//   commandInstance.parse = commandInstanceMethod;

//   return {
//     Command: jest.fn(() => {
//       return commandInstance;
//     })
//   };
// });

// describe('cli', () => {
//   it('executes successfully', () => {
//     require('./cli');
//   });
// });
