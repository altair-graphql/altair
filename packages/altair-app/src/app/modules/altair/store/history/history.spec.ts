import { historyReducer } from './history.reducer';
import { AddHistoryAction, ADD_HISTORY, CLEAR_HISTORY, ClearHistoryAction } from './history.action';
import { HistoryState } from 'altair-graphql-core/build/types/state/history.interfaces';

jest.mock('altair-graphql-core/build/config', () => {
  return {
    getAltairConfig() {
      return {
        query_history_depth: 2,
      }
    }
  }
});
describe('history', () => {
  it('should return the state for unknown action', () => {
    const state: HistoryState = {
      list: [
        {
          query: 'query {}'
        }
      ]
    };
    const newState = historyReducer(state, { type: 'UNKNOWN' } as any);

    expect(newState).toEqual(state);
  });
  it('should return an initial state if state not specified', () => {
    const newState = historyReducer(undefined, { type: 'UNKNOWN' } as any);

    expect(newState).toEqual({ list: [] });
  });

  it(`should add history item for ${ADD_HISTORY} action`, () => {
    const state = { list: [] };
    const action = new AddHistoryAction('', { query: 'query{}' });
    const newState = historyReducer(state, action);

    expect(newState).toEqual({
      list: [
        {
          query: 'query{}'
        }
      ]
    });
  });

  it(`should remove the last history item if default limit is reached for [${ADD_HISTORY}] action`, () => {
    const state: HistoryState = {
      list: [
        {
          query: 'query B{}'
        },
        {
          query: 'query A{}'
        },
      ]
    };
    const action = new AddHistoryAction('', { query: 'query C{}' });
    const newState = historyReducer(state, action);

    expect(newState).toEqual({
      list: [
        {
          query: 'query C{}'
        },
        {
          query: 'query B{}'
        },
      ]
    });
  });

  it(`should add history item if specified limit is not reached for [${ADD_HISTORY}] action`, () => {
    const state: HistoryState = {
      list: [
        {
          query: 'query C{}'
        },
        {
          query: 'query B{}'
        },
        {
          query: 'query A{}'
        },
      ]
    };
    const action = new AddHistoryAction('', { query: 'query D{}', limit: 4 });
    const newState = historyReducer(state, action);

    expect(newState).toEqual({
      list: [
        {
          query: 'query D{}'
        },
        {
          query: 'query C{}'
        },
        {
          query: 'query B{}'
        },
        {
          query: 'query A{}'
        },
      ]
    });
  });

  it(`should remove the last history item if specified limit is reached for [${ADD_HISTORY}] action`, () => {
    const state: HistoryState = {
      list: [
        {
          query: 'query D{}'
        },
        {
          query: 'query C{}'
        },
        {
          query: 'query B{}'
        },
        {
          query: 'query A{}'
        },
      ]
    };
    const action = new AddHistoryAction('', { query: 'query E{}', limit: 4 });
    const newState = historyReducer(state, action);

    expect(newState).toEqual({
      list: [
        {
          query: 'query E{}'
        },
        {
          query: 'query D{}'
        },
        {
          query: 'query C{}'
        },
        {
          query: 'query B{}'
        },
      ]
    });
  });

  it(`should clear history items for [${CLEAR_HISTORY}] action`, () => {
    const state: HistoryState = {
      list: [
        {
          query: 'query D{}'
        },
        {
          query: 'query C{}'
        },
        {
          query: 'query B{}'
        },
        {
          query: 'query A{}'
        },
      ]
    };
    const action = new ClearHistoryAction('', {});
    const newState = historyReducer(state, action);

    expect(newState).toEqual({
      list: []
    });
  });
});
