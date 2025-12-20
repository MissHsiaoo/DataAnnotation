import { useState, useEffect } from 'react';
import { FileUpload, type FileData, parseLinesFromContent } from './components/FileUpload';
import { ConversationViewer } from './components/ConversationViewer';
import { IntentAnnotationForm } from './components/IntentAnnotationForm';
import { MemoryExtractionForm } from './components/MemoryExtractionForm';
import { MemoryReasoningDisplay } from './components/MemoryReasoningDisplay';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Download, Trash2, BookOpen, Info, FileText, ChevronLeft, ChevronRight, Target, Brain, ArrowRight, Hash, Save, HardDrive, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';
import { 
  currentAutoSaveConfig, 
  getStorageKey, 
  cleanupOldBackups, 
  checkStorageQuota 
} from './config/auto-save-config';

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

interface Session {
  session_id?: string;
  conversation_id?: string;
  started_at?: string;
  ended_at?: string;
  turns?: Array<{
    utterance_index: number;
    role: 'user' | 'assistant';
    timestamp: string;
    text: string;
  }>;
  conversation?: Array<{
    human?: string;
    assistant?: string;
  }>;
  intents_ranked?: IntentAnnotation[];
  memory_items?: MemoryItem[];
  memory_reasoning?: string;
  [key: string]: any;
}

export default function IntentApp() {
  // File and data management
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [totalSessions, setTotalSessions] = useState<number>(0);
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(0);
  
  // Modifications tracking: Map from session index to modified session
  const [modifications, setModifications] = useState<Map<number, Session>>(new Map());
  
  // Store user_id if the file has top-level user_id
  const [userId, setUserId] = useState<string>('unknown_user');
  
  // Annotation stage: 'intent' or 'memory'
  const [annotationStage, setAnnotationStage] = useState<'intent' | 'memory'>('intent');
  
  // Current annotation state
  const [currentAnnotations, setCurrentAnnotations] = useState<IntentAnnotation[]>([]);
  const [currentMemories, setCurrentMemories] = useState<MemoryItem[]>([]);
  const [selectedUserUtterances, setSelectedUserUtterances] = useState<number[]>([]);
  
  // Jump to session
  const [jumpToInput, setJumpToInput] = useState<string>('');
  
  // Local storage key for this session
  const [localStorageKey, setLocalStorageKey] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  // AUTO-SAVE: Save modifications to localStorage whenever they change
  useEffect(() => {
    if (!currentAutoSaveConfig.enabled || !fileData || !localStorageKey || modifications.size === 0) return;
    
    try {
      const dataToSave = currentAutoSaveConfig.includeMetadata ? {
        modifications: Array.from(modifications.entries()),
        userId: userId,
        timestamp: new Date().toISOString(),
        fileName: fileData.file.name,
        totalSessions: totalSessions
      } : {
        modifications: Array.from(modifications.entries())
      };
      
      localStorage.setItem(localStorageKey, JSON.stringify(dataToSave));
      setLastSavedTime(new Date());
      console.log(`💾 Auto-saved ${modifications.size} modifications to localStorage`);
      
      // Cleanup old backups if configured
      if (currentAutoSaveConfig.maxBackupFiles > 0) {
        const deletedCount = cleanupOldBackups(currentAutoSaveConfig);
        if (deletedCount > 0) {
          console.log(`🗑️ Cleaned up ${deletedCount} old backup(s)`);
        }
      }
      
      // Check storage quota
      const quotaCheck = checkStorageQuota(currentAutoSaveConfig);
      if (quotaCheck.isNearLimit && quotaCheck.warning) {
        toast.warning(quotaCheck.warning, { duration: 5000 });
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      toast.error('Failed to auto-save locally. Storage may be full.');
    }
  }, [modifications, fileData, localStorageKey, userId, totalSessions]);
  
  // RESTORE: Try to restore modifications from localStorage on file load
  const tryRestoreFromLocalStorage = (fileName: string): Map<number, Session> | null => {
    try {
      const storageKey = `intent-memory-annotations-${fileName}`;
      const savedData = localStorage.getItem(storageKey);
      
      if (!savedData) return null;
      
      const parsed = JSON.parse(savedData);
      const restoredMap = new Map<number, Session>(parsed.modifications);
      
      console.log(`🔄 Restored ${restoredMap.size} modifications from localStorage`);
      console.log(`   Saved at: ${parsed.timestamp}`);
      
      return restoredMap;
    } catch (error) {
      console.error('Failed to restore from localStorage:', error);
      return null;
    }
  };
  
  // CLEAR: Clear localStorage for current file
  const clearLocalStorage = () => {
    if (!localStorageKey) return;
    
    try {
      localStorage.removeItem(localStorageKey);
      setLastSavedTime(null);
      toast.success('Local backup cleared');
      console.log(`🗑️ Cleared localStorage for key: ${localStorageKey}`);
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  };

  const handleFileLoad = (newFileData: FileData, initialData: any[]) => {
    setFileData(newFileData);
    setModifications(new Map());
    setCurrentSessionIndex(0);
    setCurrentAnnotations([]);
    setCurrentMemories([]);
    setSelectedUserUtterances([]);
    
    // Store user_id from file if present
    if (newFileData.userId) {
      setUserId(newFileData.userId);
      console.log(`Loaded file with user_id: ${newFileData.userId}`);
    } else {
      setUserId('unknown_user');
    }
    
    // Set first session data directly
    const firstSession = initialData[0] || null;
    console.log(`🔍 First session object:`, firstSession);
    console.log(`🔍 First session has turns?`, firstSession?.turns?.length);
    console.log(`🔍 First session has conversation?`, firstSession?.conversation?.length);
    setCurrentSession(firstSession);
    setTotalSessions(newFileData.totalLines);
    
    // Load existing annotations if present
    if (firstSession?.intents_ranked) {
      console.log(`📌 Loading ${firstSession.intents_ranked.length} existing intents`);
      setCurrentAnnotations(firstSession.intents_ranked);
    } else {
      setCurrentAnnotations([]);
    }
    
    // Load existing memories if present
    if (firstSession?.memory_items) {
      console.log(`💾 Loading ${firstSession.memory_items.length} existing memories`);
      setCurrentMemories(firstSession.memory_items);
    } else {
      setCurrentMemories([]);
    }
    
    const formatMsg = newFileData.hasTopLevelMemory 
      ? ` (Format: Top-level memory with user_id: ${newFileData.userId})`
      : '';
    toast.success(`Loaded ${newFileData.totalLines} conversation sessions${formatMsg}`);
    
    // Set localStorage key for this file
    const storageKey = `intent-memory-annotations-${newFileData.file.name}`;
    setLocalStorageKey(storageKey);
    
    // Try to restore modifications from localStorage
    const restoredMods = tryRestoreFromLocalStorage(newFileData.file.name);
    if (restoredMods) {
      setModifications(restoredMods);
      toast.info(`Restored ${restoredMods.size} modifications from local storage`);
    }
  };
  
  // Update session data when index changes (LAZY LOADING)
  useEffect(() => {
    if (!fileData || !fileData.rawContent) return;
    
    let sessionData: any[];
    
    // Use preprocessed sessions if available (Format B)
    if (fileData.processedSessions) {
      sessionData = [fileData.processedSessions[currentSessionIndex]];
      console.log(`📖 Loading session ${currentSessionIndex} from preprocessed data`);
    } else {
      // Parse from raw content (Format A or NDJSON)
      sessionData = parseLinesFromContent(
        fileData.rawContent,
        currentSessionIndex,
        1,
        fileData.file.name
      );
      console.log(`📖 Parsing session ${currentSessionIndex} from raw content`);
    }
    
    if (sessionData.length === 0 || !sessionData[0]) return;
    
    // Apply modifications to the session data
    const finalSession = modifications.has(currentSessionIndex) 
      ? modifications.get(currentSessionIndex)! 
      : sessionData[0];
    
    console.log(`📊 Final session for index ${currentSessionIndex}:`, {
      session_id: finalSession.session_id || finalSession.conversation_id,
      has_turns: !!finalSession.turns,
      has_conversation: !!finalSession.conversation,
      intents_count: finalSession.intents_ranked?.length || 0,
      memory_count: finalSession.memory_items?.length || 0
    });
    
    setCurrentSession(finalSession);
    
    // Load existing annotations
    const loadedIntents = finalSession.intents_ranked || [];
    const loadedMemories = finalSession.memory_items || [];
    
    console.log(`📌 Setting ${loadedIntents.length} intents for display`);
    console.log(`💾 Setting ${loadedMemories.length} memories for display`);
    
    setCurrentAnnotations(loadedIntents);
    setCurrentMemories(loadedMemories);
    setSelectedUserUtterances([]);
  }, [currentSessionIndex, fileData, modifications]);

  const handlePrevious = () => {
    if (currentSessionIndex > 0) {
      setCurrentSessionIndex(currentSessionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentSessionIndex < totalSessions - 1) {
      setCurrentSessionIndex(currentSessionIndex + 1);
    }
  };

  const handleUserUtteranceToggle = (utteranceIndex: number) => {
    setSelectedUserUtterances(prev => {
      if (prev.includes(utteranceIndex)) {
        return prev.filter(idx => idx !== utteranceIndex);
      } else {
        return [...prev, utteranceIndex];
      }
    });
  };

  const handleSaveAnnotations = () => {
    if (!currentSession) return;
    
    // SAFETY: Validate annotations exist and have content
    if (!currentAnnotations || currentAnnotations.length === 0) {
      toast.error('No annotations to save');
      return;
    }
    
    // Normalize probabilities if needed
    const totalProb = currentAnnotations.reduce((sum, ann) => sum + (ann.probability || 0), 0);
    if (Math.abs(totalProb - 1.0) > 0.01) {
      toast.error('Probabilities must sum to 1.0 / 概率总和必须为1.0');
      return;
    }
    
    // Validate each annotation has required fields
    for (const ann of currentAnnotations) {
      if (!ann.intent_category || !ann.reasoning || !ann.evidence || ann.evidence.length === 0) {
        toast.error('All annotations must have category, reasoning, and evidence');
        return;
      }
    }
    
    // CRITICAL FIX: Preserve existing memory_items when saving intents
    const modifiedSession = {
      ...currentSession,
      intents_ranked: currentAnnotations,
      memory_items: currentSession.memory_items || []  // Preserve existing memories
    };
    
    // Update modifications map
    setModifications(prev => {
      const newMods = new Map(prev);
      newMods.set(currentSessionIndex, modifiedSession);
      return newMods;
    });
    
    // Update current session display
    setCurrentSession(modifiedSession);
    
    const sessionId = currentSession.session_id || currentSession.conversation_id || 'session';
    toast.success(`✅ Saved ${currentAnnotations.length} intent(s) to ${sessionId}`);
  };

  const handleSaveMemories = () => {
    if (!currentSession) return;
    
    // SAFETY: Validate memories
    if (!currentMemories || currentMemories.length === 0) {
      toast.error('No memories to save');
      return;
    }
    
    // Validate each memory has required fields
    for (const mem of currentMemories) {
      if (!mem.label || !mem.value || !mem.reasoning || !mem.evidence) {
        toast.error('All memories must have label, value, reasoning, and evidence');
        return;
      }
    }
    
    // CRITICAL FIX: Preserve existing intents_ranked when saving memories
    const modifiedSession = {
      ...currentSession,
      intents_ranked: currentSession.intents_ranked || [],  // Preserve existing intents
      memory_items: currentMemories
    };
    
    // Update modifications map
    setModifications(prev => {
      const newMods = new Map(prev);
      newMods.set(currentSessionIndex, modifiedSession);
      return newMods;
    });
    
    // Update current session display
    setCurrentSession(modifiedSession);
    
    const sessionId = currentSession.session_id || currentSession.conversation_id || 'session';
    toast.success(`✅ Saved ${currentMemories.length} memory item(s) to ${sessionId}`);
  };
  
  const handleReasoningUpdate = (newReasoning: string) => {
    if (!currentSession) return;
    
    // Update the session with new reasoning
    const modifiedSession = {
      ...currentSession,
      memory_reasoning: newReasoning
    };
    
    // Update modifications map
    setModifications(prev => {
      const newMods = new Map(prev);
      newMods.set(currentSessionIndex, modifiedSession);
      return newMods;
    });
    
    // Update current session display
    setCurrentSession(modifiedSession);
    
    toast.success('✅ Memory reasoning updated');
  };
  
  const handleNoMemory = () => {
    if (!currentSession) return;
    
    // Create modified session with empty memory array
    const modifiedSession = {
      ...currentSession,
      memory_items: []
    };
    
    // Update modifications map
    setModifications(prev => {
      const newMods = new Map(prev);
      newMods.set(currentSessionIndex, modifiedSession);
      return newMods;
    });
    
    // Update current session display
    setCurrentSession(modifiedSession);
    setCurrentMemories([]);
    
    toast.success('✅ Marked as "No Memory" - skipping to next session');
    
    // Auto-advance to next session
    setTimeout(() => {
      if (currentSessionIndex < totalSessions - 1) {
        setCurrentSessionIndex(currentSessionIndex + 1);
      }
    }, 500);
  };

  const handleDownload = () => {
    if (!fileData) {
      toast.error('No data loaded');
      return;
    }

    toast.info('Generating download with all modifications...');
    
    // AUTO-SAVE: Automatically save current annotations before downloading
    if (currentSession && (currentAnnotations.length > 0 || currentMemories.length > 0)) {
      const autoSavedSession = {
        ...currentSession,
        intents_ranked: currentAnnotations,
        memory_items: currentMemories
      };
      
      // Temporarily add current session to modifications for export
      const tempModifications = new Map(modifications);
      tempModifications.set(currentSessionIndex, autoSavedSession);
      
      console.log(`💾 Auto-saving current session ${currentSessionIndex} before download`);
      
      // Use tempModifications for this download (don't persist to state)
      performDownload(tempModifications);
    } else {
      // No current unsaved work, proceed normally
      performDownload(modifications);
    }
  };
  
  const performDownload = (modsToUse: Map<number, Session>) => {
    if (!fileData) return;
    
    console.log('🔍 Starting download process...');
    console.log(`📊 Modifications to apply: ${modsToUse.size}`);
    
    try {
      // Parse the original file to preserve its structure
      const originalData = JSON.parse(fileData.rawContent);
      console.log('📄 Original file structure:', Object.keys(originalData));
      
      // STRATEGY: Directly modify the original structure based on file format
      
      // Check if this is Format B: { user_id, sessions, intents_ranked, memory_items }
      if (originalData.user_id !== undefined && Array.isArray(originalData.sessions)) {
        console.log('📋 Format B detected - preserving top-level structure');
        
        // Apply modifications to sessions array in place
        originalData.sessions = originalData.sessions.map((session: any, index: number) => {
          if (modsToUse.has(index)) {
            const modified = modsToUse.get(index)!;
            console.log(`✏️ Applying modification to session ${index}`);
            
            // Merge modifications while preserving original session structure
            return {
              ...session,
              // Update with modifications (intents/memories might be in session or will go to top-level)
              intents_ranked: modified.intents_ranked,
              memory_items: modified.memory_items,
              memory_reasoning: modified.memory_reasoning
            };
          }
          return session;
        });
        
        // If file originally had top-level intents_ranked, collect from all sessions
        if (originalData.intents_ranked !== undefined) {
          const allIntents: IntentAnnotation[] = [];
          originalData.sessions.forEach((session: any) => {
            if (session.intents_ranked && session.intents_ranked.length > 0) {
              allIntents.push(...session.intents_ranked);
              // Remove from session after collecting
              delete session.intents_ranked;
            }
          });
          originalData.intents_ranked = allIntents;
          console.log(`📊 Collected ${allIntents.length} intents to top-level`);
        }
        
        // If file originally had top-level memory_items, collect from all sessions
        if (originalData.memory_items !== undefined) {
          const allMemories: MemoryItem[] = [];
          let memoryIdCounter = 1;
          originalData.sessions.forEach((session: any) => {
            if (session.memory_items && session.memory_items.length > 0) {
              session.memory_items.forEach((memory: MemoryItem) => {
                allMemories.push({
                  ...memory,
                  memory_id: `m${memoryIdCounter++}`
                });
              });
              // Remove from session after collecting
              delete session.memory_items;
            }
          });
          originalData.memory_items = allMemories;
          console.log(`💾 Collected ${allMemories.length} memories to top-level`);
        }
        
        // If file originally had top-level memory_reasoning, collect from first modified session
        if (originalData.memory_reasoning !== undefined) {
          let foundReasoning = false;
          for (const session of originalData.sessions) {
            if (session.memory_reasoning) {
              if (!foundReasoning) {
                originalData.memory_reasoning = session.memory_reasoning;
                foundReasoning = true;
              }
              delete session.memory_reasoning;
            }
          }
          console.log(`🧠 Updated top-level memory_reasoning: ${foundReasoning}`);
        }
        
      }
      // Check if this is Format C: { count, data: [...] }
      else if (originalData.count !== undefined && Array.isArray(originalData.data)) {
        console.log('📋 Format C detected - preserving data array structure');
        
        // Apply modifications to data array
        originalData.data = originalData.data.map((dataItem: any, index: number) => {
          if (modsToUse.has(index)) {
            const modified = modsToUse.get(index)!;
            console.log(`✏️ Applying modification to data item ${index}`);
            
            return {
              ...dataItem,
              intents_ranked: modified.intents_ranked,
              memory_items: modified.memory_items,
              memory_reasoning: modified.memory_reasoning
            };
          }
          return dataItem;
        });
        
        // Update count to match data length
        originalData.count = originalData.data.length;
      }
      // Format A or unknown: single object or array
      else if (Array.isArray(originalData)) {
        console.log('📋 Array format detected');
        
        // Apply modifications to array elements
        const modifiedArray = originalData.map((item: any, index: number) => {
          if (modsToUse.has(index)) {
            const modified = modsToUse.get(index)!;
            console.log(`✏️ Applying modification to array item ${index}`);
            
            return {
              ...item,
              intents_ranked: modified.intents_ranked,
              memory_items: modified.memory_items,
              memory_reasoning: modified.memory_reasoning
            };
          }
          return item;
        });
        
        // Download the modified array directly
        const dataStr = JSON.stringify(modifiedArray, null, 2);
        const filename = `intent-memory-annotations-${Date.now()}.json`;
        downloadFile(dataStr, filename);
        
        toast.success(`✅ Downloaded ${modsToUse.size} annotated item(s)!`);
        return;
      }
      else {
        console.log('📋 Single object format detected');
        
        // Single object - apply modification if it's the first one
        if (modsToUse.has(0)) {
          const modified = modsToUse.get(0)!;
          console.log(`✏️ Applying modification to single object`);
          
          Object.assign(originalData, {
            intents_ranked: modified.intents_ranked,
            memory_items: modified.memory_items,
            memory_reasoning: modified.memory_reasoning
          });
        }
      }
      
      // Download the modified original structure
      const dataStr = JSON.stringify(originalData, null, 2);
      const filename = `intent-memory-annotations-${Date.now()}.json`;
      console.log(`📦 Export size: ${(dataStr.length / 1024).toFixed(2)} KB`);
      
      downloadFile(dataStr, filename);
      
      const intentCount = countIntents(originalData);
      const memoryCount = countMemories(originalData);
      toast.success(`✅ Downloaded: ${modsToUse.size} annotated session(s), ${intentCount} intents, ${memoryCount} memories!`);
      
    } catch (error) {
      console.error('❌ Download failed:', error);
      toast.error('Failed to generate download. Check console for details.');
    }
  };
  
  // Helper function to download file
  const downloadFile = (dataStr: string, filename: string) => {
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  // Helper function to count intents in any structure
  const countIntents = (data: any): number => {
    let count = 0;
    if (data.intents_ranked && Array.isArray(data.intents_ranked)) {
      count += data.intents_ranked.length;
    }
    if (data.sessions && Array.isArray(data.sessions)) {
      data.sessions.forEach((session: any) => {
        if (session.intents_ranked && Array.isArray(session.intents_ranked)) {
          count += session.intents_ranked.length;
        }
      });
    }
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((item: any) => {
        if (item.intents_ranked && Array.isArray(item.intents_ranked)) {
          count += item.intents_ranked.length;
        }
      });
    }
    return count;
  };
  
  // Helper function to count memories in any structure
  const countMemories = (data: any): number => {
    let count = 0;
    if (data.memory_items && Array.isArray(data.memory_items)) {
      count += data.memory_items.length;
    }
    if (data.sessions && Array.isArray(data.sessions)) {
      data.sessions.forEach((session: any) => {
        if (session.memory_items && Array.isArray(session.memory_items)) {
          count += session.memory_items.length;
        }
      });
    }
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach((item: any) => {
        if (item.memory_items && Array.isArray(item.memory_items)) {
          count += item.memory_items.length;
        }
      });
    }
    return count;
  };

  const handleReset = () => {
    setFileData(null);
    setCurrentSession(null);
    setTotalSessions(0);
    setCurrentSessionIndex(0);
    setModifications(new Map());
    setCurrentAnnotations([]);
    setCurrentMemories([]);
    setSelectedUserUtterances([]);
    toast.success('Viewer reset. Upload a new file to continue.');
  };
  
  const handleJumpTo = () => {
    const targetIndex = parseInt(jumpToInput, 10);
    if (isNaN(targetIndex)) {
      toast.error('Please enter a valid number');
      return;
    }
    
    // Convert 1-based input to 0-based index
    const zeroBasedIndex = targetIndex - 1;
    
    if (zeroBasedIndex < 0 || zeroBasedIndex >= totalSessions) {
      toast.error(`Session number must be between 1 and ${totalSessions}`);
      return;
    }
    
    setCurrentSessionIndex(zeroBasedIndex);
    setJumpToInput('');
    toast.success(`Jumped to session ${targetIndex}`);
  };

  const userTurns = currentSession?.turns?.filter(turn => turn.role === 'user') || [];
  const isAnnotated = modifications.has(currentSessionIndex);
  
  // Convert conversation format to turns for userTurns if needed
  const getUserTurns = () => {
    if (currentSession?.turns) {
      return currentSession.turns.filter(turn => turn.role === 'user').map(turn => ({
        utterance_index: turn.utterance_index,
        text: turn.text
      }));
    } else if (currentSession?.conversation) {
      const turns: Array<{ utterance_index: number; text: string }> = [];
      let index = 0;
      currentSession.conversation.forEach(pair => {
        if (pair.human) {
          turns.push({
            utterance_index: index++,
            text: pair.human
          });
        }
        if (pair.assistant) {
          index++;
        }
      });
      return turns;
    }
    return [];
  };
  
  const userTurnsForForms = getUserTurns();

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3 mb-3">
            <Target className="w-7 h-7 text-slate-700" />
            <h1 className="text-slate-900">Intent & Memory Human Annotation Toolkit / 意图与记忆人工标注工具</h1>
          </div>
          <p className="text-slate-600 max-w-3xl">
            A dual-stage annotation system for conversational AI research. Classify user intents using an 8-category 
            taxonomy, then extract structured long-term memory entries with a 27-label schema.
            <br />
            <span className="text-slate-500 text-sm mt-1 block">
              双阶段会话式AI标注系统。使用8类分类法标注用户意图，然后使用27标签体系提取结构化长期记忆。
            </span>
          </p>
        </div>

        {!currentSession ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Upload Area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow border border-slate-200 p-8">
                <FileUpload onFileLoad={handleFileLoad} />
              </div>
            </div>
            
            {/* Info Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-5 border border-slate-200 shadow">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-slate-600" />
                  <h3 className="text-slate-900">Workflow / 工作流程</h3>
                </div>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">1.</span>
                    <span>Upload NDJSON file with conversation sessions<br /><span className="text-xs text-slate-500">上传包含对话记录的NDJSON文件</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">2.</span>
                    <span>Read the user-assistant conversation<br /><span className="text-xs text-slate-500">阅读用户-助手对话</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">3.</span>
                    <span>Click on user utterances to select evidence<br /><span className="text-xs text-slate-500">点击用户话语选择证据</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">4.</span>
                    <span>Add up to 2 intent annotations<br /><span className="text-xs text-slate-500">添加最多2个意图标注</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">5.</span>
                    <span>Ensure probabilities sum to 1.0<br /><span className="text-xs text-slate-500">确保概率总和为1.0</span></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">6.</span>
                    <span>Navigate to next session or download<br /><span className="text-xs text-slate-500">导航到下一会话或下载</span></span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-100 rounded-lg p-5 border border-slate-200">
                <h3 className="text-slate-900 mb-2">Intent Categories / 意图类别</h3>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Informational 信息查询</li>
                  <li>• Problem-Solving 问题解决</li>
                  <li>• Creative 创意创作</li>
                  <li>• Educational 教育学习</li>
                  <li>• Personal Interaction 个人互动</li>
                  <li>• Technical & Professional 技术专业</li>
                  <li>• Transactional 事务处理</li>
                  <li>• Ethical & Philosophical 伦理哲学</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Session info and navigation */}
            <Card className="p-4 bg-slate-50 border-slate-200">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-slate-600" />
                  <div>
                    <p className="font-medium text-slate-800">
                      Session {currentSessionIndex + 1} of {totalSessions}
                    </p>
                    <p className="text-sm text-slate-600">
                      {currentSession.session_id || currentSession.conversation_id || 'Unknown'}
                      {isAnnotated && (
                        <Badge variant="outline" className="ml-2 bg-green-100 border-green-500 text-green-700 text-xs">
                          Annotated
                        </Badge>
                      )}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 flex-wrap items-center">
                  {/* Jump To */}
                  <div className="flex gap-1 items-center">
                    <Hash className="w-4 h-4 text-slate-400" />
                    <Input
                      type="number"
                      value={jumpToInput}
                      onChange={(e) => setJumpToInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleJumpTo();
                        }
                      }}
                      placeholder="Jump to #"
                      className="w-24 h-8 text-sm"
                      min="1"
                      max={totalSessions}
                    />
                    <Button
                      onClick={handleJumpTo}
                      variant="outline"
                      size="sm"
                      disabled={!jumpToInput}
                    >
                      Go
                    </Button>
                  </div>
                  
                  {/* Prev/Next */}
                  <Button
                    onClick={handlePrevious}
                    disabled={currentSessionIndex === 0}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={currentSessionIndex >= totalSessions - 1}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left: Conversation Viewer */}
              <ConversationViewer
                session={currentSession}
                selectedUserUtterances={selectedUserUtterances}
                onUserUtteranceToggle={handleUserUtteranceToggle}
              />

              {/* Right: Annotation Forms with Stage Switcher */}
              <div className="space-y-4">
                {/* Stage Selector */}
                <Card className="p-4 bg-white border-slate-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-slate-900">Annotation Stage</h3>
                    {currentSession.intents_ranked && currentSession.intents_ranked.length > 0 && (
                      <Badge variant="outline" className="bg-blue-100 border-blue-500 text-blue-700">
                        Intent ✓
                      </Badge>
                    )}
                    {currentSession.memory_items && currentSession.memory_items.length > 0 && (
                      <Badge variant="outline" className="bg-purple-100 border-purple-500 text-purple-700">
                        Memory ✓
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={annotationStage === 'intent' ? 'default' : 'outline'}
                      onClick={() => {
                        setAnnotationStage('intent');
                        setSelectedUserUtterances([]);
                      }}
                      className="flex-1 gap-2"
                    >
                      <Target className="w-4 h-4" />
                      1. Intent
                    </Button>
                    <Button
                      variant={annotationStage === 'memory' ? 'default' : 'outline'}
                      onClick={() => {
                        if (!currentAnnotations || currentAnnotations.length === 0) {
                          toast.warning('Please annotate intents first');
                          return;
                        }
                        setAnnotationStage('memory');
                        setSelectedUserUtterances([]);
                      }}
                      className="flex-1 gap-2"
                      disabled={!currentAnnotations || currentAnnotations.length === 0}
                    >
                      <Brain className="w-4 h-4" />
                      2. Memory
                    </Button>
                  </div>
                  {annotationStage === 'intent' && currentAnnotations.length > 0 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs text-green-800">
                        ✅ Intent annotations complete! Click "2. Memory" to extract memories.
                      </p>
                    </div>
                  )}
                </Card>

                {/* Intent or Memory Form */}
                {annotationStage === 'intent' ? (
                  <IntentAnnotationForm
                    currentAnnotations={currentAnnotations}
                    selectedUserUtterances={selectedUserUtterances}
                    userTurns={userTurnsForForms}
                    onAnnotationsChange={setCurrentAnnotations}
                    onSave={handleSaveAnnotations}
                  />
                ) : (
                  <MemoryExtractionForm
                    sessionId={currentSession.session_id || currentSession.conversation_id || 'unknown'}
                    currentMemories={currentMemories}
                    selectedUserUtterances={selectedUserUtterances}
                    userTurns={userTurnsForForms}
                    onMemoriesChange={setCurrentMemories}
                    onSave={handleSaveMemories}
                    onNoMemory={handleNoMemory}
                  />
                )}
              </div>
            </div>

            {/* Memory Reasoning Display (if exists) */}
            {currentSession.memory_reasoning && (
              <MemoryReasoningDisplay 
                reasoning={currentSession.memory_reasoning} 
                onReasoningUpdate={handleReasoningUpdate}
              />
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-between items-center bg-white rounded-lg p-4 border border-slate-200 shadow flex-wrap">
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-600">
                  {modifications.size} session(s) annotated out of {totalSessions}
                </div>
                {lastSavedTime && (
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>
                      Auto-saved locally at {lastSavedTime.toLocaleTimeString()}
                      <br />
                      <span className="text-slate-500">本地自动保存于 {lastSavedTime.toLocaleTimeString()}</span>
                    </span>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {localStorageKey && modifications.size > 0 && (
                  <Button 
                    onClick={clearLocalStorage} 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-slate-600 hover:text-orange-600"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    Clear Local Backup
                  </Button>
                )}
                <Button onClick={handleDownload} variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download All
                </Button>
                <Button onClick={handleReset} variant="outline" size="sm" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}