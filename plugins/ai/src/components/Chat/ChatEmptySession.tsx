import { Sparkles } from 'lucide-react';
import { randomSampling } from '../../utils';

const allSamplePrompts = [
  `Can you generate a GraphQL query to fetch all users with their names and email addresses?`,
  `Create a query to get the list of products with their prices and availability status`,
  `Explain the 'User' type from the schema`,
  `What fields are available in the 'Product' type and what are their types?`,
  `How do I use variables in a query in Altair?`,
  `Can you show me an example of using fragments in Altair?`,
  `Why am I getting a 'field not found' error in my query?`,
  `How can I optimize this query to reduce response time?`,
  `What are some best practices for writing GraphQL queries in Altair?`,
  `How can I save and reuse my GraphQL queries in Altair?`,
];
const prompts = randomSampling(allSamplePrompts, 3);

export const ChatEmptySession = () => {
  return (
    <div className="ai-chat__empty-session">
      <div className="ai-chat__empty-session-inner">
        <div className="ai-chat__empty-session-icon">
          <Sparkles size={20} />
        </div>
        <div className="ai-chat__empty-session-prompts">
          {prompts.map((prompt) => (
            <div
              key={prompt}
              className="ai-chat__empty-session-prompt glassy-border"
            >
              {prompt}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
