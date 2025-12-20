import { useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Upload, FileJson } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export interface FileData {
  file: File;
  totalLines: number;
  isNDJSON: boolean;
  rawContent: string; // Store raw content for lazy parsing
  userId?: string; // Store user_id if present in top-level format
  hasTopLevelMemory?: boolean; // Flag to indicate if file uses top-level memory format
  processedSessions?: any[]; // Store preprocessed sessions with memory distributed (for Format B)
}

// Export parsing function for lazy pagination
// NOTE: This function should NOT handle Format B anymore, 
// because Format B is preprocessed in processFile and stored in processedSessions
export function parseLinesFromContent(content: string, startLine: number, count: number, filename: string): any[] {
  const trimmedContent = content.trim();
  
  // FIRST: Try to parse as a single JSON object (regardless of file extension)
  // This handles cases where .ndjson files contain a single JSON object
  try {
    const parsed = JSON.parse(trimmedContent);
    
    // If it's Format B, this function should NOT be called
    // (Format B is handled via processedSessions)
    if (parsed.user_id !== undefined && Array.isArray(parsed.sessions)) {
      console.error('⚠️ parseLinesFromContent called with Format B data! This should not happen.');
      console.error('Format B should use processedSessions directly, not this function.');
      // Return empty to avoid errors
      return [];
    }
    
    // If it's a single object or array, return the slice
    const dataArray = Array.isArray(parsed) ? parsed : [parsed];
    return dataArray.slice(startLine, startLine + count);
  } catch (e) {
    // Not a single JSON object, continue to NDJSON parsing
    console.log('Not a single JSON object, attempting NDJSON parsing...');
  }
  
  // SECOND: NDJSON format - one JSON object per line
  const isNDJSON = filename.endsWith('.ndjson') || filename.endsWith('.jsonl');
  
  if (isNDJSON) {
    // For NDJSON format, split by newlines and parse each line
    const lines = trimmedContent.split('\n');
    
    // Try to parse the first line to determine if it's valid NDJSON
    if (lines.length > 0 && lines[0].trim().length > 0) {
      try {
        // Try to parse first line as JSON
        JSON.parse(lines[0].trim());
        
        // If successful, this is valid NDJSON - proceed with line-by-line parsing
        console.log('✅ Valid NDJSON format detected (compact, one object per line)');
        
        const objects = [];
        let objectCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Skip empty lines
          if (line.length === 0) {
            continue;
          }
          
          try {
            const parsed = JSON.parse(line);
            
            // CRITICAL: Check if this is a Format B object and unwrap it
            if (parsed.user_id !== undefined && Array.isArray(parsed.sessions)) {
              // This is Format B - extract and preprocess sessions
              console.log(`🔍 Line ${i + 1} is Format B, unwrapping sessions...`);
              
              // Process each session in this Format B object
              const preprocessedSessions = parsed.sessions.map((session: any) => {
                // Find memories that belong to this session
                const sessionMemories = parsed.memory_items?.filter((memory: any) => {
                  return memory.evidence?.session_id === session.session_id;
                }) || [];
                
                // Merge with existing session memory_items
                const existingMemories = session.memory_items || [];
                const allMemories = [...existingMemories, ...sessionMemories];
                
                // Handle intents_ranked
                let sessionIntents = session.intents_ranked || [];
                if (parsed.sessions.length === 1 && parsed.intents_ranked) {
                  sessionIntents = parsed.intents_ranked;
                }
                
                // Handle top-level memory_items for single session
                let finalMemories = allMemories;
                if (parsed.sessions.length === 1 && parsed.memory_items && parsed.memory_items.length > 0) {
                  const memoriesWithoutSessionId = parsed.memory_items.filter((memory: any) => {
                    return !memory.evidence?.session_id;
                  });
                  finalMemories = [...allMemories, ...memoriesWithoutSessionId];
                }
                
                return {
                  ...session,
                  intents_ranked: sessionIntents,
                  memory_items: finalMemories
                };
              });
              
              // Add all sessions from this Format B object
              for (const session of preprocessedSessions) {
                if (objectCount >= startLine && objectCount < startLine + count) {
                  objects.push(session);
                }
                objectCount++;
                
                if (objectCount >= startLine + count) {
                  break;
                }
              }
            } else {
              // Not Format B - regular session object
              if (objectCount >= startLine && objectCount < startLine + count) {
                objects.push(parsed);
              }
              objectCount++;
            }
            
            if (objectCount >= startLine + count) {
              break;
            }
          } catch (error) {
            console.error(`Error parsing NDJSON line ${i + 1}:`, line.substring(0, 100));
            toast.error(`Invalid NDJSON at line ${i + 1}. Each line must be a complete JSON object.`, {
              duration: 5000
            });
            throw error;
          }
        }
        
        return objects;
        
      } catch (firstLineError) {
        // First line is not valid JSON
        // This might be a pretty-printed JSON object in an NDJSON file
        console.warn('⚠️ First line is not valid JSON. Attempting to parse entire content as single JSON...');
        
        try {
          const parsed = JSON.parse(trimmedContent);
          
          // Check if it's Format B
          if (parsed.user_id !== undefined && Array.isArray(parsed.sessions)) {
            console.error('⚠️ Format B detected in parseLinesFromContent. This should use processedSessions.');
            return [];
          }
          
          // Successfully parsed as single JSON
          const dataArray = Array.isArray(parsed) ? parsed : [parsed];
          console.log('✅ Successfully parsed NDJSON file as regular JSON');
          return dataArray.slice(startLine, startLine + count);
        } catch (parseError) {
          console.error('❌ Failed to parse as JSON:', parseError);
          toast.error('Invalid file format. Cannot parse as JSON or NDJSON.', {
            duration: 5000
          });
          throw parseError;
        }
      }
    }
  }
  
  // If we get here, it's not a recognized format
  return [];
}

interface FileUploadProps {
  onFileLoad: (fileData: FileData, initialData: any[]) => void;
}

export function FileUpload({ onFileLoad }: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Count total lines without parsing all data
  // NOTE: This is only called for Format A and NDJSON
  // Format B total count is handled directly in processFile
  const countTotalLines = (content: string, filename: string): number => {
    // FIRST: Try to parse as a single JSON object (regardless of file extension)
    try {
      const parsed = JSON.parse(content.trim());
      
      // If it's Format B, this function should NOT be called
      if (parsed.user_id !== undefined && Array.isArray(parsed.sessions)) {
        console.error('⚠️ countTotalLines called with Format B data! This should not happen.');
        return 0;
      }
      
      // Single JSON object or array
      const count = Array.isArray(parsed) ? parsed.length : 1;
      return count;
    } catch (e) {
      // Not a single JSON object, continue to NDJSON counting
      console.log('Not a single JSON, attempting NDJSON line counting...');
    }
    
    // SECOND: NDJSON format - count lines
    const isNDJSON = filename.endsWith('.ndjson') || filename.endsWith('.jsonl');
    
    if (isNDJSON) {
      // For NDJSON, we need to check if lines contain Format B objects
      // If so, count sessions within each Format B object
      const lines = content.trim().split('\n');
      let totalSessions = 0;
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0) continue;
        
        try {
          const parsed = JSON.parse(trimmedLine);
          
          // Check if this is Format B
          if (parsed.user_id !== undefined && Array.isArray(parsed.sessions)) {
            // Format B: count sessions within this object
            totalSessions += parsed.sessions.length;
          } else {
            // Regular object
            totalSessions += 1;
          }
        } catch (e) {
          // If parsing fails, just count as 1
          totalSessions += 1;
        }
      }
      
      return totalSessions;
    }
    
    return 0;
  };

  // Helper function to split pretty-printed JSONL into individual JSON objects
  const splitPrettyPrintedJSON = (content: string): string[] => {
    const objects: string[] = [];
    let currentObject = '';
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = 0; i < content.length; i++) {
      const char = content[i];
      
      // Handle escape sequences in strings
      if (escapeNext) {
        currentObject += char;
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        currentObject += char;
        escapeNext = true;
        continue;
      }
      
      // Handle string delimiters
      if (char === '"') {
        inString = !inString;
        currentObject += char;
        continue;
      }
      
      // Only count braces outside of strings
      if (!inString) {
        if (char === '{') {
          braceCount++;
          currentObject += char;
        } else if (char === '}') {
          braceCount--;
          currentObject += char;
          
          // When braces are balanced, we have a complete object
          if (braceCount === 0 && currentObject.trim().length > 0) {
            objects.push(currentObject.trim());
            currentObject = '';
          }
        } else {
          currentObject += char;
        }
      } else {
        currentObject += char;
      }
    }
    
    // Add any remaining object
    if (currentObject.trim().length > 0 && braceCount === 0) {
      objects.push(currentObject.trim());
    }
    
    return objects;
  };

  const processFile = async (file: File): Promise<FileData | null> => {
    try {
      const text = await file.text();
      
      // Remove BOM if present (multiple types)
      let content = text;
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1); // UTF-8 BOM
      }
      if (content.charCodeAt(0) === 0xFFFE) {
        content = content.slice(1); // UTF-16 BOM
      }
      
      // Remove any leading/trailing whitespace
      content = content.trim();
      
      console.log(`📄 File: ${file.name}, Size: ${content.length} chars`);
      
      const isNDJSON = file.name.endsWith('.ndjson') || file.name.endsWith('.jsonl');
      
      if (isNDJSON) {
        console.log('📋 Processing NDJSON/JSONL file...');
        
        // Try compact format first (one JSON per line)
        const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        if (lines.length > 0 && lines[0]) {
          try {
            // Try to parse first line as complete JSON
            const firstObject = JSON.parse(lines[0]);
            console.log('✅ Compact NDJSON format detected (one object per line)');
            console.log('✅ First object keys:', Object.keys(firstObject));
            
            // All lines are complete JSON objects
            const totalSessions = countTotalLines(content, file.name);
            
            return {
              file,
              rawContent: content,
              totalLines: totalSessions,
              isNDJSON: true,
              processedSessions: null,
              hasTopLevelMemory: false,
              userId: null
            };
            
          } catch (error) {
            // Not compact format, try pretty-printed format
            console.log('⚠️ Not compact format, attempting pretty-printed JSONL parsing...');
            
            // Use brace-counting parser to split objects
            const objectStrings = splitPrettyPrintedJSON(content);
            console.log(`✅ Found ${objectStrings.length} JSON objects using brace-counting parser`);
            
            if (objectStrings.length === 0) {
              toast.error('No valid JSON objects found in file', { duration: 5000 });
              return null;
            }
            
            // Parse and validate all objects
            try {
              const parsedObjects = objectStrings.map((objStr, index) => {
                try {
                  return JSON.parse(objStr);
                } catch (e) {
                  console.error(`Failed to parse object ${index}:`, objStr.substring(0, 200));
                  throw new Error(`Invalid JSON at object ${index + 1}: ${e instanceof Error ? e.message : 'Unknown error'}`);
                }
              });
              
              console.log(`✅ Successfully parsed ${parsedObjects.length} objects`);
              console.log('✅ First object keys:', Object.keys(parsedObjects[0]));
              
              // Convert to compact NDJSON format for storage
              const compactContent = parsedObjects.map(obj => JSON.stringify(obj)).join('\n');
              
              // Count total sessions
              const totalSessions = countTotalLines(compactContent, file.name);
              
              return {
                file,
                rawContent: compactContent,
                totalLines: totalSessions,
                isNDJSON: true,
                processedSessions: null,
                hasTopLevelMemory: false,
                userId: null
              };
              
            } catch (parseError) {
              console.error('❌ Failed to parse objects:', parseError);
              toast.error(`Invalid NDJSON format: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`, {
                duration: 8000
              });
              return null;
            }
          }
        } else {
          throw new Error('File is empty or contains only whitespace');
        }
        
      } else {
        // .json file: Try to parse as complete JSON
        console.log('📄 Processing single JSON file...');
        
        try {
          const parsedData = JSON.parse(content);
          console.log('✅ Successfully parsed as complete JSON object');
          
          // Check if Format C: { count, data: [...] } where each data item has sessions
          if (parsedData.count !== undefined && Array.isArray(parsedData.data)) {
            console.log('🔍 Detected Format C: Top-level with count and data array');
            return handleFormatC(parsedData, file, content);
          }
          
          // Check if Format B: { user_id, sessions: [...] }
          if (parsedData.user_id !== undefined && Array.isArray(parsedData.sessions)) {
            console.log('🔍 Detected Format B: Single JSON with sessions array');
            return handleFormatB(parsedData, file, content);
          }
          
          // Format A: Single conversation object
          console.log('🔍 Detected Format A: Single conversation object');
          return {
            file,
            rawContent: content,
            totalLines: 1,
            isNDJSON: false,
            processedSessions: null,
            hasTopLevelMemory: false,
            userId: null
          };
          
        } catch (error) {
          console.error('❌ Failed to parse .json file:', error);
          toast.error('Invalid JSON file. File must contain valid JSON.', {
            duration: 5000
          });
          return null;
        }
      }
      
    } catch (error) {
      console.error('File processing error:', error);
      toast.error(`Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  const handleFormatB = (parsedData: any, file: File, content: string): FileData => {
    // Format B: { user_id, sessions: [...], memory_items: [...] }
    const userId = parsedData.user_id;
    const hasTopLevelMemory = true;
    
    console.log(`🔍 Detected Format B with user_id: ${userId}`);
    console.log(`📊 Total sessions: ${parsedData.sessions.length}`);
    console.log(`💾 Top-level memory items: ${parsedData.memory_items?.length || 0}`);
    console.log(`🎯 Top-level intents_ranked: ${parsedData.intents_ranked?.length || 0}`);
    
    // PREPROCESS: Distribute top-level data to sessions
    const processedSessions = parsedData.sessions.map((session: any, index: number) => {
      // Find memories that belong to this session (by session_id)
      const sessionMemories = parsedData.memory_items?.filter((memory: any) => {
        return memory.evidence?.session_id === session.session_id;
      }) || [];
      
      // Merge with existing session memory_items (if any)
      const existingMemories = session.memory_items || [];
      const allMemories = [...existingMemories, ...sessionMemories];
      
      // Handle intents_ranked
      // If there's only one session, assign top-level intents to it
      // Otherwise, look for session-specific intents
      let sessionIntents = session.intents_ranked || [];
      if (parsedData.sessions.length === 1 && parsedData.intents_ranked) {
        // Single session: top-level intents belong to this session
        sessionIntents = parsedData.intents_ranked;
      }
      
      // Handle top-level memory_items when there's only one session
      let finalMemories = allMemories;
      if (parsedData.sessions.length === 1 && parsedData.memory_items && parsedData.memory_items.length > 0) {
        // Single session: all top-level memories belong to this session
        // (even if they don't have session_id in evidence)
        const memoriesWithoutSessionId = parsedData.memory_items.filter((memory: any) => {
          return !memory.evidence?.session_id;
        });
        finalMemories = [...allMemories, ...memoriesWithoutSessionId];
      }
      
      // CRITICAL: Return the ACTUAL session object with its turns/conversation intact
      // Do NOT wrap it in another object
      return {
        ...session,  // This includes session_id, turns, conversation, etc.
        intents_ranked: sessionIntents,
        memory_items: finalMemories,
        memory_reasoning: parsedData.memory_reasoning || null  // Add reasoning if available
      };
    });
    
    console.log(`✅ Preprocessed ${processedSessions.length} sessions with distributed intents & memory`);
    console.log(`✅ Sample session structure:`, processedSessions[0] ? Object.keys(processedSessions[0]) : 'none');
    
    // Create FileData object
    const fileData: FileData = {
      file,
      totalLines: processedSessions.length,
      isNDJSON: file.name.endsWith('.ndjson') || file.name.endsWith('.jsonl'),
      rawContent: content,
      userId,
      hasTopLevelMemory,
      processedSessions // Store preprocessed sessions for Format B
    };
    
    return fileData;
  };

  const handleFormatC = (parsedData: any, file: File, content: string): FileData => {
    // Format C: { count, data: [...] } where each data item has:
    //   - user_id, line_index, sessions (array), intents_ranked, memory_items, memory_reasoning, id
    
    console.log(`🔍 Detected Format C with ${parsedData.data.length} data items`);
    console.log(`📊 Total count: ${parsedData.count}`);
    
    // Flatten all data items and process each one's sessions
    const allProcessedSessions: any[] = [];
    
    parsedData.data.forEach((dataItem: any, dataIndex: number) => {
      const userId = dataItem.user_id || 'unknown_user';
      const sessions = dataItem.sessions || [];
      const topLevelIntents = dataItem.intents_ranked || [];
      const topLevelMemories = dataItem.memory_items || [];
      const memoryReasoning = dataItem.memory_reasoning || null;
      
      console.log(`  📦 Data item ${dataIndex}: user_id=${userId}, sessions=${sessions.length}, intents=${topLevelIntents.length}, memories=${topLevelMemories.length}`);
      
      // Process each session in this data item
      sessions.forEach((session: any) => {
        // Find memories that belong to this session (by session_id)
        const sessionMemories = topLevelMemories.filter((memory: any) => {
          return memory.evidence?.session_id === session.session_id;
        });
        
        // Merge with existing session memory_items
        const existingMemories = session.memory_items || [];
        const allMemories = [...existingMemories, ...sessionMemories];
        
        // Handle intents_ranked
        // If there's only one session in this data item, assign top-level intents to it
        let sessionIntents = session.intents_ranked || [];
        if (sessions.length === 1 && topLevelIntents.length > 0) {
          sessionIntents = topLevelIntents;
        }
        
        // Handle top-level memory_items when there's only one session
        let finalMemories = allMemories;
        if (sessions.length === 1 && topLevelMemories.length > 0) {
          // Single session: all top-level memories belong to this session
          const memoriesWithoutSessionId = topLevelMemories.filter((memory: any) => {
            return !memory.evidence?.session_id;
          });
          finalMemories = [...allMemories, ...memoriesWithoutSessionId];
        }
        
        // Add processed session to flat list
        allProcessedSessions.push({
          ...session,  // Includes session_id, turns, conversation, etc.
          intents_ranked: sessionIntents,
          memory_items: finalMemories,
          memory_reasoning: memoryReasoning,  // Attach reasoning from parent data item
          data_item_user_id: userId,  // Store the user_id from data item
          data_item_line_index: dataItem.line_index,
          data_item_id: dataItem.id
        });
      });
    });
    
    console.log(`✅ Flattened Format C into ${allProcessedSessions.length} sessions`);
    console.log(`✅ Sample session structure:`, allProcessedSessions[0] ? Object.keys(allProcessedSessions[0]) : 'none');
    
    // Create FileData object
    const fileData: FileData = {
      file,
      totalLines: allProcessedSessions.length,
      isNDJSON: false,  // Format C is always a single JSON file
      rawContent: content,
      userId: parsedData.data[0]?.user_id || 'unknown_user',  // Use first data item's user_id
      hasTopLevelMemory: true,
      processedSessions: allProcessedSessions
    };
    
    return fileData;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file).then(fileData => {
        if (fileData) {
          const INITIAL_PAGE_SIZE = 100;
          let initialData: any[];
          
          if (fileData.processedSessions) {
            // Format B: Use preprocessed sessions
            initialData = fileData.processedSessions.slice(0, INITIAL_PAGE_SIZE);
            console.log(`📄 Loaded first ${initialData.length} sessions from preprocessed data`);
          } else {
            // Format A or NDJSON: Parse normally
            initialData = parseLinesFromContent(fileData.rawContent, 0, INITIAL_PAGE_SIZE, file.name);
            console.log(`📄 Parsed first ${initialData.length} objects`);
          }
          
          onFileLoad(fileData, initialData);
        }
      }).catch(error => {
        console.error('Error processing file:', error);
      });
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file).then(fileData => {
        if (fileData) {
          const INITIAL_PAGE_SIZE = 100;
          let initialData: any[];
          
          if (fileData.processedSessions) {
            // Format B: Use preprocessed sessions
            initialData = fileData.processedSessions.slice(0, INITIAL_PAGE_SIZE);
            console.log(`📄 Loaded first ${initialData.length} sessions from preprocessed data`);
          } else {
            // Format A or NDJSON: Parse normally
            initialData = parseLinesFromContent(fileData.rawContent, 0, INITIAL_PAGE_SIZE, file.name);
            console.log(`📄 Parsed first ${initialData.length} objects`);
          }
          
          onFileLoad(fileData, initialData);
        }
      }).catch(error => {
        console.error('Error processing file:', error);
      });
    }
  };

  return (
    <Card 
      className="p-8 border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-white transition-colors cursor-pointer"
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.ndjson,.jsonl"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="w-16 h-16 rounded-lg bg-slate-200 flex items-center justify-center">
          <FileJson className="w-8 h-8 text-slate-600" />
        </div>
        
        <div className="text-center">
          <p className="text-slate-700 mb-1">
            Drop JSON/NDJSON file here or click to browse
          </p>
          <p className="text-slate-500 text-sm">
            Supports .json, .ndjson, and .jsonl formats
          </p>
        </div>

        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="w-4 h-4" />
          Select File
        </Button>
      </div>
    </Card>
  );
}