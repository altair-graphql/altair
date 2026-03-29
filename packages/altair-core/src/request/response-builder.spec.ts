import { describe, expect, it } from 'vitest';
import { buildResponse } from './response-builder';
import { QueryResponse } from '../types/state/query.interfaces';
import { MultiResponseStrategy } from './types';

const responseChunks: QueryResponse[] = [
  {
    content:
      '{"data":{"hello":"Hello world","alphabet":[],"fastField":"This field resolves fast! ⚡️"},"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["a"],"path":["alphabet",0]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["b"],"path":["alphabet",1]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["c"],"path":["alphabet",2]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["d"],"path":["alphabet",3]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["e"],"path":["alphabet",4]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"data":{"slowField":"This field resolves slowly after 5000ms ⏳"},"path":[]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["f"],"path":["alphabet",5]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["g"],"path":["alphabet",6]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["h"],"path":["alphabet",7]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["i"],"path":["alphabet",8]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["j"],"path":["alphabet",9]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["k"],"path":["alphabet",10]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["l"],"path":["alphabet",11]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["m"],"path":["alphabet",12]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["n"],"path":["alphabet",13]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["o"],"path":["alphabet",14]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["p"],"path":["alphabet",15]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["q"],"path":["alphabet",16]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["r"],"path":["alphabet",17]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["s"],"path":["alphabet",18]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["t"],"path":["alphabet",19]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["u"],"path":["alphabet",20]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["v"],"path":["alphabet",21]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["w"],"path":["alphabet",22]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["x"],"path":["alphabet",23]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["y"],"path":["alphabet",24]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content:
      '{"incremental":[{"items":["z"],"path":["alphabet",25]}],"hasNext":true}',
    timestamp: 1718252802585,
  },
  {
    content: '{"hasNext":false}',
    timestamp: 1718252802585,
  },
];
describe('response-builder', () => {
  it('unknown strategy should throw an error', () => {
    expect(() =>
      buildResponse(responseChunks, 'unknown' as MultiResponseStrategy)
    ).toThrowError('Invalid strategy');
  });
  describe('concatenate strategy', () => {
    it('should concatenate the responses', () => {
      const res = buildResponse(responseChunks, MultiResponseStrategy.CONCATENATE);
      expect(res).toMatchSnapshot();
    });

    it('should concatenate the responses and format the data if concatenated data is valid JSON', () => {
      const res = buildResponse([
        {
          content: '{"hello":',
          timestamp: 1718252802585,
        },
        {
          content: '"world"}',
          timestamp: 1718252802585,
        },
      ]);
      expect(res).toMatchSnapshot();
    });

    it('should return timestamp as 0 if no responses are provided', () => {
      const res = buildResponse([], MultiResponseStrategy.CONCATENATE);
      expect(res).toEqual([
        {
          content: '',
          timestamp: 0,
          json: false,
        },
      ]);
    });
  });

  describe('append strategy', () => {
    it('should append the responses', () => {
      const res = buildResponse(responseChunks, MultiResponseStrategy.APPEND);
      expect(res).toMatchSnapshot();
    });
  });

  describe('patch strategy', () => {
    it('should patch the responses', () => {
      const res = buildResponse(responseChunks, MultiResponseStrategy.PATCH);
      expect(res).toMatchSnapshot();
    });

    it('should return empty list if no responses are provided', () => {
      const res = buildResponse([], MultiResponseStrategy.PATCH);
      expect(res).toEqual([]);
    });

    it('should throw an error if the first response is not JSON', () => {
      expect(() =>
        buildResponse(
          [
            {
              content: 'This is not a JSON object',
              timestamp: 1718252802585,
            },
            {
              content:
                '{"incremental":[{"items":["a"],"path":["alphabet",0]}],"hasNext":true}',
              timestamp: 1718252802585,
            },
          ],
          MultiResponseStrategy.PATCH
        )
      ).toThrowError('JSON response required for patching!');
    });

    it('should throw an error if subsequent responses are not JSON', () => {
      expect(() =>
        buildResponse(
          [
            {
              content:
                '{"data":{"hello":"Hello world","alphabet":[],"fastField":"This field resolves fast! ⚡️"},"hasNext":true}',
              timestamp: 1718252802585,
            },
            {
              content: 'This is not a JSON object',
              timestamp: 1718252802585,
            },
          ],
          MultiResponseStrategy.PATCH
        )
      ).toThrowError('JSON response required for patching!');
    });

    it('should gather all errors from all responses', () => {
      const res = buildResponse(
        [
          {
            content:
              '{"data":{"hello":"Hello world","alphabet":[],"fastField":"This field resolves fast! ⚡️"},"hasNext":true,"errors":[{"message":"Error 1"}]}',
            timestamp: 1718252802585,
          },
          {
            content:
              '{"incremental":[{"items":["a"],"path":["alphabet",0],"errors":[{"message":"Incremental error"}]}],"hasNext":true,"errors":[{"message":"Error 2"}]}',
            timestamp: 1718252802585,
          },
          {
            content:
              '{"incremental":[{"items":["b"],"path":["alphabet",1]}],"hasNext":true,"errors":[{"message":"Error 3"}]}',
            timestamp: 1718252802585,
          },
        ],
        MultiResponseStrategy.PATCH
      );

      expect(res).toMatchSnapshot();
    });

    it('should handle incremental payloads in the old format', () => {
      const res = buildResponse(
        [
          {
            content:
              '{"data":{"hello":"Hello world","alphabet":[],"fastField":"This field resolves fast! ⚡️"},"hasNext":true}',
            timestamp: 1718252802585,
          },
          {
            content:
              '{"data":{"additionalField":"This field is added in the second response"},"path":["inner"]}',
            timestamp: 1718252802585,
          },
        ],
        MultiResponseStrategy.PATCH
      );

      expect(res).toMatchSnapshot();
    });

    it('should patch responses with extensions', () => {
      const res = buildResponse(
        [
          {
            content:
              '{"data":{"hello":"Hello world","alphabet":[],"fastField":"This field resolves fast! ⚡️"},"hasNext":true}',
            timestamp: 1718252802585,
          },
          {
            content:
              '{"incremental":[{"items":["a"],"path":["alphabet",0]}],"hasNext":true,"extensions":{"key":"value"}}',
            timestamp: 1718252802585,
          },
          {
            content:
              '{"incremental":[{"items":["b"],"path":["alphabet",1],"extensions":{"key1":"value1"}}],"hasNext":true}',
            timestamp: 1718252802585,
          },
        ],
        MultiResponseStrategy.PATCH
      );

      expect(res).toMatchSnapshot();
    });

    it('should throw an error for incremental payload with invalid @stream path', () => {
      expect(() =>
        buildResponse([
          {
            content:
              '{"data":{"hello":"Hello world","alphabet":[],"fastField":"This field resolves fast! ⚡️"},"hasNext":true}',
            timestamp: 1718252802585,
          },
          {
            content:
              '{"incremental":[{"items":["a"],"path":["alphabet"]}],"hasNext":true}',
            timestamp: 1718252802585,
          },
        ])
      ).toThrowError(
        'Path for stream incremental payload should end with a number!'
      );
    });
  });

  describe('auto strategy', () => {
    it('should concatenate the responses when the first response is not a JSON object', () => {
      const res = buildResponse(
        [
          {
            content: 'This is not a JSON object',
            timestamp: 1718252802585,
          },
          {
            content:
              '{"incremental":[{"items":["a"],"path":["alphabet",0]}],"hasNext":true}',
            timestamp: 1718252802585,
          },
        ],
        MultiResponseStrategy.AUTO
      );
      expect(res).toMatchSnapshot();
    });

    it('should return timestamp as 0 if no responses are provided', () => {
      const res = buildResponse([], MultiResponseStrategy.AUTO);
      expect(res).toEqual([
        {
          content: '',
          timestamp: 0,
          json: false,
        },
      ]);
    });

    it('should patch the responses when the first response is patchable', () => {
      const res = buildResponse(
        [
          {
            content:
              '{"data":{"hello":"Hello world","alphabet":[],"fastField":"This field resolves fast! ⚡️"},"hasNext":true}',
            timestamp: 1718252802585,
          },
          {
            content:
              '{"incremental":[{"items":["a"],"path":["alphabet",0]}],"hasNext":true}',
            timestamp: 1718252802585,
          },
        ],
        MultiResponseStrategy.AUTO
      );
      expect(res).toMatchSnapshot();
    });

    // https://github.com/felipe-gdr/spring-graphql-defer/issues/5
    it('should patch the responses when patchable - sample 2', () => {
      const res = buildResponse([
        {
          content: `{"data":{"bookById":{"name":"Effective Java"}},"hasNext":true}`,
          timestamp: 1718252802585,
        },
        {
          content: `{"hasNext":true,"incremental":[{"path":["bookById"],"data":{"author":{"firstName":"Joshua"}}}]}`,
          timestamp: 1718252802585,
        },
        {
          content: `{"hasNext":false,"incremental":[{"path":[],"data":{"book2":{"name":"Hitchhiker's Guide to the Galaxy"}}}]}`,
          timestamp: 1718252802585,
        },
      ]);

      expect(res).toMatchSnapshot();
    });

    it('should append the responses when the first response is a JSON object but not patchable', () => {
      const res = buildResponse(
        [
          {
            content:
              '{"hello":"Hello world","alphabet":[],"fastField":"This field resolves fast! ⚡️"}',
            timestamp: 1718252802585,
          },
          {
            content: '{"hi": "Hi world"}',
            timestamp: 1718252802585,
          },
        ],
        MultiResponseStrategy.AUTO
      );
      expect(res).toMatchSnapshot();
    });
  });
});
