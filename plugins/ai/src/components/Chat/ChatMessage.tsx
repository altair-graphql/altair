import classNames from 'classnames';
import { ThumbsDown, ThumbsUp } from 'lucide-react';
import Markdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { darcula } from 'react-syntax-highlighter/dist/esm/styles/prism';

export interface ChatMessageProps {
  message: string;
  isUser?: boolean;
  onUseQuery: (query: string) => void;
  onRateMessage: (rating: number) => void;
}
export const ChatMessage = ({
  message,
  isUser,
  onUseQuery,
  onRateMessage,
}: ChatMessageProps) => {
  return (
    <li
      className={classNames({
        'ai-chat__message': true,
        'ai-chat__message--user': isUser,
        'ai-chat__message--assistant': !isUser,
      })}
    >
      {/* <div className="ai-chat__message-avatar">
    <Sparkles size={16} />
  </div> */}
      <div className="ai-chat__message-content">
        <Markdown
          children={message}
          components={{
            code(props) {
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
              const { children, className, node, ref, ...rest } = props;
              const match = /language-(\w+)/.exec(className || '');
              const childrenString = String(children).replace(/\n$/, '');
              return match ? (
                <>
                  <SyntaxHighlighter
                    {...rest}
                    PreTag="div"
                    children={childrenString}
                    language={match[1]}
                    style={darcula}
                  />
                  {match[1] === 'graphql' && (
                    <button
                      className="btn btn--small"
                      onClick={() => onUseQuery(childrenString)}
                    >
                      Use query
                    </button>
                  )}
                </>
              ) : (
                <code ref={ref} {...rest} className={className}>
                  {children}
                </code>
              );
            },
          }}
        />
      </div>
      <div className="ai-chat__message-actions">
        {!isUser && (
          <>
            <button
              className="ai-chat__message-action btn btn--small"
              onClick={() => onRateMessage(1)}
            >
              <ThumbsUp size={8} />
            </button>
            <button
              className="ai-chat__message-action btn btn--small"
              onClick={() => onRateMessage(-1)}
            >
              <ThumbsDown size={8} />
            </button>
          </>
        )}
      </div>
    </li>
  );
};
