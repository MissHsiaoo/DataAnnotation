# Memory Marker - Deployment Guide

This guide will help you download and run Memory Marker on your local PC.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Downloading the Code from Figma Make](#downloading-the-code-from-figma-make)
3. [Setting Up Locally](#setting-up-locally)
4. [Running the Development Server](#running-the-development-server)
5. [Building for Production](#building-for-production)
6. [Deployment Options](#deployment-options)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, make sure you have the following installed on your PC:

### Required Software

1. **Node.js** (v18 or higher recommended)
   - Download from: https://nodejs.org/
   - Verify installation: Open terminal/command prompt and run:
     ```bash
     node --version
     ```
     Should show: `v18.x.x` or higher

2. **npm** (comes with Node.js) or **yarn**
   - Verify npm installation:
     ```bash
     npm --version
     ```
     Should show: `9.x.x` or higher

### Optional but Recommended

3. **Git** (for version control)
   - Download from: https://git-scm.com/
   
4. **VS Code** (code editor)
   - Download from: https://code.visualstudio.com/

---

## Downloading the Code from Figma Make

### Method 1: Download ZIP (Recommended for beginners)

1. **In Figma Make interface**, look for a **Download** or **Export** button
   - Usually located in the top-right corner or in a menu
   - Click "Download as ZIP" or "Export Project"

2. **Extract the ZIP file**
   - Right-click the downloaded file
   - Select "Extract All..." (Windows) or double-click (Mac)
   - Choose a destination folder (e.g., `C:\Projects\memory-marker` or `~/Projects/memory-marker`)

3. **Verify the structure**
   - Open the extracted folder
   - You should see files like `App.tsx`, `package.json`, `vite.config.ts`, etc.

### Method 2: Using Git (If available)

If Figma Make provides a Git repository URL:

```bash
git clone <repository-url>
cd memory-marker
```

---

## Setting Up Locally

### Step 1: Open Terminal in Project Folder

**Windows:**
- Open the extracted folder in File Explorer
- Hold `Shift` and right-click in the folder
- Select "Open PowerShell window here" or "Open in Terminal"

**Mac/Linux:**
- Open Terminal
- Navigate to the project folder:
  ```bash
  cd path/to/memory-marker
  ```

### Step 2: Install Dependencies

Run one of the following commands:

**Using npm:**
```bash
npm install
```

**Using yarn (if you prefer):**
```bash
yarn install
```

This will install all required packages. It may take 2-5 minutes.

### Step 3: Verify Installation

Check that a `node_modules` folder was created in your project directory.

---

## Running the Development Server

### Start the Dev Server

**Using npm:**
```bash
npm run dev
```

**Using yarn:**
```bash
yarn dev
```

### Access the Application

1. After running the command, you'll see output like:
   ```
   VITE v5.x.x  ready in 500 ms
   
   ➜  Local:   http://localhost:5173/
   ➜  Network: use --host to expose
   ```

2. **Open your browser** and go to: **http://localhost:5173/**

3. The Memory Marker application should now be running!

### Making Changes

- The dev server supports **hot reload**
- Edit any `.tsx` or `.ts` file
- Save the file
- The browser will automatically refresh with your changes

### Stopping the Server

Press `Ctrl+C` in the terminal to stop the dev server.

---

## Building for Production

When you're ready to deploy the application for others to use:

### Step 1: Build the Project

**Using npm:**
```bash
npm run build
```

**Using yarn:**
```bash
yarn build
```

This creates an optimized production build in the `dist` folder.

### Step 2: Preview the Production Build (Optional)

**Using npm:**
```bash
npm run preview
```

**Using yarn:**
```bash
yarn preview
```

This runs a local server to preview the production build.

### Step 3: Deploy the `dist` Folder

The `dist` folder contains all the files needed to deploy your application. You can:

1. Copy the `dist` folder to any web server
2. Use a hosting service (see [Deployment Options](#deployment-options))
3. Share it with others

---

## Deployment Options

### Option 1: Vercel (Recommended - Free & Easy)

1. Go to https://vercel.com/
2. Sign up with GitHub, GitLab, or email
3. Click "Add New Project"
4. Import your project folder (or connect a Git repository)
5. Vercel auto-detects it's a Vite project
6. Click "Deploy"
7. Your app will be live at `https://your-project.vercel.app`

**Pros:** Free, automatic HTTPS, continuous deployment, fast CDN

### Option 2: Netlify (Also Recommended - Free)

1. Go to https://www.netlify.com/
2. Sign up for free
3. Drag and drop your `dist` folder to Netlify's deploy page
4. Your app will be live at `https://your-project.netlify.app`

**Pros:** Free, simple drag-and-drop, automatic HTTPS

### Option 3: GitHub Pages (Free)

1. Create a GitHub repository
2. Push your code to GitHub
3. Install the `gh-pages` package:
   ```bash
   npm install --save-dev gh-pages
   ```
4. Add to `package.json` scripts:
   ```json
   "deploy": "npm run build && gh-pages -d dist"
   ```
5. Run:
   ```bash
   npm run deploy
   ```
6. Your app will be live at `https://username.github.io/repository-name`

### Option 4: Local Network Sharing

To run on your local network (accessible by other devices on your WiFi):

```bash
npm run dev -- --host
```

Then access from any device on your network using:
```
http://YOUR-IP-ADDRESS:5173
```

(Find your IP: `ipconfig` on Windows, `ifconfig` on Mac/Linux)

### Option 5: Self-Hosted Server

Copy the `dist` folder to any web server:

- Apache
- Nginx
- IIS
- Any static file hosting service

Configure the server to serve the `index.html` file.

---

## Project Structure

```
memory-marker/
├── App.tsx                    # Main application component
├── index.html                 # Entry HTML file
├── package.json               # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── components/               # React components
│   ├── FileUpload.tsx
│   ├── JsonViewer.tsx
│   ├── PaginationControl.tsx
│   └── ui/                   # UI components (shadcn/ui)
├── config/                   # Configuration files
│   ├── memory-config.ts      # Memory categories config
│   └── README.md
├── styles/                   # Global styles
│   └── globals.css
├── guidelines/               # Documentation
│   ├── Guidelines.md
│   └── DEPLOYMENT.md
└── node_modules/            # Dependencies (auto-generated)
```

---

## Common npm/yarn Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run code linter (if configured) |

---

## Customization After Download

### 1. Edit Memory Categories

Edit `/config/memory-config.ts` to change categories, colors, and shortcuts.

### 2. Change Styling

Edit `/styles/globals.css` to modify colors, fonts, spacing, etc.

### 3. Modify UI Components

Edit files in `/components/` to change functionality or appearance.

### 4. Add New Features

Create new components in `/components/` and import them in `App.tsx`.

---

## Troubleshooting

### Issue: `npm install` fails

**Solution:**
1. Delete `node_modules` folder and `package-lock.json` file
2. Clear npm cache:
   ```bash
   npm cache clean --force
   ```
3. Try again:
   ```bash
   npm install
   ```

### Issue: Port 5173 is already in use

**Solution:**
- Another app is using port 5173
- Stop that app, or use a different port:
  ```bash
  npm run dev -- --port 3000
  ```

### Issue: "Command not found: npm"

**Solution:**
- Node.js is not installed or not in PATH
- Download and install Node.js from https://nodejs.org/
- Restart your terminal after installation

### Issue: Build fails with TypeScript errors

**Solution:**
1. Make sure TypeScript is installed:
   ```bash
   npm install --save-dev typescript
   ```
2. Check `tsconfig.json` exists
3. Fix any type errors shown in the terminal

### Issue: Application shows blank page after build

**Solution:**
1. Check browser console for errors (F12)
2. Verify all files are in the `dist` folder
3. Make sure your web server is configured to serve single-page applications
4. Check that `base` path in `vite.config.ts` matches your deployment path

### Issue: Hot reload not working

**Solution:**
1. Stop the dev server (Ctrl+C)
2. Delete `node_modules/.vite` folder
3. Restart dev server:
   ```bash
   npm run dev
   ```

---

## Environment Requirements

### Minimum System Requirements

- **OS:** Windows 10, macOS 10.15+, or Linux
- **RAM:** 4GB minimum, 8GB recommended
- **Disk Space:** 500MB for project + dependencies
- **Node.js:** v18.0.0 or higher
- **Browser:** Chrome, Firefox, Safari, or Edge (latest versions)

### Recommended Development Setup

- **OS:** Windows 11 or macOS 13+
- **RAM:** 16GB
- **Code Editor:** VS Code with these extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense

---

## File Formats & Dependencies

### Key Dependencies

This project uses:

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS v4** - Styling
- **shadcn/ui** - UI components
- **Lucide React** - Icons
- **Sonner** - Toast notifications

All dependencies are listed in `package.json`.

### No Backend Required

Memory Marker is a **pure frontend application**:
- ✅ No database needed
- ✅ No server-side code
- ✅ All processing happens in the browser
- ✅ Files are processed locally (never uploaded to a server)

This means:
- Privacy: Your data never leaves your computer
- Simple deployment: Just static files
- Fast: No network latency

---

## Updating the Application

### Update Dependencies

To update all packages to their latest versions:

```bash
npm update
```

Or for major version updates:

```bash
npm install react@latest react-dom@latest
```

### Pull Latest Code (If using Git)

```bash
git pull origin main
npm install
```

---

## Sharing with Others

### Method 1: Share the Built App

1. Build the project:
   ```bash
   npm run build
   ```
2. Zip the `dist` folder
3. Send to others
4. They can:
   - Extract the ZIP
   - Double-click `index.html` to open in browser
   - Or deploy to a web server

### Method 2: Share the Source Code

1. Zip the entire project folder (excluding `node_modules`)
2. Send to others
3. They follow this deployment guide to set it up

### Method 3: Deploy Online

Deploy to Vercel/Netlify (see [Deployment Options](#deployment-options)) and share the URL.

---

## Security Notes

### Safe to Run Locally

Memory Marker processes all files **locally in your browser**:
- Files are never uploaded to external servers
- All data stays on your computer
- No telemetry or tracking

### Production Deployment

If deploying publicly:
- Use HTTPS (Vercel/Netlify provide this automatically)
- Consider adding authentication if handling sensitive data
- Review any third-party dependencies for security updates

---

## Support & Further Help

### Documentation

- **Usage Guide:** `/guidelines/Guidelines.md`
- **Configuration:** `/config/README.md`
- **This Deployment Guide:** `/DEPLOYMENT.md`

### Getting Help

1. Check the [Troubleshooting](#troubleshooting) section
2. Review browser console for errors (F12 → Console tab)
3. Check Node.js and npm versions match requirements
4. Verify all dependencies installed correctly

### Community Resources

- **React Documentation:** https://react.dev/
- **Vite Documentation:** https://vitejs.dev/
- **Tailwind CSS:** https://tailwindcss.com/
- **TypeScript Handbook:** https://www.typescriptlang.org/docs/

---

## Next Steps

After successfully deploying:

1. ✅ Read `/guidelines/Guidelines.md` for usage instructions
2. ✅ Customize categories in `/config/memory-config.ts`
3. ✅ Test with your own JSON/NDJSON files
4. ✅ Consider deploying online with Vercel or Netlify
5. ✅ Share with your team!

---

**Congratulations!** You've successfully deployed Memory Marker on your PC. 🎉

For questions or issues, refer to the documentation or check the browser console for error messages.

---

**Memory Marker** - Professional data annotation made simple.
