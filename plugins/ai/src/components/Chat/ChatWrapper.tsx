import { PropsWithChildren } from 'react';
import { Spinner } from './Spinner';

interface ChatWrapperProps {
  loading: boolean;
}
export const ChatWrapper = ({
  children,
  loading,
}: PropsWithChildren<ChatWrapperProps>) => {
  return (
    <div className="ai-chat-wrapper">
      <div className="ai-chat">
        {loading && (
          <div className="ai-chat__loader">
            <Spinner className="ai-chat__loader__spinner" size={16} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
};
