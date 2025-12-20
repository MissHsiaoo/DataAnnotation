# Memory Marker - Complete Usage Guidelines

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Features](#features)
4. [Keyboard Shortcuts](#keyboard-shortcuts)
5. [Workflow](#workflow)
6. [Memory Categories](#memory-categories)
7. [Pagination System](#pagination-system)
8. [Manual Memory Addition](#manual-memory-addition)
9. [File Format Support](#file-format-support)
10. [Configuration](#configuration)
11. [Tips & Best Practices](#tips--best-practices)
12. [Troubleshooting](#troubleshooting)

---

## Overview

**Memory Marker** is a professional data annotation tool for extracting and categorizing memory entries from JSON and NDJSON dialogue data. It provides:

- 🎯 **Text Selection Interface**: Highlight any text to create structured memory annotations
- 🎨 **Configurable Categories**: 5 default memory categories (Identity, Activity, Preferences, Belongings, Relationships) with custom keyboard shortcuts
- 📄 **NDJSON Support**: Works with both single JSON objects and newline-delimited JSON files
- 📊 **Pagination**: Efficiently handles large files by loading 100 lines at a time
- 💾 **Modification Tracking**: All changes are tracked per-object and merged on export
- ⚡ **Fast Workflow**: Keyboard-driven interface for rapid annotation

---

## Getting Started

### Step 1: Load Data

**Option A: Upload a File**
1. Click the **Upload JSON/NDJSON File** button
2. Select a `.json`, `.ndjson`, or `.jsonl` file
3. The file will be automatically parsed and paginated

**Option B: Load Example Data**
1. Click **Load Example Data** to start with sample dialogue data
2. Explore the interface with pre-loaded content

### Step 2: Select a Category

Use keyboard shortcuts to activate a memory category:
- Press **Alt+1** for Identity
- Press **Alt+2** for Activity
- Press **Alt+3** for Preferences
- Press **Alt+4** for Belongings
- Press **Alt+5** for Relationships
- Press **Alt+0** for Uncategorized

💡 Press the same shortcut again to deselect and enter "copy mode"

### Step 3: Extract Memories

1. **Highlight text** in the JSON viewer by clicking and dragging
2. The text is automatically added as a memory with a unique key
3. The highlight color matches your selected category
4. A success toast confirms the memory was added

### Step 4: Download Results

Click **Download JSON** to export the complete file with all modifications merged.

---

## Features

### ✅ Current Capabilities

| Feature | Description |
|---------|-------------|
| **JSON & NDJSON Support** | Works with single objects or line-delimited files |
| **Paginated Loading** | Loads 100 lines per page for performance |
| **5 Memory Categories** | Identity, Activity, Preferences, Belongings, Relationships |
| **Toggle Categories** | Press shortcuts again to deselect |
| **Copy Mode** | When no category selected, highlighting copies to clipboard |
| **Delete Mode** | Alt+Z to remove memories |
| **Undo** | Ctrl+Z to undo last action |
| **Manual Entry** | Add memories via form (User ID, Key, Value) |
| **Visual Highlights** | Color-coded highlights for each category |
| **Modification Tracking** | Tracks changes per object across all pages |
| **Full File Export** | Downloads complete file with all modifications |
| **Responsive Design** | Clean, professional, academic aesthetic |

---

## Keyboard Shortcuts

### Category Selection (Toggle Mode)
| Shortcut | Category | Color |
|----------|----------|-------|
| **Alt+1** | Identity | Pink |
| **Alt+2** | Activity | Yellow |
| **Alt+3** | Preferences | Blue |
| **Alt+4** | Belongings | Green |
| **Alt+5** | Relationships | Orange |
| **Alt+0** | Uncategorized | Purple |

💡 **Toggle Behavior**: Pressing the same shortcut deselects the category and enters "copy mode"

### Operations
| Shortcut | Action |
|----------|--------|
| **Alt+Z** | Toggle Delete Mode (select highlighted text to delete memories) |
| **Ctrl+Z** (or **Cmd+Z**) | Undo last memory addition |

### Navigation
| Control | Action |
|---------|--------|
| **Previous/Next** buttons | Navigate between pages |
| **Lines per page** dropdown | Change pagination size (25, 50, 100, 200, 500) |

---

## Workflow

### Standard Annotation Workflow

```
1. Upload File (JSON/NDJSON)
   ↓
2. Navigate to desired page
   ↓
3. Press Alt+1-5 to select category
   ↓
4. Highlight text in JSON viewer
   ↓
5. Memory is auto-added with color highlight
   ↓
6. Repeat steps 3-5 for more memories
   ↓
7. Download modified file
```

### Copy Mode Workflow

```
1. Do NOT select any category (or deselect current one)
   ↓
2. Highlight any text
   ↓
3. Text is copied to clipboard
   ↓
4. Toast notification confirms copy
```

### Delete Workflow

```
1. Press Alt+Z to enter Delete Mode
   ↓
2. Highlight text containing memories
   ↓
3. All memories within selection are deleted
   ↓
4. Highlights are removed and JSON is updated
```

---

## Memory Categories

### Default Categories

#### 1. **Identity** (Alt+1) - Light Pink
- **Purpose**: Personal identity information
- **Examples**: Name, age, occupation, hometown
- **Key Prefix**: `Identity__Memory_1`, `Identity__Memory_2`, ...

#### 2. **Activity** (Alt+2) - Light Yellow
- **Purpose**: Actions, hobbies, activities
- **Examples**: "I like to ski", "I play guitar"
- **Key Prefix**: `Activity__Memory_1`, `Activity__Memory_2`, ...

#### 3. **Preferences** (Alt+3) - Light Blue
- **Purpose**: Likes, dislikes, opinions
- **Examples**: "I love Disney movies", "I prefer tea over coffee"
- **Key Prefix**: `Preferences__Memory_1`, `Preferences__Memory_2`, ...

#### 4. **Belongings** (Alt+4) - Light Green
- **Purpose**: Possessions, owned items
- **Examples**: "I have two dogs", "I own a motorcycle"
- **Key Prefix**: `Belongings__Memory_1`, `Belongings__Memory_2`, ...

#### 5. **Relationships** (Alt+5) - Light Orange
- **Purpose**: Relationships with others
- **Examples**: "I have a good relationship with my parents"
- **Key Prefix**: `Relationships__Memory_1`, `Relationships__Memory_2`, ...

#### 0. **Uncategorized** (Alt+0) - Purple
- **Purpose**: Fallback for miscellaneous memories
- **Key Prefix**: `Memory__Memory_1`, `Memory__Memory_2`, ...

### Customization

See [Configuration](#configuration) section or `/config/README.md` for details on creating custom categories.

---

## Pagination System

### How It Works

1. **File Loading**: When you upload a large NDJSON file, only the first 100 lines are loaded initially
2. **Page Navigation**: Use Previous/Next buttons to navigate
3. **Modification Tracking**: Changes are tracked globally by line number, not per-page
4. **Smart Merging**: On download, all modifications are merged with the original complete file

### Page Size Options

- **25 lines**: For detailed review
- **50 lines**: Balanced view
- **100 lines**: Default (recommended)
- **200 lines**: Faster navigation
- **500 lines**: Maximum throughput

### Current Page Display

```
Showing lines 1-100 of 5000
[Previous] [Next]
Lines per page: [100 ▼]
```

### Important Notes

⚠️ **Modifications persist across pages**: If you add a memory on page 1, navigate to page 5, and download, the modification from page 1 is still included.

⚠️ **Page-local vs Global Indices**: The system automatically converts between page-local indices (0-99) and global file indices.

---

## Manual Memory Addition

Use the manual form when you need to add a memory without selecting text.

### Form Fields

1. **User ID**: The UserID from your NDJSON data (e.g., `e006`, `user_123`)
2. **Memory Key**: Custom key name (will be prefixed with category, e.g., `Identity__CustomKey`)
3. **Memory Value**: The memory content/value

### Usage Example

```
User ID: e006
Memory Key: CustomInfo
Memory Value: Prefers morning meetings

→ Creates: Identity__CustomInfo: "Prefers morning meetings"
   in the object where UserID === "e006"
```

### Current Category Affects Key Prefix

- If **Identity** is selected: `Identity__CustomKey`
- If **No category** selected: `Memory__CustomKey`
- If **Activity** is selected: `Activity__CustomKey`

---

## File Format Support

### Supported Formats

| Format | Extension | Description |
|--------|-----------|-------------|
| **JSON** | `.json` | Single JSON object |
| **NDJSON** | `.ndjson` | Newline-delimited JSON (one object per line) |
| **JSONL** | `.jsonl` | Same as NDJSON |

### JSON Structure

#### Regular JSON (Single Object)
```json
{
  "Speaker 1": ["Statement 1", "Statement 2"],
  "Speaker 2": ["Statement 3", "Statement 4"]
}
```

Memories added as:
```json
{
  "Speaker 1": ["Statement 1", "Statement 2"],
  "Speaker 2": ["Statement 3", "Statement 4"],
  "Identity__Memory_1": "Selected text here"
}
```

#### NDJSON (Multiple Objects)
```json
{"UserID": "e001", "Dialogue": ["你好", "我很好"]}
{"UserID": "e002", "Dialogue": ["谢谢", "不客气"]}
```

Memories added to specific object:
```json
{"UserID": "e001", "Dialogue": ["你好", "我很好"], "UserMemory": {"Identity__Memory_1": "你好"}}
{"UserID": "e002", "Dialogue": ["谢谢", "不客气"]}
```

### Parsing Strategies

Memory Marker uses **4 fallback parsing strategies** to handle various NDJSON formatting issues:

1. **Strategy 1**: Standard line-by-line JSON parsing
2. **Strategy 2**: Trim whitespace from each line
3. **Strategy 3**: Split by `}\n{` and reconstruct objects
4. **Strategy 4**: Split by `}{` (no newline) and reconstruct

This ensures maximum compatibility with real-world data.

---

## Configuration

### Customizing Memory Categories

Edit `/config/memory-config.ts` to customize categories, colors, and shortcuts.

#### Add a New Category

```typescript
{
  id: "emotion",
  name: "Emotion",
  shortcut: "6",  // Alt+6
  color: "rgba(233, 213, 255, 0.3)",
  textColor: "rgb(147, 51, 234)",
  keyPrefix: "Emotion"
}
```

#### Change Colors

```typescript
{
  color: "rgba(255, 200, 200, 0.3)",  // Light background (RGBA)
  textColor: "rgb(200, 50, 50)"        // Dark border/text (RGB)
}
```

#### Change Shortcuts

```typescript
{
  shortcut: "e"  // Alt+E instead of Alt+1
}
```

See `/config/README.md` for complete configuration documentation.

---

## Tips & Best Practices

### 📌 Workflow Optimization

1. **Use keyboard shortcuts exclusively** - Much faster than clicking buttons
2. **Toggle categories as needed** - No need to deselect between similar memories
3. **Use copy mode for reference** - Deselect category to quickly copy text without modifying data
4. **Review page-by-page** - Don't rush through large files

### 🎨 Visual Organization

1. **Consistent category usage** - Use the same category for similar information types
2. **Color-coded review** - Quickly scan highlights to verify categorization
3. **Leverage page navigation** - Break annotation into manageable chunks

### 💾 Data Management

1. **Download frequently** - Export your work periodically to avoid data loss
2. **Version your exports** - Files are timestamped (e.g., `json-data-1730000000.ndjson`)
3. **Test with small files first** - Familiarize yourself with the interface before annotating large datasets

### ⚡ Speed Tips

1. **Master Alt+1-5** - Develop muscle memory for category shortcuts
2. **Use Ctrl+Z liberally** - Don't worry about mistakes, just undo
3. **Increase lines per page** - For familiar data, use 200-500 lines per page
4. **Alt+Z for bulk delete** - Select multiple highlighted memories at once

---

## Troubleshooting

### Issue: File won't upload

**Possible Causes:**
- File is not valid JSON/NDJSON
- File is empty
- File encoding issues

**Solutions:**
1. Validate JSON structure using a JSON validator
2. Check file encoding (should be UTF-8)
3. Try with a smaller sample file first
4. Check browser console for specific error messages

---

### Issue: Highlights don't appear

**Possible Causes:**
- No category is selected (copy mode is active)
- Text selection is outside the JSON viewer
- Text is too short (trimmed to empty)

**Solutions:**
1. Press Alt+1-5 to select a category
2. Ensure you're selecting text inside the JSON viewer panel
3. Select at least a few characters of text

---

### Issue: Delete mode not working

**Possible Causes:**
- ~~Bug where highlights were removed but memory wasn't deleted (FIXED)~~
- Not selecting text that contains a memory
- Wrong object selected in NDJSON

**Solutions:**
1. ✅ **FIXED**: Global index calculation now correct, deletes work properly
2. Ensure you select text that is actually highlighted
3. Verify you're on the correct page/object

---

### Issue: Downloaded file doesn't include all modifications

**Possible Cause:**
- (Should not happen) - Download merges all pages

**Solution:**
1. Check modification count in download toast
2. Verify modifications map in browser console
3. Re-apply modifications if necessary

---

### Issue: Page navigation shows wrong data

**Possible Cause:**
- Pagination calculation issue
- Modification not applied to current page

**Solution:**
1. Navigate to another page and back
2. Check currentPage state in browser console
3. Reload the file

---

### Issue: Manual memory not added

**Possible Causes:**
- User ID doesn't exist in data
- Empty field
- No file loaded

**Solutions:**
1. Verify User ID matches exactly (case-sensitive)
2. Fill in all three fields
3. Upload a file before using manual entry

---

### Issue: Keyboard shortcuts not working

**Possible Causes:**
- Browser focus is outside the application
- Keyboard event listener not attached
- Conflicting browser extensions

**Solutions:**
1. Click anywhere in the app to regain focus
2. Reload the page (Ctrl+R)
3. Disable browser extensions temporarily
4. Check browser console for errors

---

### Issue: Undo doesn't work

**Possible Causes:**
- No memories added yet
- addedKeys array is empty

**Solutions:**
1. Ensure you've added at least one memory
2. Check that you used text selection (not manual form) for undo
3. Refresh and try again

---

## Advanced Usage

### Working with Chinese Dialogue Data

Memory Marker fully supports UTF-8 encoded Chinese text:

```json
{"UserID": "e006", "Dialogue": ["我有两只猫", "我喜欢读书"]}
```

Select "两只猫" → Creates:
```json
{"UserID": "e006", "Dialogue": ["我有两只猫", "我喜欢读书"], 
 "UserMemory": {"Belongings__Memory_1": "两只猫"}}
```

### Batch Annotation Workflow

For large datasets (1000+ objects):

1. Set **Lines per page: 500**
2. Press **Alt+1** (Identity)
3. Quickly scan and highlight all identity info on page
4. Press **Alt+2** (Activity)
5. Highlight all activity info
6. Continue for all categories
7. Navigate to next page
8. Repeat

Download every 50-100 pages to save progress.

---

## Version History

### Current Version Features

- ✅ Paginated NDJSON loading (100 lines/page)
- ✅ Modification tracking across pages
- ✅ Full file download with merged modifications
- ✅ Toggle category selection (press shortcut again to deselect)
- ✅ Copy mode (no category selected = copy to clipboard)
- ✅ Delete mode (Alt+Z to remove memories)
- ✅ Manual memory addition form
- ✅ Undo functionality (Ctrl+Z)
- ✅ Dynamic keyboard shortcuts (fully config-driven)
- ✅ Professional academic design aesthetic
- ✅ Robust NDJSON parser with 4 fallback strategies
- ✅ **FIXED**: Delete mode now properly removes memories from JSON data

---

## Support & Customization

### Configuration Files

- `/config/memory-config.ts` - Memory categories and shortcuts
- `/config/README.md` - Configuration documentation
- `/styles/globals.css` - Global styles and design tokens

### Code Structure

- `/App.tsx` - Main application logic
- `/components/JsonViewer.tsx` - JSON display and highlighting
- `/components/FileUpload.tsx` - File parsing and upload
- `/components/PaginationControl.tsx` - Pagination UI

### Extending Functionality

Memory Marker is designed to be highly extensible:

1. **Add new categories**: Edit `memory-config.ts`
2. **Change color scheme**: Edit `globals.css` tokens
3. **Modify key format**: Change `keyPrefix` in config
4. **Add new shortcuts**: Any keyboard key supported

---

## License & Attribution

See `/Attributions.md` for component library credits.

---

**Memory Marker** - Built for scholarly annotation and data curation tasks.
