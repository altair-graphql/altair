import { describe } from '@jest/globals';
import { getInitialState } from './query.reducer';
import { AltairConfig, setAltairConfig } from 'altair-graphql-core/build/config';

describe('initialState', () => {
  it('should return correct initialSubscriptionRequestHandlerId', () => {
    const altairConfig = new AltairConfig({
      initialSubscriptionRequestHandlerId: 'graphql-sse',
    });
    setAltairConfig(altairConfig);

    const initialState = getInitialState();

    expect(initialState.subscriptionRequestHandlerId).toBe('graphql-sse');
  });
});
