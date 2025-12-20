# Converting to VS Code Extension - Complete Guide

## ⚠️ Important: Architecture Differences

**Next.js/React Web App vs VS Code Extension:**

| Aspect        | Web App          | VS Code Extension                           |
| ------------- | ---------------- | ------------------------------------------- |
| Runs in       | Browser          | VS Code environment                         |
| UI Framework  | React directly   | React in Webview (sandboxed)                |
| DOM Access    | Full access      | Limited (Webview only)                      |
| Communication | Direct           | Message passing between Extension & Webview |
| File System   | No direct access | Full Node.js file system access             |

## Can You Reuse This Code? **YES, BUT...**

You **CAN** reuse 90% of your React components, but you need to:

1. Wrap them in a VS Code Webview
2. Create an Extension Host to manage the webview
3. Use message passing for communication

## Step-by-Step: Create VS Code Extension

### Step 1: Install Prerequisites

```bash
npm install -g yo generator-code
```

### Step 2: Generate Extension

```bash
yo code

# Choose:
# ? What type of extension: New Extension (TypeScript)
# ? Extension name: json-viewer-extension
# ? Identifier: json-viewer-extension
# ? Description: Interactive JSON viewer with text selection
# ? Enable webpack: Yes
# ? Package manager: npm
```

### Step 3: Project Structure

```
json-viewer-extension/
├── src/
│   ├── extension.ts          (Extension entry point - Node.js)
│   └── webview/
│       ├── main.tsx           (React app entry)
│       ├── App.tsx            (Your current App.tsx)
│       └── components/        (Your current components)
├── media/                     (CSS, assets)
├── package.json
└── webpack.config.js
```

### Step 4: Install React Dependencies

```bash
cd json-viewer-extension
npm install react react-dom
npm install -D @types/react @types/react-dom
npm install -D webpack-cli ts-loader css-loader style-loader
npm install sonner@2.0.3 lucide-react
npm install tailwindcss postcss autoprefixer
```

### Step 5: Create Extension Host

**src/extension.ts** (Main extension file):

```typescript
import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "json-viewer-extension.openViewer",
    () => {
      const panel = vscode.window.createWebviewPanel(
        "jsonViewer",
        "JSON Viewer",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        },
      );

      // Set HTML content
      panel.webview.html = getWebviewContent(
        panel.webview,
        context,
      );

      // Handle messages from webview
      panel.webview.onDidReceiveMessage(
        (message) => {
          switch (message.type) {
            case "textSelected":
              vscode.window.showInformationMessage(
                `Selected: ${message.text}`,
              );
              break;
            case "saveJson":
              // Save JSON to workspace
              saveJsonToFile(message.data);
              break;
          }
        },
        undefined,
        context.subscriptions,
      );
    },
  );

  context.subscriptions.push(disposable);
}

function getWebviewContent(
  webview: vscode.Webview,
  context: vscode.ExtensionContext,
): string {
  // Get path to React bundle
  const scriptUri = webview.asWebviewUri(
    vscode.Uri.joinPath(
      context.extensionUri,
      "dist",
      "webview.js",
    ),
  );

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>JSON Viewer</title>
  </head>
  <body>
    <div id="root"></div>
    <script src="${scriptUri}"></script>
  </body>
  </html>`;
}

async function saveJsonToFile(data: any) {
  const uri = await vscode.window.showSaveDialog({
    filters: { JSON: ["json"] },
  });

  if (uri) {
    const content = JSON.stringify(data, null, 2);
    await vscode.workspace.fs.writeFile(
      uri,
      Buffer.from(content, "utf8"),
    );
    vscode.window.showInformationMessage(
      "JSON saved successfully!",
    );
  }
}

export function deactivate() {}
```

### Step 6: Create Webview Entry Point

**src/webview/main.tsx**:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./globals.css";

// VS Code API (available in webview)
declare const acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

// Make vscode API available globally
(window as any).vscode = vscode;

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### Step 7: Modify Your App.tsx for VS Code

**src/webview/App.tsx**:

```tsx
import { useState } from "react";
import { JsonViewer } from "./components/JsonViewer";

// Access VS Code API
const vscode = (window as any).vscode;

const initialData = {
  "Speaker 1": [
    // ... your data
  ],
  "Speaker 2": [
    // ... your data
  ],
  in_dataset: 0,
};

export default function App() {
  const [jsonData, setJsonData] = useState(initialData);

  const handleTextSelection = (selectedText: string) => {
    if (selectedText.trim()) {
      // Update local state
      setJsonData((prev) => ({
        ...prev,
        [`selected_${Date.now()}`]: selectedText,
      }));

      // Send message to extension host
      vscode.postMessage({
        type: "textSelected",
        text: selectedText,
      });
    }
  };

  const handleSave = () => {
    vscode.postMessage({
      type: "saveJson",
      data: jsonData,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">
            Interactive JSON Viewer
          </h1>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save JSON
          </button>
        </div>

        <JsonViewer
          data={jsonData}
          onTextSelection={handleTextSelection}
        />
      </div>
    </div>
  );
}
```

### Step 8: Update package.json

**package.json**:

```json
{
  "name": "json-viewer-extension",
  "displayName": "JSON Viewer",
  "description": "Interactive JSON viewer with text selection",
  "version": "0.0.1",
  "engines": {
    "vscode": "^1.80.0"
  },
  "categories": ["Other"],
  "activationEvents": [],
  "main": "./dist/extension.js",
  "contributes": {
    "commands": [
      {
        "command": "json-viewer-extension.openViewer",
        "title": "Open JSON Viewer"
      }
    ]
  },
  "scripts": {
    "compile": "webpack",
    "watch": "webpack --watch",
    "package": "webpack --mode production",
    "vscode:prepublish": "npm run package"
  }
}
```

### Step 9: Configure Webpack

**webpack.config.js**:

```javascript
const path = require('path');

const extensionConfig = {
  target: 'node',
  mode: 'development',
  entry: './src/extension.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extension.js',
    libraryTarget: 'commonjs2'
  },
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      }
    ]
  }
};

const webviewConfig = {
  target: 'web',
  mode: 'development',
  entry: './src/webview/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'webview.js'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      }
    ]
  }
};

module.exports = [extensionConfig, webviewConfig];
```

### Step 10: Build and Run

```bash
# Build
npm run compile

# Press F5 in VS Code to launch Extension Development Host
# Or run:
code --extensionDevelopmentPath=/path/to/json-viewer-extension

# Open command palette (Cmd+Shift+P / Ctrl+Shift+P)
# Type: "Open JSON Viewer"
```

## Key Differences Summary

### Communication Flow

```
React Component (Webview)
    ↓ vscode.postMessage()
Extension Host (Node.js)
    ↓ File System / VS Code API
Workspace / Settings / Files
```

### What You Gain with VS Code Extension

✅ Direct file system access
✅ Read/write workspace files
✅ Integration with VS Code commands
✅ Access to Git, debugger, terminal APIs
✅ Can work offline
✅ Better performance for large files

### What's More Complex

⚠️ Message passing instead of direct calls
⚠️ Sandboxed webview environment
⚠️ More complex build process
⚠️ Different debugging workflow

## Recommended Path

**For your use case (JSON viewer with text selection):**

1. **Start with Next.js** - It's easier to develop and iterate
2. **Once stable**, convert to VS Code extension if you need:
   - File system integration
   - VS Code workspace integration
   - Offline functionality

The React components are 100% reusable, you just need to wrap them properly!