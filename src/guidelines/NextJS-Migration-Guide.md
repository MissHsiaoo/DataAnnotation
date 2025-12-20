# Next.js Migration Guide

## JSON Viewer with Text Selection & Highlighting

This guide will help you migrate the JSON Viewer application (with file upload, text selection, highlighting, and Alt+1 keyboard toggle) to Next.js.

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Your current project files ready

---

## Step 1: Create a New Next.js Project

```bash
npx create-next-app@latest json-viewer-app
```

**Choose these options when prompted:**
```
✓ Would you like to use TypeScript? › Yes
✓ Would you like to use ESLint? › Yes
✓ Would you like to use Tailwind CSS? › Yes
✓ Would you like your code inside a `src/` directory? › Yes
✓ Would you like to use App Router? › Yes
✓ Would you like to use Turbopack for `next dev`? › No
✓ Would you like to customize the import alias (@/* by default)? › No
```

```bash
cd json-viewer-app
```

---

## Step 2: Install Required Dependencies

```bash
# Core dependencies
npm install sonner@2.0.3 lucide-react

# Utility libraries (for UI components)
npm install class-variance-authority clsx tailwind-merge

# Radix UI primitives (used by shadcn components)
npm install @radix-ui/react-slot @radix-ui/react-toast
npm install @radix-ui/react-label @radix-ui/react-separator
```

---

## Step 3: Copy Project Files

### 3.1 Copy the Components Folder

```bash
# From your current project root, copy all components
cp -r components/ ../json-viewer-app/src/components/
```

This copies:
- `JsonViewer.tsx` - Main JSON viewer with text selection & highlighting
- `FileUpload.tsx` - File upload component
- `components/ui/` - All shadcn UI components (button, card, badge, etc.)
- `components/figma/ImageWithFallback.tsx` - Protected system file

### 3.2 Copy Styles

```bash
# Copy the global CSS file
cp styles/globals.css ../json-viewer-app/src/app/globals.css
```

---

## Step 4: Convert App.tsx to Next.js Page

### 4.1 Create the Main Page

Copy your `App.tsx` content to `src/app/page.tsx` with these modifications:

**File: `src/app/page.tsx`**

```tsx
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { JsonViewer } from '@/components/JsonViewer';
import { FileUpload } from '@/components/FileUpload';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, Keyboard } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { Toaster } from '@/components/ui/sonner';

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

interface HighlightedText {
  text: string;
  isUserItem: boolean;
}

export default function Home() {  // Changed from 'App' to 'Home'
  const [jsonData, setJsonData] = useState<Record<string, any> | null>(null);
  const [isUserItemMode, setIsUserItemMode] = useState(false);
  const [highlightedTexts, setHighlightedTexts] = useState<HighlightedText[]>([]);
  const memoryCounterRef = useRef(1);

  // Listen for Alt+1 keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check for Alt+1
      if (event.altKey && event.key === '1') {
        event.preventDefault();
        setIsUserItemMode(prev => {
          const newMode = !prev;
          toast.success(
            newMode 
              ? '🎀 User Item mode enabled (pink highlights)' 
              : '🔲 Memory mode enabled (grey highlights)'
          );
          return newMode;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTextSelection = useCallback((selectedText: string) => {
    if (selectedText.trim()) {
      const newKey = isUserItemMode 
        ? `User_Item__Memory_${memoryCounterRef.current}`
        : `memory_${memoryCounterRef.current}`;
      
      memoryCounterRef.current += 1;

      setJsonData(prev => ({
        ...prev,
        [newKey]: selectedText.trim()
      }));

      // Add to highlighted texts array
      setHighlightedTexts(prev => [...prev, {
        text: selectedText.trim(),
        isUserItem: isUserItemMode
      }]);

      const modeLabel = isUserItemMode ? 'User Item' : 'Memory';
      const emoji = isUserItemMode ? '🎀' : '🔲';
      toast.success(`${emoji} Added to ${modeLabel}: ${newKey}`);
    }
  }, [isUserItemMode]);

  const handleFileLoad = (data: any) => {
    setJsonData(data);
    toast.success('JSON file loaded successfully!');
  };

  const handleDownload = () => {
    if (!jsonData) return;
    
    const dataStr = JSON.stringify(jsonData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `json-export-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('JSON downloaded successfully!');
  };

  const handleReset = () => {
    setJsonData(null);
    setHighlightedTexts([]);
    memoryCounterRef.current = 1;
    toast.info('Data reset to initial state');
  };

  const displayData = jsonData || initialData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-slate-900">JSON Viewer with Text Selection</h1>
          <div className="flex flex-wrap gap-2 justify-center items-center">
            <Badge variant="outline" className="gap-1.5">
              <Keyboard className="w-3 h-3" />
              Press Alt+1 to toggle mode
            </Badge>
            <Badge variant={isUserItemMode ? "default" : "secondary"} className="gap-1.5">
              {isUserItemMode ? '🎀 User Item Mode (Pink)' : '🔲 Memory Mode (Grey)'}
            </Badge>
          </div>
          <p className="text-slate-600">Select any text in the JSON below to add it as a new key-value pair</p>
        </div>

        {/* File Upload */}
        <FileUpload onFileLoad={handleFileLoad} />

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button 
            onClick={handleDownload}
            variant="default"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download JSON
          </Button>
          <Button 
            onClick={handleReset}
            variant="outline"
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Reset Data
          </Button>
        </div>

        {/* JSON Viewer */}
        <JsonViewer 
          data={displayData} 
          onTextSelection={handleTextSelection}
          highlightedTexts={highlightedTexts}
        />
      </div>
    </div>
  );
}
```

**Key Changes:**
1. ✅ Added `'use client';` at the top (required for hooks & browser APIs)
2. ✅ Changed export name from `App` to `Home`
3. ✅ Updated all imports to use `@/` alias instead of relative paths
4. ✅ Rest of the code remains the same

---

## Step 5: Update Component Files

### 5.1 Add 'use client' to Interactive Components

**File: `src/components/JsonViewer.tsx`**
Add this line at the very top:
```tsx
'use client';

import { useState, useEffect, useRef } from 'react';
// ... rest of imports
```

**File: `src/components/FileUpload.tsx`**
Add this line at the very top:
```tsx
'use client';

import { useRef } from 'react';
// ... rest of imports
```

### 5.2 Update Import Paths in Components

In `JsonViewer.tsx` and `FileUpload.tsx`, change:

**Before:**
```tsx
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
```

**After:**
```tsx
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
```

### 5.3 Update UI Component Imports

Most UI components in `src/components/ui/` already use relative imports, but if you see imports like:
```tsx
import { cn } from './utils';
```
Change to:
```tsx
import { cn } from '@/components/ui/utils';
```

---

## Step 6: Verify Tailwind Configuration

Your `tailwind.config.ts` should already be set up correctly, but verify it includes:

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
```

If you need the animate plugin:
```bash
npm install tailwindcss-animate
```

---

## Step 7: Update Layout (Optional)

If you want to customize the metadata or layout, edit `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JSON Viewer - Text Selection & Highlighting",
  description: "Interactive JSON viewer with text selection, highlighting, and keyboard shortcuts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

---

## Step 8: Run the Application

```bash
npm run dev
```

Visit **http://localhost:3000** in your browser.

---

## 🎉 Testing Your Application

1. **Test File Upload**: Upload a JSON file
2. **Test Text Selection**: Select text in the JSON viewer
3. **Test Keyboard Shortcut**: Press `Alt+1` to toggle between Memory mode (grey) and User Item mode (pink)
4. **Test Highlighting**: Selected text should highlight with partial matching
5. **Test Download**: Click "Download JSON" to export
6. **Test Reset**: Click "Reset Data" to clear

---

## 📁 Final Folder Structure

```
json-viewer-app/
├── src/
│   ├── app/
│   │   ├── layout.tsx           (Next.js layout)
│   │   ├── page.tsx             (your main app - converted from App.tsx)
│   │   ├── globals.css          (your styles)
│   │   └── favicon.ico
│   └── components/
│       ├── JsonViewer.tsx       (main viewer component)
│       ├── FileUpload.tsx       (file upload component)
│       ├── figma/
│       │   └── ImageWithFallback.tsx
│       └── ui/                  (shadcn components)
│           ├── button.tsx
│           ├── card.tsx
│           ├── badge.tsx
│           ├── sonner.tsx
│           ├── utils.ts
│           └── ... (all other UI components)
├── public/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Module not found" errors

**Solution:** Check that `tsconfig.json` has the path alias:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Issue 2: "document is not defined" or "window is not defined"

**Solution:** Make sure components using browser APIs have `'use client'` at the top:
- `src/app/page.tsx`
- `src/components/JsonViewer.tsx`
- `src/components/FileUpload.tsx`

### Issue 3: Tailwind classes not applying

**Solution:** Ensure `globals.css` is imported in `src/app/layout.tsx`:
```tsx
import "./globals.css";
```

### Issue 4: Toast notifications not showing

**Solution:** Make sure `<Toaster />` component is included in your page:
```tsx
import { Toaster } from '@/components/ui/sonner';

export default function Home() {
  return (
    <div>
      <Toaster position="top-right" />
      {/* rest of your app */}
    </div>
  );
}
```

### Issue 5: Icons not displaying

**Solution:** Verify `lucide-react` is installed:
```bash
npm install lucide-react
```

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js and deploy

**Or use CLI:**
```bash
npm run build
npx vercel
```

### Deploy to Other Platforms

- **Netlify**: Works with Next.js
- **Railway**: Supports Next.js
- **AWS Amplify**: Supports Next.js
- **Cloudflare Pages**: Supports Next.js

---

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

---

## 🎯 Feature Summary

Your migrated application includes:

✅ **JSON File Upload** - Upload and parse JSON files  
✅ **Interactive Text Selection** - Select any text to add as new key-value pairs  
✅ **Keyboard Shortcuts** - Alt+1 to toggle between Memory and User Item modes  
✅ **Smart Highlighting** - Partial text matching with color-coded highlights  
✅ **Download Functionality** - Export modified JSON  
✅ **Toast Notifications** - User feedback for all actions  
✅ **Responsive Design** - Works on desktop and mobile  

---

## 💡 Next Steps

Consider adding:
- **Database persistence** using Prisma + PostgreSQL
- **User authentication** with NextAuth.js
- **API routes** for saving/loading JSON data
- **Server-side rendering** for better SEO
- **File history** to track changes over time

---

Good luck with your Next.js migration! 🚀
