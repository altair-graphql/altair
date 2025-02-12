import React from 'react';
import './table-details.css';
import { Tabs } from '../tabs/tabs';
import { RequestContentDetails } from '../request-content/request-content';
import { ResponseContentDetails } from '../response-content/response-content';
import { Accordion } from '../accordion/accordion';
import { openInAltair } from '../../helpers/messaging';
import { GraphQLRequest } from '../../types';

/**
 * Headers that are forbidden from being sent to the server
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name
 */
const forbiddenHeaders = new Set([
  'accept-encoding',
  'access-control-request-headers',
  'access-control-request-method',
  'connection',
  'content-length',
  'cookie',
  'date',
  'dnt',
  'expect',
  'host',
  'keep-alive',
  'origin',
  'permissions-policy',
  // 'proxy- headers',
  // 'sec- headers',
  'referer',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'via',
]);
const forbiddenHeaderPrefixes = new Set(['proxy-', 'sec-', ':']);

const isForbiddenHeader = (header: string) => {
  const lowerHeader = header.toLowerCase();
  return (
    forbiddenHeaders.has(lowerHeader) ||
    Array.from(forbiddenHeaderPrefixes).some((prefix) =>
      lowerHeader.startsWith(prefix)
    )
  );
};

interface TableDetailsProps {
  request?: GraphQLRequest;
  onClose: () => void;
}
export const TableDetails: React.FC<TableDetailsProps> = ({ request, onClose }) => {
  if (!request) {
    return null;
  }

  return (
    <div className="table-details">
      <span
        style={{
          float: 'left',
          padding: '5px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
        onClick={() => onClose()}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onClose();
          }
        }}
      >
        &#x2715;
      </span>
      <Tabs
        tabs={[
          {
            id: 'request',
            label: 'Request',
            content: (
              <div>
                <Accordion
                  sections={request.requestContent.map((content, idx) => {
                    return {
                      id: `request-${idx}`,
                      title: (
                        <div className="py-3 font-bold">
                          Request #{idx + 1} (
                          {content.selectedOperationName ??
                            content.operationNames.at(0) ??
                            'N/A'}
                          )
                        </div>
                      ),
                      content: (
                        <div className="p-3">
                          <RequestContentDetails
                            key={idx}
                            content={content}
                            onOpenInAltair={() => {
                              openInAltair({
                                type: 'window',
                                version: 1,
                                windowName:
                                  content.selectedOperationName ??
                                  content.operationNames.at(0) ??
                                  'Unknown',
                                query: content.query,
                                variables: JSON.stringify(
                                  content.variables,
                                  null,
                                  2
                                ),
                                apiUrl: request.url,
                                headers: Object.entries(request.requestHeaders)
                                  // Filter headers to only include those that are not empty and not the default headers
                                  .filter(([k, v]) => !isForbiddenHeader(k))
                                  .map(([key, value]) => ({ key, value })),
                                subscriptionUrl: '',
                              });
                            }}
                          />
                        </div>
                      ),
                    };
                  })}
                />
              </div>
            ),
          },
          {
            id: 'response',
            label: 'Response',
            content: (
              <div>
                {request.responseContent ? (
                  <ResponseContentDetails response={request.responseContent} />
                ) : null}
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};
