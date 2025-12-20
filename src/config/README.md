# Memory Configuration Guide

This file (`memory-config.ts`) controls the memory categories, keyboard shortcuts, and highlight colors in the JSON Viewer application.

## NDJSON Support

The application now supports both regular JSON files and NDJSON (newline-delimited JSON) files:

- **Regular JSON (.json)**: Memories are added as root-level key-value pairs
- **NDJSON (.ndjson)**: Each line is a separate JSON object, and memories are added to a `UserMemory` object within the specific object where text was selected

### NDJSON Example

When you select text from an NDJSON file like this:
```json
{"UserID": "e006", "Dialogue": [...]}
```

The memory will be added as:
```json
{"UserID": "e006", "Dialogue": [...], "UserMemory": {"Belongings__Memory_1": "两只猫"}}
```

## Configuration Structure

```typescript
const memoryConfig = {
  memoryCategories: [ ... ],
  defaultCategory: { ... }
};
```

## Category Properties

Each category in the `memoryCategories` array has the following properties:

| Property | Type | Description | Example |
|----------|------|-------------|---------|
| `id` | string | Unique identifier for the category | `"identity"` |
| `name` | string | Display name shown in the UI | `"Identity"` |
| `shortcut` | string | Keyboard shortcut number (1-9) | `"1"` |
| `color` | string | Background color for highlights (RGBA) | `"rgba(255, 182, 193, 0.3)"` |
| `textColor` | string | Text/border color (RGB) | `"rgb(219, 39, 119)"` |
| `keyPrefix` | string | Prefix for JSON keys | `"Identity"` |

## Default Configuration

The default configuration includes 5 categories:

1. **Identity** (Alt+1) - Light Pink
2. **Activity** (Alt+2) - Light Yellow
3. **Preferences** (Alt+3) - Light Blue
4. **Belongings** (Alt+4) - Light Green
5. **Relationships** (Alt+5) - Light Orange

Plus one default/uncategorized category:

0. **Uncategorized** (Alt+0) - Grey

## How to Customize

### Adding a New Category

To add a new category, add an object to the `memoryCategories` array:

```typescript
{
  id: "emotions",
  name: "Emotions",
  shortcut: "6",
  color: "rgba(233, 213, 255, 0.3)",
  textColor: "rgb(147, 51, 234)",
  keyPrefix: "Emotions"
}
```

### Removing a Category

Simply delete the category object from the `memoryCategories` array.

### Changing Colors

Update the `color` and `textColor` properties. Use:
- **RGBA format** for `color` (with alpha for transparency): `"rgba(R, G, B, 0.3)"`
- **RGB format** for `textColor`: `"rgb(R, G, B)"`

**Tip:** Keep the alpha value around 0.3 for highlights to remain readable.

### Changing Shortcuts

Update the `shortcut` property to any number (1-9). Make sure each category has a unique shortcut.

```typescript
{
  shortcut: "7"
}
```

This will bind the category to **Alt+7**.

### Changing Key Prefixes

The `keyPrefix` determines how memory keys appear in the JSON:

```typescript
{
  keyPrefix: "UserInfo"
}
```

Will create keys like: `UserInfo__Memory_1`, `UserInfo__Memory_2`, etc.

## Color Palette Suggestions

### Pastel Colors (Recommended)

| Color Name | RGBA (Background) | RGB (Text/Border) |
|------------|-------------------|-------------------|
| Pink | `rgba(255, 182, 193, 0.3)` | `rgb(219, 39, 119)` |
| Yellow | `rgba(254, 240, 138, 0.3)` | `rgb(202, 138, 4)` |
| Blue | `rgba(191, 219, 254, 0.3)` | `rgb(37, 99, 235)` |
| Green | `rgba(187, 247, 208, 0.3)` | `rgb(22, 163, 74)` |
| Orange | `rgba(254, 215, 170, 0.3)` | `rgb(234, 88, 12)` |
| Purple | `rgba(233, 213, 255, 0.3)` | `rgb(147, 51, 234)` |
| Teal | `rgba(153, 246, 228, 0.3)` | `rgb(13, 148, 136)` |
| Red | `rgba(254, 202, 202, 0.3)` | `rgb(220, 38, 38)` |

### Vibrant Colors

| Color Name | RGBA (Background) | RGB (Text/Border) |
|------------|-------------------|-------------------|
| Magenta | `rgba(236, 72, 153, 0.3)` | `rgb(190, 18, 60)` |
| Cyan | `rgba(34, 211, 238, 0.3)` | `rgb(8, 145, 178)` |
| Lime | `rgba(163, 230, 53, 0.3)` | `rgb(77, 124, 15)` |

## Example: Custom Configuration

Here's an example with 3 custom categories:

```typescript
const memoryConfig = {
  memoryCategories: [
    {
      id: "work",
      name: "Work",
      shortcut: "1",
      color: "rgba(191, 219, 254, 0.3)",
      textColor: "rgb(37, 99, 235)",
      keyPrefix: "Work"
    },
    {
      id: "personal",
      name: "Personal",
      shortcut: "2",
      color: "rgba(255, 182, 193, 0.3)",
      textColor: "rgb(219, 39, 119)",
      keyPrefix: "Personal"
    },
    {
      id: "goals",
      name: "Goals",
      shortcut: "3",
      color: "rgba(187, 247, 208, 0.3)",
      textColor: "rgb(22, 163, 74)",
      keyPrefix: "Goals"
    }
  ],
  defaultCategory: {
    id: "uncategorized",
    name: "Uncategorized",
    color: "rgba(229, 231, 235, 0.3)",
    textColor: "rgb(107, 114, 128)",
    keyPrefix: "Memory"
  }
};

export default memoryConfig;
```

## Keyboard Shortcuts

- **Alt+0** - Switch to Uncategorized mode (default)
- **Alt+1 to Alt+5** - Switch to configured category modes
- **Ctrl+Z** - Undo last memory selection

## Tips

1. **Keep it simple**: 3-7 categories work best for usability
2. **Use distinct colors**: Make sure categories are visually distinguishable
3. **Test readability**: Ensure text is readable on the highlight background
4. **Backup before editing**: Save a copy of the original config before making changes
5. **Restart the app**: After editing the config, refresh your browser to see changes

## Troubleshooting

**Problem**: Changes don't appear after editing
- **Solution**: Hard refresh your browser (Ctrl+F5 or Cmd+Shift+R)

**Problem**: Colors look wrong
- **Solution**: Check that RGBA values are between 0-255 and alpha is 0-1

**Problem**: Shortcuts don't work
- **Solution**: Make sure shortcuts are unique and use numbers 1-9

**Problem**: App crashes after editing
- **Solution**: Check your TypeScript syntax - make sure you didn't forget commas or have extra quotes
- 

```typescript
if (event.altKey) {
  const category = categories.find(cat => cat.shortcut === event.key);
  if (category) {
```

This dynamically checks if the pressed key matches ANY shortcut defined in the config.

You Can:

Add Alt+6, Alt+7, etc. in `memory-config.ts`:
```typescript
{
  id: "location",
  name: "Location", 
  shortcut: "6",
  color: "rgba(220, 252, 231, 0.3)",
  textColor: "rgb(21, 128, 61)",
  keyPrefix: "Location"
}
```

Use any key as a shortcut (not just numbers):
```typescript
shortcut: "e"  // Alt+E for "emotion"
shortcut: "t"  // Alt+T for "time"
```

Remove or modify existing shortcuts - the system will automatically adapt

Everything is now purely config-driven with zero hard-coding! 🎉
