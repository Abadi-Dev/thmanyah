import { useState } from 'react';
import Discovery from './pages/Discovery';
import CMS from './pages/CMS';

const tabs = [
  { id: 'discovery', label: 'Discovery' },
  { id: 'cms', label: 'CMS' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('discovery');

  return (
    <div className="min-h-screen bg-off-white">
      {/* Header */}
      <header className="bg-off-black text-off-white sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight">Thmanyah</h1>
            <nav className="flex gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-off-white text-off-black'
                      : 'text-gray-light hover:bg-accent'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === 'discovery' && <Discovery />}
        {activeTab === 'cms' && <CMS />}
      </main>
    </div>
  );
}
