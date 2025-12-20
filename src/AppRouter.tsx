import { useState } from 'react';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { BookOpen, Target } from 'lucide-react';
import MemoryApp from './App';
import IntentApp from './IntentApp';

export default function AppRouter() {
  const [selectedApp, setSelectedApp] = useState<'memory' | 'intent' | null>(null);

  if (selectedApp === 'memory') {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={() => setSelectedApp(null)}
            variant="outline"
            size="sm"
          >
            ← Back to Menu
          </Button>
        </div>
        <MemoryApp />
      </div>
    );
  }

  if (selectedApp === 'intent') {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50">
          <Button
            onClick={() => setSelectedApp(null)}
            variant="outline"
            size="sm"
          >
            ← Back to Menu
          </Button>
        </div>
        <IntentApp />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-slate-900 mb-3">Annotation Tools</h1>
          <p className="text-slate-600 text-lg">
            Select which annotation tool you want to use
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Memory Marker */}
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-400"
            onClick={() => setSelectedApp('memory')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-slate-900 mb-2">Memory Marker</h2>
              <p className="text-slate-600 mb-4">
                Extract and categorize memory entries from JSON/NDJSON dialogue data
              </p>
              <ul className="text-sm text-slate-500 space-y-1 text-left w-full">
                <li>• Text selection & highlighting</li>
                <li>• 5 memory categories</li>
                <li>• Keyboard shortcuts</li>
                <li>• Delete & undo support</li>
              </ul>
              <Button className="mt-6 w-full">
                Open Memory Marker
              </Button>
            </div>
          </Card>

          {/* Intent Annotator */}
          <Card className="p-8 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-green-400"
            onClick={() => setSelectedApp('intent')}
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-slate-900 mb-2">Intent Annotator</h2>
              <p className="text-slate-600 mb-4">
                Classify conversation intents using 8-category taxonomy
              </p>
              <ul className="text-sm text-slate-500 space-y-1 text-left w-full">
                <li>• Conversation-based interface</li>
                <li>• 8 intent categories</li>
                <li>• Top-2 intent ranking</li>
                <li>• Evidence selection</li>
              </ul>
              <Button className="mt-6 w-full">
                Open Intent Annotator
              </Button>
            </div>
          </Card>
        </div>

        <div className="mt-12 text-center text-sm text-slate-500">
          <p>Both tools support NDJSON format with lazy loading for large datasets</p>
        </div>
      </div>
    </div>
  );
}
