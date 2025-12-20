import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { User, Bot, Languages } from 'lucide-react';
import { useState, useEffect } from 'react';
import { translateToZhCN } from '../utils/translator';
import { Button } from './ui/button';

interface Turn {
  utterance_index: number;
  role: 'user' | 'assistant';
  timestamp?: string;
  text: string;
}

interface ConversationPair {
  human?: string;
  assistant?: string;
}

interface Session {
  session_id?: string;
  conversation_id?: string;
  started_at?: string;
  ended_at?: string;
  turns?: Turn[];
  conversation?: ConversationPair[];
  category?: string;
  [key: string]: any;
}

interface ConversationViewerProps {
  session: Session;
  selectedUserUtterances: number[];
  onUserUtteranceToggle: (index: number) => void;
}

export function ConversationViewer({ 
  session, 
  selectedUserUtterances,
  onUserUtteranceToggle 
}: ConversationViewerProps) {
  const [translations, setTranslations] = useState<{ [key: number]: string }>({});
  const [translating, setTranslating] = useState<{ [key: number]: boolean }>({});
  const [translationEnabled, setTranslationEnabled] = useState<boolean>(false); // Default OFF

  if (!session) {
    return (
      <Card className="p-8 text-center text-slate-500">
        No session data loaded
      </Card>
    );
  }
  
  // Convert conversation pairs to turns format
  const convertToTurns = (conversation: ConversationPair[]): Turn[] => {
    const turns: Turn[] = [];
    let utteranceIndex = 0;
    
    conversation.forEach((pair) => {
      if (pair.human) {
        turns.push({
          utterance_index: utteranceIndex++,
          role: 'user',
          text: pair.human
        });
      }
      if (pair.assistant) {
        turns.push({
          utterance_index: utteranceIndex++,
          role: 'assistant',
          text: pair.assistant
        });
      }
    });
    
    return turns;
  };
  
  // Handle both formats: turns[] or conversation[]
  let displayTurns: Turn[] = [];
  
  if (session.turns && Array.isArray(session.turns) && session.turns.length > 0) {
    displayTurns = session.turns;
  } else if (session.conversation && Array.isArray(session.conversation) && session.conversation.length > 0) {
    displayTurns = convertToTurns(session.conversation);
  }
  
  if (displayTurns.length === 0) {
    return (
      <Card className="p-8 text-center text-slate-500">
        <p className="mb-2">No conversation data available</p>
        <details className="text-xs text-left max-w-md mx-auto mt-4">
          <summary className="cursor-pointer text-slate-400 hover:text-slate-600">
            Show raw session data
          </summary>
          <pre className="mt-2 p-3 bg-slate-100 rounded overflow-auto max-h-60 text-xs">
            {JSON.stringify(session, null, 2)}
          </pre>
        </details>
      </Card>
    );
  }

  const userTurns = displayTurns.filter(turn => turn.role === 'user');
  const sessionId = session.session_id || session.conversation_id || 'Unknown';

  // Auto-translate all turns when session changes
  useEffect(() => {
    const translateAll = async () => {
      const newTranslations: { [key: number]: string } = {};
      const newTranslating: { [key: number]: boolean } = {};
      
      for (const turn of displayTurns) {
        newTranslating[turn.utterance_index] = true;
      }
      setTranslating(newTranslating);
      
      // Translate turns one by one with delay
      for (let i = 0; i < displayTurns.length; i++) {
        const turn = displayTurns[i];
        try {
          const translated = await translateToZhCN(turn.text);
          
          // Update translation immediately for this turn
          setTranslations(prev => ({
            ...prev,
            [turn.utterance_index]: translated
          }));
          
          // Mark this turn as done translating
          setTranslating(prev => {
            const updated = { ...prev };
            delete updated[turn.utterance_index];
            return updated;
          });
          
          // Add delay between translations to avoid rate limiting
          if (i < displayTurns.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        } catch (error) {
          // Silently handle translation errors - just show original text
          console.warn('Translation error for turn', turn.utterance_index, '- showing original text');
          setTranslations(prev => ({
            ...prev,
            [turn.utterance_index]: turn.text
          }));
          setTranslating(prev => {
            const updated = { ...prev };
            delete updated[turn.utterance_index];
            return updated;
          });
          // Continue with next translation despite error
        }
      }
    };
    
    // Wrap in try-catch to handle any unexpected errors
    if (displayTurns.length > 0 && translationEnabled) {
      // Clear previous translations when session changes
      setTranslations({});
      setTranslating({});
      translateAll().catch(err => {
        console.warn('Translation batch failed:', err);
        // Clear translating state on complete failure
        setTranslating({});
      });
    } else if (!translationEnabled) {
      // Clear translations when disabled
      setTranslations({});
      setTranslating({});
    }
  }, [session.session_id, session.conversation_id, translationEnabled]);

  return (
    <Card className="p-6 bg-white border-slate-200">
      <div className="mb-4 pb-4 border-b border-slate-200">
        <h3 className="text-slate-900 mb-1">Conversation Session / 对话会话</h3>
        <p className="text-sm text-slate-600">
          ID: <span className="font-mono text-xs">{sessionId}</span>
        </p>
        {session.category && (
          <p className="text-xs text-slate-500 mt-1">
            Category / 类别: {session.category.trim()}
          </p>
        )}
        {session.started_at && (
          <p className="text-xs text-slate-500 mt-1">
            Started: {new Date(session.started_at).toLocaleString()}
          </p>
        )}
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {displayTurns.map((turn, idx) => {
          const isUser = turn.role === 'user';
          const isSelected = selectedUserUtterances.includes(turn.utterance_index);
          
          return (
            <div 
              key={idx}
              className={`flex gap-3 ${isUser ? 'justify-start' : 'justify-end'}`}
            >
              {isUser && (
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              )}
              
              <div 
                className={`
                  max-w-[80%] rounded-lg p-4 cursor-pointer transition-all
                  ${isUser 
                    ? isSelected
                      ? 'bg-blue-100 border-2 border-blue-500 shadow-md'
                      : 'bg-blue-50 border border-blue-200 hover:bg-blue-100'
                    : 'bg-green-50 border border-green-200'
                  }
                `}
                onClick={() => {
                  if (isUser) {
                    onUserUtteranceToggle(turn.utterance_index);
                  }
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge 
                    variant="outline" 
                    className="text-xs"
                    style={{
                      backgroundColor: isUser ? '#dbeafe' : '#dcfce7',
                      borderColor: isUser ? '#3b82f6' : '#22c55e',
                      color: isUser ? '#1e40af' : '#15803d'
                    }}
                  >
                    {isUser ? 'User' : 'Assistant'} #{turn.utterance_index}
                  </Badge>
                  {isUser && isSelected && (
                    <Badge variant="outline" className="text-xs bg-yellow-100 border-yellow-500 text-yellow-700">
                      Selected as Evidence
                    </Badge>
                  )}
                </div>
                <p className="text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {turn.text}
                </p>
                
                {/* Chinese Translation */}
                {translations[turn.utterance_index] && translations[turn.utterance_index] !== turn.text && (
                  <div className="mt-3 pt-3 border-t border-slate-300">
                    <div className="flex items-center gap-1 mb-1">
                      <Languages className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-500">中文翻译</span>
                    </div>
                    <p className="text-slate-600 text-sm whitespace-pre-wrap leading-relaxed">
                      {translations[turn.utterance_index]}
                    </p>
                  </div>
                )}
                
                {/* Loading Translation */}
                {translating[turn.utterance_index] && (
                  <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
                    <Languages className="w-3 h-3 animate-pulse" />
                    <span>正在翻译...</span>
                  </div>
                )}
                
                {turn.timestamp && (
                  <p className="text-xs text-slate-400 mt-2">
                    {new Date(turn.timestamp).toLocaleTimeString()}
                  </p>
                )}
              </div>

              {!isUser && (
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 text-sm text-slate-600">
        <p>
          💡 <strong>Tip / 提示:</strong> Click on user messages (blue) to select them as evidence for your intent annotation.
          <span className="block text-xs text-slate-500 mt-1">点击用户消息（蓝色）来选择它们作为意图标注的证据。</span>
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Total turns / 总轮次: {displayTurns.length} ({userTurns.length} user, {displayTurns.length - userTurns.length} assistant)
        </p>
        <div className="mt-3 flex items-center gap-2">
          <Button
            size="sm"
            variant={translationEnabled ? 'default' : 'outline'}
            onClick={() => setTranslationEnabled(!translationEnabled)}
            className="gap-2"
          >
            <Languages className="w-4 h-4" />
            {translationEnabled ? '🟢 Translation ON / 翻译已启用' : '⚪ Translation OFF / 翻译已禁用'}
          </Button>
          {translationEnabled && Object.keys(translating).length > 0 && (
            <span className="text-xs text-slate-500 animate-pulse">
              Translating {Object.keys(translating).length} message(s)...
            </span>
          )}
        </div>
        {!translationEnabled && (
          <p className="text-xs text-slate-400 mt-2">
            💡 Click the button above to enable Google Translate for Chinese translations.
            <span className="block">点击上方按钮启用谷歌翻译获取中文翻译。</span>
          </p>
        )}
      </div>
    </Card>
  );
}