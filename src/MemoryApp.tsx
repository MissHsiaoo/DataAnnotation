import { useState, useRef, useEffect, useCallback } from 'react';
import { JsonViewer } from './components/JsonViewer';
import { FileUpload, type FileData, parseLinesFromContent } from './components/FileUpload';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Input } from './components/ui/input';
import { Download, Trash2, BookOpen, Info, FileText, Check } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './components/ui/sonner';
import memoryConfig, { type MemoryCategory } from './config/memory-config';
import { Card } from './components/ui/card';
import { FileJson } from 'lucide-react';

const initialData = {
  "Speaker 1": [
    "I have two dogs and four cats.",
    "I like to ski and skate.",
    "I have thirty pairs of shoes.",
    "I like the smell of leather.",
    "I like Disney movies.",
    "I own a motorcycle.",
    "I like fast cars if they are as fast as my motorcycle."
  ],
  "Speaker 2": [
    "I am 15 years old.",
    "My name is Jessica.",
    "I am a waitress.",
    "My favorite movies are Disney movies.",
    "I love to read a lot.",
    "I have a car.",
    "My birthday is on December 4.",
    "I have a good relationship with my parents.",
    "I work part time at a diner.",
    "I am a good student.",
    "Trust is important to me."
  ],
  "in_dataset": 0
};

export type { MemoryCategory };

interface HighlightedText {
  text: string;
  categoryId: string;
  objectIndex?: number;
}

export default function MemoryApp() {
  // File and data management
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [currentObject, setCurrentObject] = useState<Record<string, any> | null>(null);
  const [totalObjects, setTotalObjects] = useState<number>(0);
  
  // Current object index (global, 0-based)
  const [currentObjectIndex, setCurrentObjectIndex] = useState<number>(0);
  
  // Modifications tracking: Map from object index to modified object
  const [modifications, setModifications] = useState<Map<number, Record<string, any>>>(new Map());
  
  // UI state
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [highlightedTexts, setHighlightedTexts] = useState<HighlightedText[]>([]);
  const [addedKeys, setAddedKeys] = useState<Array<{key: string, objectIndex?: number}>>([]);
  const [isDeleteMode, setIsDeleteMode] = useState<boolean>(false);
  const [manualUserId, setManualUserId] = useState<string>('');
  const [manualMemoryKey, setManualMemoryKey] = useState<string>('');
  const [manualMemoryValue, setManualMemoryValue] = useState<string>('');
  const memoryCounterRef = useRef(1);

  const categories: MemoryCategory[] = memoryConfig.memoryCategories;
  const defaultCategory: MemoryCategory = memoryConfig.defaultCategory;
  const allCategories = [...categories, defaultCategory];

  const handleFileLoad = (newFileData: FileData, initialData: any[]) => {
    setFileData(newFileData);
    setModifications(new Map());
    setCurrentObjectIndex(0);
    memoryCounterRef.current = 1;
    setHighlightedTexts([]);
    setAddedKeys([]);
    
    // Set first object data directly
    setCurrentObject(initialData[0] || null);
    // Use totalLines from fileData which is the accurate object count
    setTotalObjects(newFileData.totalLines);
  };
  
  // Update object data when index changes (LAZY LOADING)
  useEffect(() => {
    if (!fileData || !fileData.rawContent) return;
    
    // Parse only the current object from raw content
    const objectData = parseLinesFromContent(
      fileData.rawContent,
      currentObjectIndex,
      1,
      fileData.file.name
    );
    
    if (objectData.length === 0) return;
    
    // Apply modifications to the object data
    const finalObject = modifications.has(currentObjectIndex) 
      ? modifications.get(currentObjectIndex)! 
      : objectData[0];
    
    setCurrentObject(finalObject);
  }, [currentObjectIndex, fileData, modifications]);

  // Robust copy to clipboard function with fallback
  const copyToClipboard = (text: string): Promise<boolean> => {
    return new Promise((resolve) => {
      // Method 1: Try modern Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(() => resolve(true))
          .catch(() => {
            // Method 2: Fallback to execCommand
            fallbackCopy(text, resolve);
          });
      } else {
        // Method 2: Use execCommand fallback
        fallbackCopy(text, resolve);
      }
    });
  };

  const fallbackCopy = (text: string, resolve: (value: boolean) => void) => {
    try {
      // Create a temporary textarea
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '-9999px';
      document.body.appendChild(textarea);
      
      // Select and copy
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      resolve(successful);
    } catch (err) {
      console.error('Fallback copy failed:', err);
      resolve(false);
    }
  };

  const handleTextSelection = useCallback((selectedText: string, objectIndex?: number, shouldClearSelection?: () => void) => {
    if (selectedText.trim()) {
      // If no category is selected, just copy to clipboard
      if (currentCategory === null && !isDeleteMode) {
        copyToClipboard(selectedText.trim()).then((success) => {
          if (success) {
            toast.success('📋 Copied to clipboard', {
              duration: 1000,
            });
            // Clear selection after successful copy
            if (shouldClearSelection) {
              shouldClearSelection();
            }
          } else {
            toast.error('Failed to copy to clipboard');
          }
        });
        return;
      }
      
      if (!currentObject) return;
      
      // If in delete mode, delete memories instead of adding
      if (isDeleteMode) {
        // Find which memories are contained within the selected text
        const memoriesToDelete: number[] = [];
        highlightedTexts.forEach((highlight, index) => {
          if (selectedText.includes(highlight.text) && highlight.objectIndex === currentObjectIndex) {
            memoriesToDelete.push(index);
          }
        });
        
        if (memoriesToDelete.length === 0) {
          toast.error('No memories found in selected text');
          return;
        }
        
        // Get current object
        const currentObj = modifications.has(currentObjectIndex)
          ? modifications.get(currentObjectIndex)!
          : currentObject;
        
        // Delete the memories
        let newUserMemory = { ...(currentObj.UserMemory || {}) };
        memoriesToDelete.forEach(index => {
          const keyEntry = addedKeys[index];
          delete newUserMemory[keyEntry.key];
        });
        
        // Create modified object
        const modifiedObj = { ...currentObj };
        if (Object.keys(newUserMemory).length === 0) {
          delete modifiedObj.UserMemory;
        } else {
          modifiedObj.UserMemory = newUserMemory;
        }
        
        // Update modifications
        setModifications(prev => {
          const newMods = new Map(prev);
          newMods.set(currentObjectIndex, modifiedObj);
          return newMods;
        });
        
        // Update current object display
        setCurrentObject(modifiedObj);
        
        // Remove from highlightedTexts and addedKeys
        setHighlightedTexts(prev => prev.filter((_, index) => !memoriesToDelete.includes(index)));
        setAddedKeys(prev => prev.filter((_, index) => !memoriesToDelete.includes(index)));
        
        toast.success(`🗑️ Deleted ${memoriesToDelete.length} memory(ies)`, {
          duration: 1500,
        });
        return;
      }
      
      // Normal add mode
      const category = allCategories.find(cat => cat.id === currentCategory) || defaultCategory;
      const memoryKey = `${category.keyPrefix}__Memory_${memoryCounterRef.current}`;
      
      // Get current object (from modifications or current data)
      const currentObj = modifications.has(currentObjectIndex) 
        ? modifications.get(currentObjectIndex)!
        : currentObject;
      
      // Create modified object with new memory
      const modifiedObj = {
        ...currentObj,
        UserMemory: {
          ...(currentObj.UserMemory || {}),
          [memoryKey]: selectedText
        }
      };
      
      // Update modifications map
      setModifications(prev => {
        const newMods = new Map(prev);
        newMods.set(currentObjectIndex, modifiedObj);
        return newMods;
      });
      
      // Update current object display
      setCurrentObject(modifiedObj);
      
      // Add to highlighted texts (using objectIndex = 0 for single-object display)
      setHighlightedTexts(prev => [...prev, {
        text: selectedText.trim(),
        categoryId: currentCategory,
        objectIndex: currentObjectIndex
      }]);
      
      // Track this key for undo functionality
      setAddedKeys(prev => [...prev, { key: memoryKey, objectIndex: currentObjectIndex }]);
      
      memoryCounterRef.current += 1;
      
      toast.success(`✅ Added to ${category.name}`, {
        duration: 1000,
      });
      
      // Clear selection after adding memory
      if (shouldClearSelection) {
        shouldClearSelection();
      }
    }
  }, [currentObject, currentObjectIndex, modifications, currentCategory, allCategories, defaultCategory, isDeleteMode, highlightedTexts, addedKeys]);

  const handleDownload = () => {
    if (!fileData) {
      toast.error('No data loaded');
      return;
    }

    toast.info('Generating download...');
    
    // Parse all data from raw content
    const allDataForExport = parseLinesFromContent(
      fileData.rawContent,
      0,
      fileData.totalLines,
      fileData.file.name
    );
    
    let dataStr: string;
    let filename: string;
    let mimeType: string;
    
    // Merge original data with modifications
    const finalData = allDataForExport.map((obj, index) => {
      if (modifications.has(index)) {
        return modifications.get(index)!;
      }
      return obj;
    });

    if (fileData.isNDJSON || allDataForExport.length > 1) {
      // Export as NDJSON (newline-delimited JSON)
      dataStr = finalData.map(obj => JSON.stringify(obj)).join('\n');
      filename = `json-data-${Date.now()}.ndjson`;
      mimeType = 'application/x-ndjson';
    } else {
      // Export as regular JSON
      dataStr = JSON.stringify(finalData[0] || {}, null, 2);
      filename = `json-data-${Date.now()}.json`;
      mimeType = 'application/json';
    }
    
    const dataBlob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${fileData.isNDJSON ? 'NDJSON' : 'JSON'} file downloaded with ${modifications.size} modification(s)!`);
  };

  const handleUndo = useCallback(() => {
    if (addedKeys.length === 0) {
      toast.error('Nothing to undo');
      return;
    }

    const lastEntry = addedKeys[addedKeys.length - 1];
    const lastKey = lastEntry.key;
    const objectIndex = lastEntry.objectIndex || currentObjectIndex;
    
    // Get current object (from modifications or parse it)
    let currentObj;
    if (modifications.has(objectIndex)) {
      currentObj = modifications.get(objectIndex)!;
    } else if (objectIndex === currentObjectIndex) {
      currentObj = currentObject;
    } else if (fileData) {
      const objects = parseLinesFromContent(fileData.rawContent, objectIndex, 1, fileData.file.name);
      currentObj = objects[0];
    }
    
    if (currentObj && currentObj.UserMemory) {
      const newUserMemory = { ...currentObj.UserMemory };
      delete newUserMemory[lastKey];
      
      // Create modified object
      const modifiedObj = { ...currentObj };
      if (Object.keys(newUserMemory).length === 0) {
        delete modifiedObj.UserMemory;
      } else {
        modifiedObj.UserMemory = newUserMemory;
      }
      
      // Update modifications
      setModifications(prev => {
        const newMods = new Map(prev);
        newMods.set(objectIndex, modifiedObj);
        return newMods;
      });
      
      // Update current object if it's the one being displayed
      if (objectIndex === currentObjectIndex) {
        setCurrentObject(modifiedObj);
      }
    }
    
    setHighlightedTexts(prev => prev.slice(0, -1));
    setAddedKeys(prev => prev.slice(0, -1));
    
    toast.success(`⏮️ Undone: ${lastKey}`, {
      duration: 1500,
    });
  }, [addedKeys, modifications, currentObjectIndex, currentObject, fileData]);

  // Listen for keyboard shortcuts (dynamically based on config)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Alt+0 (Uncategorized/Default Category) - toggle behavior
      if (event.altKey && event.key === '0') {
        event.preventDefault();
        setIsDeleteMode(false);
        setCurrentCategory(prev => {
          if (prev === defaultCategory.id) {
            toast.success('🔓 Category deselected', { duration: 1500 });
            return null;
          } else {
            toast.success(`📂 ${defaultCategory.name} mode activated`, { duration: 1500 });
            return defaultCategory.id;
          }
        });
        return;
      }
      
      // Dynamically check for Alt+[shortcut] for any category in config - toggle behavior
      if (event.altKey) {
        const category = categories.find(cat => cat.shortcut === event.key);
        if (category) {
          event.preventDefault();
          setIsDeleteMode(false);
          setCurrentCategory(prev => {
            if (prev === category.id) {
              toast.success('🔓 Category deselected', { duration: 1500 });
              return null;
            } else {
              toast.success(`📂 ${category.name} mode activated`, { duration: 1500 });
              return category.id;
            }
          });
          return;
        }
      }
      
      // Check for Alt+Z (toggle delete mode)
      if (event.altKey && event.key === 'z') {
        event.preventDefault();
        setIsDeleteMode(prev => !prev);
        toast.success(isDeleteMode ? '➕ Add mode activated' : '🗑️ Delete mode activated', {
          duration: 1500,
        });
        return;
      }
      
      // Check for Ctrl+Z (undo)
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
        event.preventDefault();
        handleUndo();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [categories, defaultCategory, handleUndo, isDeleteMode, currentCategory]);

  const handleManualMemorySubmit = () => {
    if (!manualUserId.trim() || !manualMemoryKey.trim() || !manualMemoryValue.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!fileData) {
      toast.error('No data loaded. Please upload a file first.');
      return;
    }

    // Create the full key with category prefix
    const category = currentCategory ? allCategories.find(cat => cat.id === currentCategory) : defaultCategory;
    const fullKey = category ? `${category.keyPrefix}__${manualMemoryKey}` : `${defaultCategory.keyPrefix}__${manualMemoryKey}`;

    // For NDJSON: search through file for matching UserID
    toast.info('Searching for User ID...');
    
    // Parse all data to find the user
    const allData = parseLinesFromContent(fileData.rawContent, 0, fileData.totalLines, fileData.file.name);
    const objectIndex = allData.findIndex(obj => obj.UserID === manualUserId);
    
    if (objectIndex === -1) {
      toast.error(`User ID "${manualUserId}" not found in data`);
      return;
    }

    // Get current object
    const currentObj = modifications.has(objectIndex)
      ? modifications.get(objectIndex)!
      : allData[objectIndex];
    
    // Create modified object with new memory
    const modifiedObj = {
      ...currentObj,
      UserMemory: {
        ...(currentObj.UserMemory || {}),
        [fullKey]: manualMemoryValue
      }
    };
    
    // Update modifications map
    setModifications(prev => {
      const newMods = new Map(prev);
      newMods.set(objectIndex, modifiedObj);
      return newMods;
    });
    
    // If this is the currently displayed object, update it
    if (objectIndex === currentObjectIndex) {
      setCurrentObject(modifiedObj);
    }

    // Track this key for undo functionality
    setAddedKeys(prev => [...prev, { key: fullKey, objectIndex }]);
    
    toast.success(`✅ Added memory to User ${manualUserId}`);

    // Clear the form
    setManualUserId('');
    setManualMemoryKey('');
    setManualMemoryValue('');
  };

  const handleReset = () => {
    setFileData(null);
    setCurrentObject(null);
    setTotalObjects(0);
    setCurrentObjectIndex(0);
    setModifications(new Map());
    memoryCounterRef.current = 1;
    setHighlightedTexts([]);
    setAddedKeys([]);
    setCurrentCategory(null);
    toast.success('Viewer reset. Upload a new file to continue.');
  };

  const handleLoadExample = () => {
    const exampleFileData: FileData = {
      file: new File([], 'example.json'),
      totalLines: 1,
      isNDJSON: false,
      rawContent: JSON.stringify(initialData, null, 2)
    };
    
    setFileData(exampleFileData);
    setCurrentObject(initialData);
    setTotalObjects(1);
    setCurrentObjectIndex(0);
    setModifications(new Map());
    memoryCounterRef.current = 1;
    setHighlightedTexts([]);
    setAddedKeys([]);
    toast.success('Example data loaded!');
  };

  const getCurrentCategoryConfig = () => {
    if (currentCategory === null) return null;
    return allCategories.find(cat => cat.id === currentCategory) || defaultCategory;
  };

  const currentCategoryConfig = getCurrentCategoryConfig();

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3 mb-3">
            <BookOpen className="w-7 h-7 text-slate-700" />
            <h1 className="text-slate-900">Memory Marker</h1>
          </div>
          <p className="text-slate-600 max-w-3xl">
            A tool for extracting and categorizing memory entries from JSON/NDJSON dialogue data. 
            Select text to create structured memory annotations with configurable categories.
          </p>
        </div>

        {!currentObject ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Upload Area */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow border border-slate-200 p-8">
                <FileUpload onFileLoad={handleFileLoad} />
                <div className="text-center mt-6 pt-6 border-t border-slate-200">
                  <p className="text-slate-500 mb-3 text-sm">or</p>
                  <Button onClick={handleLoadExample} variant="outline" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Load Example Data
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Info Sidebar */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-5 border border-slate-200 shadow">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="w-4 h-4 text-slate-600" />
                  <h3 className="text-slate-900">Usage</h3>
                </div>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">1.</span>
                    <span>Upload JSON or NDJSON file (shows one object at a time)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">2.</span>
                    <span>Use Previous/Next buttons to navigate between objects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">3.</span>
                    <span>Select memory category with <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-xs border border-slate-300">Alt+1-5</kbd></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">4.</span>
                    <span>Highlight text to create memory</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">5.</span>
                    <span>Use <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-xs border border-slate-300">Alt+Z</kbd> for delete mode</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">6.</span>
                    <span>Press <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-xs border border-slate-300">Ctrl+Z</kbd> to undo</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-slate-400 mt-0.5">7.</span>
                    <span>Download exports all objects with modifications</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-slate-100 rounded-lg p-5 border border-slate-200">
                <h3 className="text-slate-900 mb-2">Features</h3>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Supports JSON, NDJSON, JSONL</li>
                  <li>• On-demand single object loading</li>
                  <li>• Modifications tracked per object</li>
                  <li>• Full file export with all changes</li>
                  <li>• Human/Assistant color coding</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Rest of the Memory Marker interface - continuing from the original App.tsx */}
            {/* File info and controls */}
            {fileData && (
              <Card className="p-4 bg-slate-50 border-slate-200">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <FileJson className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="font-medium text-slate-800">{fileData.file.name}</p>
                      <p className="text-sm text-slate-600">
                        Object {currentObjectIndex + 1} of {totalObjects}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
            
            {/* Category Selection */}
            <div className="bg-white rounded-lg shadow border border-slate-200 p-5">
              <h3 className="text-slate-900 mb-4">Memory Categories</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    onClick={() => {
                      setIsDeleteMode(false);
                      if (currentCategory === category.id) {
                        setCurrentCategory(null);
                        toast.success('🔓 Category deselected', { duration: 1000 });
                      } else {
                        setCurrentCategory(category.id);
                        toast.success(`📂 ${category.name} mode activated`, { duration: 1000 });
                      }
                    }}
                    variant={currentCategory === category.id && !isDeleteMode ? "default" : "outline"}
                    size="sm"
                    className="gap-2"
                    style={
                      currentCategory === category.id && !isDeleteMode
                        ? {
                            backgroundColor: category.color,
                            borderColor: category.textColor,
                            color: category.textColor,
                          }
                        : {}
                    }
                  >
                    <kbd className="px-1.5 py-0.5 text-xs rounded bg-white/50 border border-current">
                      Alt+{category.shortcut}
                    </kbd>
                    {category.name}
                  </Button>
                ))}
                <Button
                  onClick={() => {
                    setIsDeleteMode(false);
                    if (currentCategory === defaultCategory.id) {
                      setCurrentCategory(null);
                      toast.success('🔓 Category deselected', { duration: 1000 });
                    } else {
                      setCurrentCategory(defaultCategory.id);
                      toast.success(`📂 ${defaultCategory.name} mode activated`, { duration: 1000 });
                    }
                  }}
                  variant={currentCategory === defaultCategory.id && !isDeleteMode ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  style={
                    currentCategory === defaultCategory.id && !isDeleteMode
                      ? {
                          backgroundColor: defaultCategory.color,
                          borderColor: defaultCategory.textColor,
                          color: defaultCategory.textColor,
                        }
                      : {}
                  }
                >
                  <kbd className="px-1.5 py-0.5 text-xs rounded bg-white/50 border border-current">
                    Alt+0
                  </kbd>
                  {defaultCategory.name}
                </Button>
                <Button
                  onClick={() => {
                    setIsDeleteMode(prev => !prev);
                    toast.success(isDeleteMode ? '➕ Add mode activated' : '🗑️ Delete mode activated', { duration: 1000 });
                  }}
                  variant={isDeleteMode ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  style={
                    isDeleteMode
                      ? {
                          backgroundColor: '#dc2626',
                          borderColor: '#dc2626',
                          color: '#ffffff',
                        }
                      : {}
                  }
                >
                  <kbd className="px-1.5 py-0.5 text-xs rounded bg-white/50 border border-current">
                    Alt+Z
                  </kbd>
                  Delete Mode
                </Button>
              </div>
              
              {/* Manual Memory Input */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="mb-3">
                  <h3 className="text-sm text-slate-700">Add Custom Memory</h3>
                  <p className="text-xs text-slate-500 mt-1">Manually add a key-value pair to a specific user</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <Input
                    placeholder="User ID"
                    value={manualUserId}
                    onChange={(e) => setManualUserId(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Memory Key"
                    value={manualMemoryKey}
                    onChange={(e) => setManualMemoryKey(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Memory Value"
                    value={manualMemoryValue}
                    onChange={(e) => setManualMemoryValue(e.target.value)}
                    className="text-sm md:col-span-1"
                  />
                  <Button
                    onClick={handleManualMemorySubmit}
                    size="sm"
                    className="gap-2"
                    disabled={!currentObject}
                  >
                    <Check className="w-4 h-4" />
                    Confirm
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Will use current category prefix: <span className="font-mono">{currentCategoryConfig ? currentCategoryConfig.keyPrefix : defaultCategory.keyPrefix}__</span>
                </p>
              </div>
              
              {/* Status Bar */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between flex-wrap gap-3 text-sm">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-slate-500">Active Mode:</span>
                    <Badge 
                      variant="outline" 
                      className="gap-1.5"
                      style={isDeleteMode ? { 
                        backgroundColor: '#fee2e2', 
                        borderColor: '#dc2626', 
                        color: '#dc2626'
                      } : currentCategoryConfig ? {
                        backgroundColor: currentCategoryConfig.color,
                        borderColor: currentCategoryConfig.textColor,
                        color: currentCategoryConfig.textColor
                      } : {
                        backgroundColor: '#f1f5f9',
                        borderColor: '#64748b',
                        color: '#64748b'
                      }}
                    >
                      {isDeleteMode ? 'Delete' : (currentCategoryConfig ? currentCategoryConfig.name : 'No Category (Copy Mode)')}
                    </Badge>
                  </div>
                  <div className="text-slate-600">
                    {addedKeys.length} {addedKeys.length === 1 ? 'memory' : 'memories'}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-between items-center bg-white rounded-lg p-4 border border-slate-200 shadow">
              <div className="text-sm text-slate-600">
                {fileData ? (
                  <span>Format: {fileData.isNDJSON ? 'NDJSON' : 'JSON'} ({totalObjects} objects total, {modifications.size} modified)</span>
                ) : (
                  <span>Format: JSON</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDownload} variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button onClick={handleReset} variant="outline" size="sm" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Reset
                </Button>
              </div>
            </div>

            {/* JSON Viewer */}
            <JsonViewer 
              data={[currentObject]}
              onTextSelection={handleTextSelection}
              highlightedTexts={highlightedTexts.filter(h => h.objectIndex === currentObjectIndex)}
              categories={allCategories}
              currentObjectIndex={currentObjectIndex}
              totalObjects={totalObjects}
              onObjectIndexChange={(newIndex) => {
                // Directly set the new global index
                setCurrentObjectIndex(newIndex);
              }}
            />
            
            {/* Object Statistics */}
            {fileData && totalObjects > 1 && (
              <div className="text-center text-sm text-slate-500">
                Viewing object {currentObjectIndex + 1} of {totalObjects}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
