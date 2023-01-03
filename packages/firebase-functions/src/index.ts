import { applicationDefault, initializeApp } from 'firebase-admin/app';
initializeApp({
  credential: applicationDefault(),
});

export * from './api';
export * from './counters';
export * from './updatedAt';
export * from './onCreateTrigger';
