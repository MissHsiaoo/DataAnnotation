import { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Toaster } from './ui/sonner';
import type { MemoryCategory } from '../App';

interface HighlightedText {
  text: string;
  categoryId: string;
  objectIndex?: number;
}

interface JsonViewerProps {
  data: Record<string, any> | Array<Record<string, any>>;
  onTextSelection: (text: string, objectIndex?: number, shouldClearSelection?: () => void) => void;
  highlightedTexts: HighlightedText[];
  categories: MemoryCategory[];
  currentObjectIndex?: number;
  onObjectIndexChange?: (index: number) => void;
  totalObjects?: number; // Total objects in the file (for display)
}

export function JsonViewer({ data, onTextSelection, highlightedTexts, categories, currentObjectIndex, onObjectIndexChange, totalObjects }: JsonViewerProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const handleMouseUp = () => {
      const selection = window.getSelection();
      let text = selection?.toString().trim();
      
      if (text && contentRef.current?.contains(selection?.anchorNode as Node)) {
        // Remove surrounding quotes if present
        text = text.replace(/^["']|["']$/g, '');
        
        // Find which object the selection came from (for NDJSON arrays)
        let objectIndex: number | undefined = undefined;
        if (Array.isArray(data)) {
          // Traverse up the DOM to find the data-object-index attribute
          let node = selection?.anchorNode as Node | null;
          while (node && node !== contentRef.current) {
            if (node instanceof HTMLElement && node.hasAttribute('data-object-index')) {
              objectIndex = parseInt(node.getAttribute('data-object-index') || '-1', 10);
              break;
            }
            node = node.parentNode;
          }
        }
        
        setSelectedText(text);
        
        // Create a function to clear the selection
        const clearSelection = () => {
          setTimeout(() => {
            selection?.removeAllRanges();
          }, 300);
        };
        
        // Pass the clear function to the callback
        onTextSelection(text, objectIndex, clearSelection);
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, [onTextSelection, data]);

  // Get category config by ID
  const getCategoryConfig = (categoryId: string): MemoryCategory | undefined => {
    return categories.find(cat => cat.id === categoryId);
  };

  // Function to split text into segments with category-based highlighting
  const getTextSegments = (text: string, objectIndex?: number): Array<{ text: string; categoryId: string | null }> => {
    // Filter highlighted texts for this specific object (if NDJSON)
    const relevantHighlights = objectIndex !== undefined 
      ? highlightedTexts.filter(h => h.objectIndex === objectIndex)
      : highlightedTexts;

    // First check for exact match
    const exactMatch = relevantHighlights.find(h => h.text === text);
    if (exactMatch) {
      return [{ text, categoryId: exactMatch.categoryId }];
    }

    // Find all matches within this text
    const segments: Array<{ text: string; categoryId: string | null }> = [];
    let remainingText = text;
    let currentIndex = 0;

    // Sort highlighted texts by length (longest first) to handle overlapping matches
    const sortedHighlights = [...relevantHighlights].sort((a, b) => b.text.length - a.text.length);

    while (currentIndex < text.length) {
      let foundMatch = false;

      for (const highlight of sortedHighlights) {
        const matchIndex = remainingText.indexOf(highlight.text);
        if (matchIndex === 0) {
          // Add the matched segment
          segments.push({
            text: highlight.text,
            categoryId: highlight.categoryId
          });
          
          remainingText = remainingText.slice(highlight.text.length);
          currentIndex += highlight.text.length;
          foundMatch = true;
          break;
        }
      }

      if (!foundMatch) {
        // Find the next match position
        let nextMatchIndex = remainingText.length;
        let nextMatch = null;

        for (const highlight of sortedHighlights) {
          const matchIndex = remainingText.indexOf(highlight.text);
          if (matchIndex > 0 && matchIndex < nextMatchIndex) {
            nextMatchIndex = matchIndex;
            nextMatch = highlight;
          }
        }

        if (nextMatch) {
          // Add non-highlighted text before the next match
          segments.push({
            text: remainingText.slice(0, nextMatchIndex),
            categoryId: null
          });
          remainingText = remainingText.slice(nextMatchIndex);
          currentIndex += nextMatchIndex;
        } else {
          // No more matches, add remaining text
          if (remainingText.length > 0) {
            segments.push({
              text: remainingText,
              categoryId: null
            });
          }
          break;
        }
      }
    }

    return segments.length > 0 ? segments : [{ text, categoryId: null }];
  };

  const renderValue = (value: any, key: string, depth: number = 0, objectIndex?: number): JSX.Element => {
    const indent = depth * 24;
    
    // Check if this is a human or assistant field for special coloring
    const isHumanField = key.toLowerCase() === 'human';
    const isAssistantField = key.toLowerCase() === 'assistant';

    if (Array.isArray(value)) {
      return (
        <div style={{ marginLeft: `${indent}px` }}>
          <div className="text-slate-900">
            &quot;{key}&quot;: [
          </div>
          {value.map((item, index) => {
            return (
              <div key={index} style={{ marginLeft: `${indent + 24}px` }} className="text-slate-900">
                {typeof item === 'object' && item !== null ? (
                  <div>
                    <div>{'{'}</div>
                    {Object.entries(item).map(([k, v], idx, arr) => (
                      <div key={k}>
                        {renderValue(v, k, depth + 2, objectIndex)}
                        {idx < arr.length - 1 && <span>,</span>}
                      </div>
                    ))}
                    <div>{'}'}{index < value.length - 1 ? ',' : ''}</div>
                  </div>
                ) : (
                  <>
                    {(() => {
                      const itemStr = String(item);
                      const segments = getTextSegments(itemStr, objectIndex);
                      return (
                        <span className="select-text cursor-text">
                          &quot;
                          {segments.map((segment, segIndex) => {
                            const category = segment.categoryId ? getCategoryConfig(segment.categoryId) : null;
                            const backgroundColor = category ? category.color : '';
                            
                            return (
                              <span 
                                key={segIndex}
                                className="hover:bg-yellow-100 transition-colors rounded px-0.5"
                                style={backgroundColor ? { backgroundColor } : {}}
                              >
                                {segment.text}
                              </span>
                            );
                          })}
                          &quot;
                        </span>
                      );
                    })()}
                    {index < value.length - 1 ? ',' : ''}
                  </>
                )}
              </div>
            );
          })}
          <div style={{ marginLeft: `${indent}px` }} className="text-slate-900">]</div>
        </div>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <div style={{ marginLeft: `${indent}px` }}>
          <div className="text-slate-900">
            &quot;{key}&quot;: {'{'}
          </div>
          {Object.entries(value).map(([k, v], index, arr) => (
            <div key={k}>
              {renderValue(v, k, depth + 1, objectIndex)}
              {index < arr.length - 1 && <span className="text-slate-900">,</span>}
            </div>
          ))}
          <div style={{ marginLeft: `${indent}px` }} className="text-slate-900">{'}'}</div>
        </div>
      );
    }

    // Handle primitives (string, number, boolean, null)
    const renderPrimitiveValue = () => {
      if (value === null) {
        return <span>null</span>;
      }
      
      if (typeof value === 'string') {
        const segments = getTextSegments(value, objectIndex);
        
        // Apply special background colors for human/assistant
        let fieldBackgroundColor = '';
        if (isHumanField) {
          fieldBackgroundColor = 'rgba(59, 130, 246, 0.1)'; // Light blue for human
        } else if (isAssistantField) {
          fieldBackgroundColor = 'rgba(34, 197, 94, 0.1)'; // Light green for assistant
        }
        
        return (
          <span 
            className="select-text cursor-text"
            style={fieldBackgroundColor ? { 
              backgroundColor: fieldBackgroundColor,
              padding: '2px 4px',
              borderRadius: '3px',
              display: 'inline-block'
            } : {}}
          >
            &quot;
            {segments.map((segment, index) => {
              const category = segment.categoryId ? getCategoryConfig(segment.categoryId) : null;
              const backgroundColor = category ? category.color : '';
              
              return (
                <span 
                  key={index}
                  className="hover:bg-yellow-100 transition-colors rounded px-0.5"
                  style={backgroundColor ? { backgroundColor } : {}}
                >
                  {segment.text}
                </span>
              );
            })}
            &quot;
          </span>
        );
      }
      
      if (typeof value === 'number' || typeof value === 'boolean') {
        return <span className="text-blue-600">{String(value)}</span>;
      }
      
      return <span>{String(value)}</span>;
    };

    return (
      <div style={{ marginLeft: `${indent}px` }} className="text-slate-900">
        <span className={isHumanField ? 'text-blue-700 font-semibold' : isAssistantField ? 'text-green-700 font-semibold' : ''}>
          &quot;{key}&quot;:
        </span>{' '}
        {renderPrimitiveValue()}
      </div>
    );
  };

  const renderData = () => {
    if (Array.isArray(data)) {
      // Always render the first (and only) object in the array
      if (data.length > 0) {
        const obj = data[0];
        return (
          <div data-object-index={currentObjectIndex}>
            <div className="text-slate-900">{'{'}</div>
            {Object.entries(obj).map(([key, value], idx, arr) => (
              <div key={key}>
                {renderValue(value, key, 1, currentObjectIndex)}
                {idx < arr.length - 1 && <span className="text-slate-900">,</span>}
              </div>
            ))}
            <div className="text-slate-900">{'}'}</div>
          </div>
        );
      }
      
      return <div className="text-slate-500">No data</div>;
    } else {
      // Render regular JSON object
      return (
        <div>
          <div className="text-slate-900">{'{'}</div>
          {Object.entries(data).map(([key, value], index, arr) => (
            <div key={key}>
              {renderValue(value, key, 1)}
              {index < arr.length - 1 && <span className="text-slate-900">,</span>}
            </div>
          ))}
          <div className="text-slate-900">{'}'}</div>
        </div>
      );
    }
  };

  const handlePreviousObject = () => {
    if (currentObjectIndex !== undefined && onObjectIndexChange) {
      onObjectIndexChange(currentObjectIndex - 1);
    }
  };

  const handleNextObject = () => {
    if (currentObjectIndex !== undefined && onObjectIndexChange) {
      onObjectIndexChange(currentObjectIndex + 1);
    }
  };

  return (
    <Card className="p-5 bg-white border border-slate-200 shadow rounded-lg">
      <div className="mb-4 pb-3 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-slate-900">Data Preview</h2>
            <p className="text-slate-500 text-sm mt-1">
              Select any text to extract as a memory
            </p>
          </div>
          {totalObjects !== undefined && totalObjects > 0 && (
            <div className="text-sm text-slate-600 bg-slate-100 px-3 py-1.5 rounded">
              Object <span className="font-semibold">{(currentObjectIndex ?? 0) + 1}</span> of <span className="font-semibold">{totalObjects}</span>
            </div>
          )}
        </div>
      </div>
      
      <div
        ref={contentRef}
        className="font-mono text-sm overflow-x-auto bg-slate-50 p-4 rounded border border-slate-200 max-h-[600px] overflow-y-auto"
      >
        {renderData()}
      </div>

      {totalObjects !== undefined && totalObjects > 1 && (
        <div className="flex justify-between items-center gap-3 mt-4 pt-4 border-t border-slate-200">
          <Button
            onClick={handlePreviousObject}
            disabled={currentObjectIndex === 0}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <span className="text-xs text-slate-500">
            Use arrow buttons to navigate between objects
          </span>
          <Button
            onClick={handleNextObject}
            disabled={currentObjectIndex === (totalObjects - 1)}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </Card>
  );
}