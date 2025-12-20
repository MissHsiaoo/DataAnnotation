import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Brain, ChevronDown, ChevronUp, Edit, Save, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

interface MemoryReasoningDisplayProps {
  reasoning: string;
  onReasoningUpdate?: (newReasoning: string) => void;
}

export function MemoryReasoningDisplay({ reasoning, onReasoningUpdate }: MemoryReasoningDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReasoning, setEditedReasoning] = useState(reasoning);

  if (!reasoning || reasoning.trim().length === 0) {
    return null; // Don't display anything if no reasoning
  }

  const handleStartEdit = () => {
    setEditedReasoning(reasoning);
    setIsEditing(true);
    setIsExpanded(true); // Auto-expand when editing
  };

  const handleSaveEdit = () => {
    if (onReasoningUpdate) {
      onReasoningUpdate(editedReasoning);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedReasoning(reasoning);
    setIsEditing(false);
  };

  return (
    <Card className="p-5 bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          <h3 className="text-slate-900">
            Memory Extraction Reasoning / 记忆提取推理过程
          </h3>
        </div>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleStartEdit}
                className="gap-1"
                disabled={!onReasoningUpdate}
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="gap-1"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Expand
                  </>
                )}
              </Button>
            </>
          )}
          {isEditing && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={handleSaveEdit}
                className="gap-1 bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="gap-1"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
      
      <Badge variant="outline" className="mb-3 bg-purple-100 border-purple-400 text-purple-700">
        AI Reasoning Process / AI推理过程
      </Badge>

      {isEditing ? (
        <div className="mt-3">
          <Textarea
            value={editedReasoning}
            onChange={(e) => setEditedReasoning(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
            placeholder="Enter reasoning..."
          />
          <p className="text-xs text-slate-500 mt-2">
            💡 Edit the AI reasoning process. Changes will be saved to the session.
            <br />
            编辑AI推理过程。更改将保存到会话中。
          </p>
        </div>
      ) : (
        <>
          {isExpanded && (
            <div className="mt-3 p-4 bg-white rounded-lg border border-purple-200">
              <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
                {reasoning}
              </pre>
            </div>
          )}
          
          {!isExpanded && (
            <p className="text-sm text-slate-600 line-clamp-3">
              {reasoning.substring(0, 200)}...
            </p>
          )}
        </>
      )}
    </Card>
  );
}