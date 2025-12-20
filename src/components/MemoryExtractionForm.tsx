import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Trash2, Check, X, Info, XCircle } from 'lucide-react';
import { memoryLabels, memoryCategories, getLabelsByCategory } from '../config/memory-taxonomy';

interface MemoryItem {
  memory_id: string;
  type: 'direct' | 'indirect';
  label: string;
  value: string;
  reasoning: string;
  evidence: {
    session_id: string;
    utterance_index: number;
    text: string;
  };
  confidence: number;
  time_scope: 'recent' | 'long_term' | 'past_only' | 'unknown';
  emotion: 'Positive' | 'Negative' | 'Neutral' | null;
  preference_attitude: 'like' | 'dislike' | null;
  updated_at: string;
}

interface MemoryExtractionFormProps {
  sessionId: string;
  currentMemories: MemoryItem[];
  selectedUserUtterances: number[];
  userTurns: Array<{ utterance_index: number; text: string }>;
  onMemoriesChange: (memories: MemoryItem[]) => void;
  onSave: () => void;
  onNoMemory: () => void;
}

export function MemoryExtractionForm({
  sessionId,
  currentMemories,
  selectedUserUtterances,
  userTurns,
  onMemoriesChange,
  onSave,
  onNoMemory
}: MemoryExtractionFormProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentType, setCurrentType] = useState<'direct' | 'indirect'>('direct');
  const [currentCategory, setCurrentCategory] = useState<string>('');
  const [currentLabel, setCurrentLabel] = useState<string>('');
  const [currentValue, setCurrentValue] = useState<string>('');
  const [currentReasoning, setCurrentReasoning] = useState<string>('');
  const [currentConfidence, setCurrentConfidence] = useState<string>('0.9');
  const [currentTimeScope, setCurrentTimeScope] = useState<'recent' | 'long_term' | 'past_only' | 'unknown'>('recent');
  const [currentEmotion, setCurrentEmotion] = useState<'Positive' | 'Negative' | 'Neutral' | 'null'>('null');
  const [currentPreferenceAttitude, setCurrentPreferenceAttitude] = useState<'like' | 'dislike' | 'null'>('null');

  const handleStartNew = () => {
    setEditingIndex(currentMemories.length);
    setCurrentType('direct');
    setCurrentCategory('');
    setCurrentLabel('');
    setCurrentValue('');
    setCurrentReasoning('');
    setCurrentConfidence('0.9');
    setCurrentTimeScope('recent');
    setCurrentEmotion('null');
    setCurrentPreferenceAttitude('null');
  };

  const handleEdit = (index: number) => {
    const memory = currentMemories[index];
    setEditingIndex(index);
    setCurrentType(memory.type);
    const labelObj = memoryLabels.find(l => l.id === memory.label);
    setCurrentCategory(labelObj?.category || '');
    setCurrentLabel(memory.label);
    setCurrentValue(memory.value);
    setCurrentReasoning(memory.reasoning);
    setCurrentConfidence(memory.confidence.toString());
    setCurrentTimeScope(memory.time_scope);
    setCurrentEmotion(memory.emotion || 'null');
    setCurrentPreferenceAttitude(memory.preference_attitude || 'null');
  };

  const handleSaveMemory = () => {
    if (!currentLabel || !currentValue.trim() || !currentReasoning.trim()) {
      alert('Please fill in label, value, and reasoning / 请填写标签、值和推理');
      return;
    }

    if (selectedUserUtterances.length === 0) {
      alert('Please select at least one user utterance as evidence / 请至少选择一条用户话语作为证据');
      return;
    }

    const conf = parseFloat(currentConfidence);
    if (isNaN(conf) || conf < 0 || conf > 1) {
      alert('Confidence must be between 0 and 1 / 置信度必须在0和1之间');
      return;
    }

    // Validate preference_attitude based on label
    const isPreferenceLabel = currentLabel.startsWith('Preferences/');
    if (isPreferenceLabel && currentPreferenceAttitude === 'null') {
      alert('Preference labels must have a preference_attitude (like or dislike) / 偏好标签必须有态度（喜欢或不喜欢）');
      return;
    }
    if (!isPreferenceLabel && currentPreferenceAttitude !== 'null') {
      alert('Only Preference labels can have a preference_attitude / 只有偏好标签可以有态度');
      return;
    }

    // Use first selected utterance as primary evidence
    const evidenceUtteranceIndex = selectedUserUtterances[0];
    const evidenceTurn = userTurns.find(t => t.utterance_index === evidenceUtteranceIndex);

    // SAFETY: Ensure we have valid evidence text
    if (!evidenceTurn) {
      alert('Selected evidence utterance not found. Please select again.');
      return;
    }

    const nextMemoryId = editingIndex !== null && editingIndex < currentMemories.length
      ? currentMemories[editingIndex].memory_id
      : `m${currentMemories.length + 1}`;

    const newMemory: MemoryItem = {
      memory_id: nextMemoryId,
      type: currentType,
      label: currentLabel,
      value: currentValue,
      reasoning: currentReasoning,
      evidence: {
        session_id: sessionId || 'unknown',
        utterance_index: evidenceUtteranceIndex,
        text: evidenceTurn.text || ''
      },
      confidence: conf,
      time_scope: currentTimeScope,
      emotion: currentEmotion === 'null' ? null : currentEmotion,
      preference_attitude: currentPreferenceAttitude === 'null' ? null : currentPreferenceAttitude,
      updated_at: new Date().toISOString()
    };

    let updated: MemoryItem[];
    if (editingIndex !== null && editingIndex < currentMemories.length) {
      updated = [...currentMemories];
      updated[editingIndex] = newMemory;
    } else {
      updated = [...currentMemories, newMemory];
    }

    onMemoriesChange(updated);
    handleCancel();
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setCurrentType('direct');
    setCurrentCategory('');
    setCurrentLabel('');
    setCurrentValue('');
    setCurrentReasoning('');
    setCurrentConfidence('0.9');
    setCurrentTimeScope('recent');
    setCurrentEmotion('null');
    setCurrentPreferenceAttitude('null');
  };

  const handleDelete = (index: number) => {
    const updated = currentMemories.filter((_, i) => i !== index);
    // Re-number memory_ids
    const renumbered = updated.map((mem, idx) => ({
      ...mem,
      memory_id: `m${idx + 1}`
    }));
    onMemoriesChange(renumbered);
  };

  const availableLabels = currentCategory ? getLabelsByCategory(currentCategory) : [];

  return (
    <Card className="p-6 bg-white border-slate-200">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-slate-900">Memory Extraction / 记忆提取</h3>
          <p className="text-sm text-slate-600 mt-1">
            Extract user memories based on the annotated intents. Typically ≤5 items per session.
            <span className="block text-xs text-slate-500 mt-0.5">基于标注的意图提取用户记忆。通常每个会话≤5项。</span>
          </p>
        </div>
        <Badge variant="outline" className="bg-purple-50 border-purple-500 text-purple-700">
          {currentMemories.length} memories
        </Badge>
      </div>

      {/* Guidelines */}
      <Card className="mb-4 p-3 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-900">
            <p className="font-medium mb-1">Memory Extraction Guidelines / 记忆提取指南:</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>Store stable preferences, identity, goals, and persistent states / 存储稳定的偏好、身份、目标和持久状态</li>
              <li>Avoid one-off facts, temporary tasks, or debug data / 避免一次性事实、临时任务或调试数据</li>
              <li>Use "direct" if explicitly stated, "indirect" if inferred / 明确陈述使用"direct"，推断使用"indirect"</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* All Memories (existing + new) - displayed the same way */}
      {currentMemories.map((memory, index) => {
        const isEditing = editingIndex === index;
        const labelObj = memoryLabels.find(l => l.id === memory.label);
        
        if (isEditing) {
          // Editing mode - show inline edit form
          return (
            <Card 
              key={index} 
              className="mb-3 p-4 border-2 border-purple-500 bg-purple-50"
            >
              <div className="flex items-center justify-between mb-3">
                <Badge variant="outline" className="font-medium bg-purple-100 border-purple-600 text-purple-800">
                  Editing Memory #{index + 1} / 编辑记忆 #{index + 1}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Memory Type / 记忆类型 *
                  </label>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={currentType === 'direct' ? 'default' : 'outline'}
                      onClick={() => setCurrentType('direct')}
                    >
                      Direct / 直接
                    </Button>
                    <Button
                      size="sm"
                      variant={currentType === 'indirect' ? 'default' : 'outline'}
                      onClick={() => setCurrentType('indirect')}
                    >
                      Indirect / 间接
                    </Button>
                  </div>
                </div>

                {/* Category Selection */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category / 类别 *
                  </label>
                  <Select value={currentCategory} onValueChange={(val) => {
                    setCurrentCategory(val);
                    setCurrentLabel('');
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category / 选择类别" />
                    </SelectTrigger>
                    <SelectContent>
                      {memoryCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Label Selection */}
                {availableLabels.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Label / 标签 *
                    </label>
                    <Select value={currentLabel} onValueChange={setCurrentLabel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select label / 选择标签" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLabels.map(label => (
                          <SelectItem key={label.id} value={label.id}>
                            {label.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Value */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Memory Value / 记忆值 *
                  </label>
                  <Input
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    placeholder="e.g., plays guitar / 例如：弹吉他"
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
                    placeholder="Explain why this is a valid memory... / 解释为什么这是一个有效的记忆..."
                    rows={2}
                    className="text-sm"
                  />
                </div>

                {/* Confidence */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Confidence / 置信度 (0-1) *
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={currentConfidence}
                    onChange={(e) => setCurrentConfidence(e.target.value)}
                    className="text-sm"
                  />
                </div>

                {/* Time Scope */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Time Scope / 时间范围 *
                  </label>
                  <Select value={currentTimeScope} onValueChange={(val: any) => setCurrentTimeScope(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Recent / 最近</SelectItem>
                      <SelectItem value="long_term">Long-term / 长期</SelectItem>
                      <SelectItem value="past_only">Past only / 仅过去</SelectItem>
                      <SelectItem value="unknown">Unknown / 未知</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Emotion (optional) */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Emotion / 情绪 (optional)
                  </label>
                  <Select value={currentEmotion} onValueChange={(val: any) => setCurrentEmotion(val)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="null">None / 无</SelectItem>
                      <SelectItem value="Positive">Positive / 正面</SelectItem>
                      <SelectItem value="Negative">Negative / 负面</SelectItem>
                      <SelectItem value="Neutral">Neutral / 中性</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Preference Attitude (for Preference labels only) */}
                {currentLabel.startsWith('Preferences/') && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Preference Attitude / 偏好态度 *
                    </label>
                    <Select value={currentPreferenceAttitude} onValueChange={(val: any) => setCurrentPreferenceAttitude(val)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="null">None / 无</SelectItem>
                        <SelectItem value="like">Like / 喜欢</SelectItem>
                        <SelectItem value="dislike">Dislike / 不喜欢</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Evidence Info */}
                <div className="p-3 bg-purple-100 border border-purple-300 rounded">
                  <label className="block text-sm font-medium text-purple-900 mb-1">
                    Evidence / 证据 *
                  </label>
                  <p className="text-xs text-purple-800">
                    {selectedUserUtterances.length} user utterance(s) selected. Click on blue messages in the conversation.
                    <span className="block text-purple-700 mt-0.5">已选择{selectedUserUtterances.length}条用户话语。点击对话中的蓝色消息。</span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleSaveMemory}
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
              className="mb-3 p-4 border-l-4 border-purple-400 bg-purple-50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="font-mono text-xs">
                      #{index + 1} {memory.memory_id}
                    </Badge>
                    <Badge variant="outline" className={memory.type === 'direct' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-yellow-100 border-yellow-500 text-yellow-700'}>
                      {memory.type}
                    </Badge>
                    <span className="text-sm font-medium text-purple-900">
                      {labelObj?.name || memory.label}
                    </span>
                    <Badge variant="outline" className="text-xs ml-auto">
                      conf: {memory.confidence}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-800 mb-1">
                    <strong>Value / 值:</strong> {memory.value}
                  </p>
                  <p className="text-xs text-slate-600 mb-1">
                    <strong>Reasoning / 推理:</strong> {memory.reasoning}
                  </p>
                  <div className="flex gap-2 text-xs text-slate-500">
                    <span>⏱️ {memory.time_scope}</span>
                    {memory.emotion && <span>😊 {memory.emotion}</span>}
                    {memory.preference_attitude && <span>👍 {memory.preference_attitude}</span>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(index)}
                    disabled={editingIndex !== null}
                  >
                    Edit / 编辑
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(index)}
                    className="text-red-600 hover:bg-red-50"
                    disabled={editingIndex !== null}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          );
        }
      })}

      {/* NEW MEMORY FORM - show when editingIndex is >= currentMemories.length (adding new) */}
      {editingIndex !== null && editingIndex >= currentMemories.length && (
        <Card 
          className="mb-3 p-4 border-2 border-purple-500 bg-purple-50"
        >
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className="font-medium bg-purple-100 border-purple-600 text-purple-800">
              New Memory / 新记忆
            </Badge>
          </div>
          
          <div className="space-y-3">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Memory Type / 记忆类型 *
              </label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={currentType === 'direct' ? 'default' : 'outline'}
                  onClick={() => setCurrentType('direct')}
                >
                  Direct / 直接
                </Button>
                <Button
                  size="sm"
                  variant={currentType === 'indirect' ? 'default' : 'outline'}
                  onClick={() => setCurrentType('indirect')}
                >
                  Indirect / 间接
                </Button>
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category / 类别 *
              </label>
              <Select value={currentCategory} onValueChange={(val) => {
                setCurrentCategory(val);
                setCurrentLabel('');
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category / 选择类别" />
                </SelectTrigger>
                <SelectContent>
                  {memoryCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Label Selection */}
            {availableLabels.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Label / 标签 *
                </label>
                <Select value={currentLabel} onValueChange={setCurrentLabel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select label / 选择标签" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLabels.map(label => (
                      <SelectItem key={label.id} value={label.id}>
                        {label.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Value */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Memory Value / 记忆值 *
              </label>
              <Input
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="e.g., plays guitar / 例如：弹吉他"
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
                placeholder="Explain why this is a valid memory... / 解释为什么这是一个有效的记忆..."
                rows={2}
                className="text-sm"
              />
            </div>

            {/* Confidence */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confidence / 置信度 (0-1) *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={currentConfidence}
                onChange={(e) => setCurrentConfidence(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Time Scope */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Time Scope / 时间范围 *
              </label>
              <Select value={currentTimeScope} onValueChange={(val: any) => setCurrentTimeScope(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recent / 最近</SelectItem>
                  <SelectItem value="long_term">Long-term / 长期</SelectItem>
                  <SelectItem value="past_only">Past only / 仅过去</SelectItem>
                  <SelectItem value="unknown">Unknown / 未知</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Emotion (optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Emotion / 情绪 (optional)
              </label>
              <Select value={currentEmotion} onValueChange={(val: any) => setCurrentEmotion(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">None / 无</SelectItem>
                  <SelectItem value="Positive">Positive / 正面</SelectItem>
                  <SelectItem value="Negative">Negative / 负面</SelectItem>
                  <SelectItem value="Neutral">Neutral / 中性</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preference Attitude (for Preference labels only) */}
            {currentLabel.startsWith('Preferences/') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Preference Attitude / 偏好态度 *
                </label>
                <Select value={currentPreferenceAttitude} onValueChange={(val: any) => setCurrentPreferenceAttitude(val)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="null">None / 无</SelectItem>
                    <SelectItem value="like">Like / 喜欢</SelectItem>
                    <SelectItem value="dislike">Dislike / 不喜欢</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Evidence Info */}
            <div className="p-3 bg-purple-100 border border-purple-300 rounded">
              <label className="block text-sm font-medium text-purple-900 mb-1">
                Evidence / 证据 *
              </label>
              <p className="text-xs text-purple-800">
                {selectedUserUtterances.length} user utterance(s) selected. Click on blue messages in the conversation.
                <span className="block text-purple-700 mt-0.5">已选择{selectedUserUtterances.length}条用户话语。点击对话中的蓝色消息。</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSaveMemory}
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

      {/* Add New Button - only show when not editing */}
      {editingIndex === null && (
        <Button
          onClick={handleStartNew}
          variant="outline"
          className="w-full gap-2 border-dashed mb-3"
        >
          <Plus className="w-4 h-4" />
          Add Memory ({currentMemories.length}) / 添加记忆 ({currentMemories.length})
        </Button>
      )}

      {/* No Memory Button */}
      {editingIndex === null && currentMemories.length === 0 && (
        <Button
          onClick={onNoMemory}
          variant="outline"
          className="w-full gap-2 border-dashed text-slate-600"
        >
          <XCircle className="w-4 h-4" />
          No Memory in This Session (Skip) / 此会话无记忆（跳过）
        </Button>
      )}

      {/* Save All Button */}
      {currentMemories.length > 0 && editingIndex === null && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <Button
            onClick={onSave}
            className="w-full gap-2"
          >
            <Check className="w-4 h-4" />
            Save All Memories to Session / 保存所有记忆到会话
          </Button>
        </div>
      )}
    </Card>
  );
}