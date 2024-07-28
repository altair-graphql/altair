import { IMessage, ISession } from 'altair-graphql-core/build/ai/types';
import './Chat.css';
import { PluginUserInfo } from 'altair-graphql-core/build/plugin/v3/context';
import { Coins, Dot, Plus, SendHorizonal, Sparkles, User } from 'lucide-react';
import { ChatWrapper } from './ChatWrapper';
import { ChatMessage } from './ChatMessage';
import { ChatEmptySession } from './ChatEmptySession';
import { useEffect, useRef, useState } from 'react';
import { Spinner } from './Spinner';

export interface ChatProps {
  loggedIn: boolean;
  loading: boolean;
  sendMessageIsPending: boolean;
  availableCredits: number;
  userInfo?: PluginUserInfo;
  activeSession?: ISession;
  messages?: IMessage[];
  isPro?: boolean;
  onStartNewSession?: () => void;
  onSendMessage?: (message: string) => void;
  onUseQuery?: (query: string) => void;
  onRateMessage?: (messageId: string, rating: number) => void;
}
function Chat({
  loggedIn,
  loading,
  sendMessageIsPending,
  availableCredits,
  activeSession,
  messages,
  isPro,
  onStartNewSession = () => {},
  onSendMessage = () => {},
  onUseQuery = () => {},
  onRateMessage = () => {},
}: ChatProps) {
  const [message, setMessage] = useState('');
  const listRef = useRef<HTMLUListElement>(null);

  const sendMessage = () => {
    onSendMessage(message);
    setMessage('');
  };

  useEffect(() => {
    listRef.current?.lastElementChild?.scrollIntoView();
  }, [messages]);

  return (
    <ChatWrapper loading={loading}>
      {!loggedIn ? (
        <div className="ai-chat__notice">
          <div className="ai-chat__notice-inner glassy-border">
            <div className="ai-chat__notice-icon">
              <User size={20} />
              <Dot size={20} />
              <Sparkles size={20} />
            </div>
            <div className="ai-chat__notice-text">
              Please log in to use the AI assistant
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="ai-chat__top-bar">
            <button
              className="btn btn--primary btn--light btn--small"
              onClick={() => onStartNewSession()}
            >
              <Plus size={16} />
            </button>
            <div>
              AI <span className="ai-chat__tag">Beta</span>
            </div>
            <div className="ai-chat__credits" title="Available credits">
              {availableCredits} <Coins size={16} />
            </div>
          </div>
          {messages?.length ? (
            <ul ref={listRef} className="ai-chat__messages">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message.message}
                  isUser={message.role === 'USER'}
                  onUseQuery={onUseQuery}
                  onRateMessage={(rating) => onRateMessage(message.id, rating)}
                />
              ))}
            </ul>
          ) : (
            <ChatEmptySession />
          )}
          <div className="ai-chat__input-actions">
            {!activeSession ? (
              <button
                className="btn btn--primary btn--light btn--full-width"
                onClick={() => onStartNewSession()}
              >
                <Plus size={16} />
                Start new session
              </button>
            ) : (
              <>
                {availableCredits > 0 ? (
                  <>
                    <input
                      type="text"
                      className="input"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          sendMessage();
                        }
                      }}
                      disabled={sendMessageIsPending}
                    />
                    <button
                      className="btn btn--primary btn--light"
                      onClick={() => sendMessage()}
                      disabled={sendMessageIsPending}
                    >
                      {sendMessageIsPending ? (
                        <Spinner size={16} />
                      ) : (
                        <SendHorizonal size={16} />
                      )}{' '}
                      Send
                    </button>
                  </>
                ) : (
                  <>
                    <p>You are out of credits. Buy more credits to continue.</p>
                    {!isPro && <p>Upgrade to pro plan to buy credits.</p>}
                  </>
                )}
              </>
            )}
          </div>
          <div className="ai-chat__disclaimer">
            Disclaimer: The information provided by this assistant can be incorrect.
            Please verify the information before using it.{' '}
            <a
              href="https://github.com/altair-graphql/altair/discussions/new?category=ideas&title=AI%20feedback"
              target="_blank"
            >
              Share your feedback
            </a>
          </div>
        </>
      )}
    </ChatWrapper>
  );
}

export default Chat;
