import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Plus, Trash2, Check, X } from 'lucide-react';
import intentTaxonomy, { type IntentCategory } from '../config/intent-config';

interface IntentAnnotation {
  intent_category: string;
  intent_subtype: string | null;
  probability: number;
  reasoning: string;
  evidence: Array<{
    utterance_index: number;
    text: string;
  }>;
}

interface IntentAnnotationFormProps {
  currentAnnotations: IntentAnnotation[];
  selectedUserUtterances: number[];
  userTurns: Array<{ utterance_index: number; text: string }>;
  onAnnotationsChange: (annotations: IntentAnnotation[]) => void;
  onSave: () => void;
}

export function IntentAnnotationForm({
  currentAnnotations,
  selectedUserUtterances,
  userTurns,
  onAnnotationsChange,
  onSave
}: IntentAnnotationFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [currentSubtype, setCurrentSubtype] = useState<string>('');
  const [currentProbability, setCurrentProbability] = useState<string>('');
  const [currentReasoning, setCurrentReasoning] = useState<string>('');

  const canAddMore = currentAnnotations.length < 2;
  const selectedCategory = intentTaxonomy.find(cat => cat.id === currentCategory);

  const handleStartNew = () => {
    setEditingIndex(currentAnnotations.length);
    setCurrentCategory('');
    setCurrentSubtype('');
    setCurrentProbability('');
    setCurrentReasoning('');
  };

  const handleEdit = (index: number) => {
    const annotation = currentAnnotations[index];
    setEditingIndex(index);
    setCurrentCategory(annotation.intent_category);
    setCurrentSubtype(annotation.intent_subtype || '');
    setCurrentProbability(annotation.probability.toString());
    setCurrentReasoning(annotation.reasoning);
  };

  const handleSaveIntent = () => {
    if (!currentCategory || !currentProbability || !currentReasoning.trim()) {
      alert('Please fill in category, probability, and reasoning / 请填写类别、概率和推理');
      return;
    }

    if (selectedUserUtterances.length === 0) {
      alert('Please select at least one user utterance as evidence / 请至少选择一条用户话语作为证据');
      return;
    }

    const prob = parseFloat(currentProbability);
    if (isNaN(prob) || prob < 0 || prob > 1) {
      alert('Probability must be between 0 and 1 / 概率必须在0和1之间');
      return;
    }

    // SAFETY: Filter out any invalid utterance indices
    const evidence = selectedUserUtterances
      .map(idx => {
        const turn = userTurns.find(t => t.utterance_index === idx);
        if (!turn) {
          console.warn(`No turn found for utterance_index ${idx}`);
          return null;
        }
        return {
          utterance_index: idx,
          text: turn.text || ''
        };
      })
      .filter((e): e is { utterance_index: number; text: string } => e !== null);

    if (evidence.length === 0) {
      alert('No valid evidence found. Please select user utterances again.');
      return;
    }

    const newAnnotation: IntentAnnotation = {
      intent_category: currentCategory,
      intent_subtype: currentSubtype || null,
      probability: prob,
      reasoning: currentReasoning,
      evidence
    };

    let updated: IntentAnnotation[];
    if (editingIndex !== null && editingIndex < currentAnnotations.length) {
      // Editing existing
      updated = [...currentAnnotations];
      updated[editingIndex] = newAnnotation;
    } else {
      // Adding new
      updated = [...currentAnnotations, newAnnotation];
    }

    onAnnotationsChange(updated);
    setEditingIndex(null);
    setCurrentCategory('');
    setCurrentSubtype('');
    setCurrentProbability('');
    setCurrentReasoning('');
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setCurrentCategory('');
    setCurrentSubtype('');
    setCurrentProbability('');
    setCurrentReasoning('');
  };

  const handleDelete = (index: number) => {
    const updated = currentAnnotations.filter((_, i) => i !== index);
    onAnnotationsChange(updated);
  };

  const totalProbability = currentAnnotations.reduce((sum, ann) => sum + ann.probability, 0);
  const probabilityWarning = Math.abs(totalProbability - 1.0) > 0.01 && currentAnnotations.length > 0;

  return (
    <Card className="p-6 bg-white border-slate-200">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-slate-900">Intent Annotations / 意图标注</h3>
          <p className="text-sm text-slate-600 mt-1">
            Annotate up to 2 intents. Probabilities should sum to 1.0.
            <span className="block text-xs text-slate-500 mt-0.5">最多标注2个意图。概率总和应为1.0。</span>
          </p>
        </div>
        {currentAnnotations.length > 0 && (
          <Badge
            variant="outline"
            className={probabilityWarning ? 'bg-yellow-50 border-yellow-500 text-yellow-700' : 'bg-green-50 border-green-500 text-green-700'}
          >
            Σ Prob: {totalProbability.toFixed(2)}
          </Badge>
        )}
      </div>

      {/* All Annotations (existing + new) - displayed the same way */}
      {currentAnnotations.map((annotation, index) => {
        const category = intentTaxonomy.find(cat => cat.id === annotation.intent_category);
        const isEditing = editingIndex === index;
        
        if (isEditing) {
          // Editing mode - show inline edit form
          return (
            <Card 
              key={index} 
              className="mb-3 p-4 border-2 border-blue-500 bg-blue-50"
            >
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="font-medium bg-blue-100 border-blue-600 text-blue-800">
                  Editing Intent #{index + 1} / 编辑意图 #{index + 1}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Intent Category / 意图类别 *
                  </label>
                  <select
                    value={currentCategory}
                    onChange={(e) => {
                      setCurrentCategory(e.target.value);
                      setCurrentSubtype('');
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  >
                    <option value="">Select a category / 选择类别...</option>
                    {intentTaxonomy.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subtype Selection */}
                {selectedCategory && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Intent Subtype / 意图子类 (Optional)
                    </label>
                    <select
                      value={currentSubtype}
                      onChange={(e) => setCurrentSubtype(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                    >
                      <option value="">None / 无</option>
                      {selectedCategory.subtypes.map((subtype) => (
                        <option key={subtype.id} value={subtype.id}>
                          {subtype.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Probability */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Probability / 概率 (0-1) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={currentProbability}
                    onChange={(e) => setCurrentProbability(e.target.value)}
                    placeholder="e.g., 0.8"
                    className="text-sm"
                  />
                </div>

                {/* Reasoning */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Reasoning / 推理 *
                  </label>
                  <Textarea
                    value={currentReasoning}
                    onChange={(e) => setCurrentReasoning(e.target.value)}
                    placeholder="Explain why this intent was selected... / 解释为什么选择此意图..."
                    rows={3}
                    className="text-sm"
                  />
                </div>

                {/* Evidence Selection */}
                <div className="p-3 bg-blue-100 border border-blue-300 rounded">
                  <label className="block text-sm font-medium text-blue-900 mb-1">
                    Evidence / 证据 *
                  </label>
                  <p className="text-xs text-blue-800">
                    {selectedUserUtterances.length} user utterance(s) selected. Click on blue messages in the conversation. 
                    <span className="block text-blue-700 mt-0.5">已选择{selectedUserUtterances.length}条用户话语。点击对话中的蓝色消息。</span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSaveIntent}
                    size="sm"
                    className="gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Save / 保存
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel / 取消
                  </Button>
                </div>
              </div>
            </Card>
          );
        } else {
          // Display mode - show summary card (same for existing and new)
          return (
            <Card 
              key={index} 
              className="mb-3 p-4 border-slate-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-medium">
                    Intent #{index + 1}
                  </Badge>
                  {category && (
                    <Badge className="bg-slate-100 text-slate-700 border-slate-300">
                      {category.name}
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
                    p={annotation.probability.toFixed(2)}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={() => handleEdit(index)}
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1"
                  >
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(index)}
                    variant="outline"
                    size="sm"
                    className="text-xs gap-1 text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              
              <div className="text-sm text-slate-700">
                <p className="mb-1">
                  <span className="font-medium">Subtype:</span> {annotation.intent_subtype || 'None'}
                </p>
                <p className="mb-2">
                  <span className="font-medium">Reasoning:</span> {annotation.reasoning}
                </p>
                <p className="text-xs text-slate-600">
                  <span className="font-medium">Evidence:</span> {annotation.evidence.length} utterance(s)
                </p>
              </div>
            </Card>
          );
        }
      })}

      {/* NEW INTENT FORM - only show when editingIndex is beyond current array */}
      {editingIndex !== null && editingIndex === currentAnnotations.length && (
        <Card className="mb-3 p-4 border-2 border-green-500 bg-green-50">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className="font-medium bg-green-100 border-green-600 text-green-800">
              Adding New Intent #{editingIndex + 1} / 添加新意图 #{editingIndex + 1}
            </Badge>
          </div>
          
          <div className="space-y-3">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Intent Category / 意图类别 *
              </label>
              <select
                value={currentCategory}
                onChange={(e) => {
                  setCurrentCategory(e.target.value);
                  setCurrentSubtype('');
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              >
                <option value="">Select a category / 选择类别...</option>
                {intentTaxonomy.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subtype Selection */}
            {selectedCategory && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Intent Subtype / 意图子类 (Optional)
                </label>
                <select
                  value={currentSubtype}
                  onChange={(e) => setCurrentSubtype(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                >
                  <option value="">None / 无</option>
                  {selectedCategory.subtypes.map((subtype) => (
                    <option key={subtype.id} value={subtype.id}>
                      {subtype.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Probability */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Probability / 概率 (0-1) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={currentProbability}
                onChange={(e) => setCurrentProbability(e.target.value)}
                placeholder="e.g., 0.8"
                className="text-sm"
              />
            </div>

            {/* Reasoning */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Reasoning / 推理 *
              </label>
              <Textarea
                value={currentReasoning}
                onChange={(e) => setCurrentReasoning(e.target.value)}
                placeholder="Explain why this intent was selected... / 解释为什么选择此意图..."
                rows={3}
                className="text-sm"
              />
            </div>

            {/* Evidence Selection */}
            <div className="p-3 bg-blue-100 border border-blue-300 rounded">
              <label className="block text-sm font-medium text-blue-900 mb-1">
                Evidence / 证据 *
              </label>
              <p className="text-xs text-blue-800">
                {selectedUserUtterances.length} user utterance(s) selected. Click on blue messages in the conversation. 
                <span className="block text-blue-700 mt-0.5">已选择{selectedUserUtterances.length}条用户话语。点击对话中的蓝色消息。</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSaveIntent}
                size="sm"
                className="gap-2"
              >
                <Check className="w-4 h-4" />
                Save / 保存
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Cancel / 取消
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Add New Button - only show when not editing and can add more */}
      {editingIndex === null && canAddMore && (
        <Button
          onClick={handleStartNew}
          variant="outline"
          className="w-full gap-2 border-dashed"
        >
          <Plus className="w-4 h-4" />
          Add Intent ({currentAnnotations.length}/2) / 添加意图 ({currentAnnotations.length}/2)
        </Button>
      )}

      {/* Save All Button */}
      {currentAnnotations.length > 0 && editingIndex === null && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <Button
            onClick={onSave}
            className="w-full gap-2"
            disabled={probabilityWarning}
          >
            <Check className="w-4 h-4" />
            Save All Annotations to Session / 保存所有标注到会话
          </Button>
          {probabilityWarning && (
            <p className="text-xs text-yellow-700 mt-2 text-center">
              ⚠️ Warning: Probabilities should sum to 1.0 (current: {totalProbability.toFixed(2)})
              <span className="block">警告：概率总和应为1.0（当前：{totalProbability.toFixed(2)}）</span>
            </p>
          )}
        </div>
      )}
    </Card>
  );
}