import { useState } from 'react';
import { DataUploader, IndexUploader } from '@/features/data-management';

type TabType = 'transactions' | 'indexes';

export function UploadPage() {
  const [activeTab, setActiveTab] = useState<TabType>('indexes');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">העלאת נתונים</h1>
        <p className="text-gray-600">ייבוא נתונים פיננסיים מקבצי CSV</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          <button
            onClick={() => setActiveTab('indexes')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'indexes'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            אינדקסים (קודי מיון, לקוחות, ספקים)
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-3 px-1 border-b-2 font-medium text-sm transition ${
              activeTab === 'transactions'
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            תנועות ויתרות
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'indexes' && <IndexUploader />}
      {activeTab === 'transactions' && <DataUploader />}
    </div>
  );
}
