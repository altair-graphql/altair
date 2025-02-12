import { useState } from 'react';
import { mockRequests } from './mock-requests';
import { getRequest } from '../../helpers/request';
import { GraphQLRequest } from '../../types';

export const useGraphQLRequests = () => {
  const [requests, setRequests] = useState<GraphQLRequest[]>([]);
  if ('chrome' in window === false || 'devtools' in chrome === false) {
    return {
      requests: mockRequests,
    };
  }
  chrome.devtools.network.onRequestFinished.addListener(async (request) => {
    const data = await getRequest(request);
    if (!data) {
      return;
    }
    setRequests((prevRequests) => [...prevRequests, data]);
  });

  // TODO: Add cleanup logic
  return {
    requests,
  };
};
