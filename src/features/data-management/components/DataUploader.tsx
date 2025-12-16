import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { Button, Card, CardHeader, Modal, Select } from '@/shared/components/ui';
import { parseCSV, type ParseResult } from '@/shared/utils/csvParser';
import { useTenantId } from '@/features/tenant';
import type { UploadFileType } from '@/shared/types';

interface ColumnMapping {
  csvColumn: string;
  dbField: string;
}

const FILE_TYPE_OPTIONS = [
  { value: 'transactions', label: 'תנועות' },
  { value: 'balances', label: 'יתרות' },
  { value: 'categories', label: 'קטגוריות' },
  { value: 'accounts', label: 'חשבונות' },
  { value: 'vendors', label: 'ספקים' },
];

const REQUIRED_FIELDS: Record<UploadFileType, string[]> = {
  transactions: ['transaction_date', 'amount'],
  balances: ['account_key', 'month', 'year'],
  categories: ['code', 'name'],
  accounts: ['account_key', 'account_name'],
  vendors: ['vendor_key', 'vendor_name'],
};

const DB_FIELDS: Record<UploadFileType, { value: string; label: string }[]> = {
  transactions: [
    { value: 'koteret', label: 'מספר מסמך' },
    { value: 'sort_code', label: 'קוד מיון' },
    { value: 'sort_code_name', label: 'שם קוד מיון' },
    { value: 'account_key', label: 'מפתח חשבון' },
    { value: 'account_name', label: 'שם חשבון' },
    { value: 'amount', label: 'סכום' },
    { value: 'details', label: 'פרטים' },
    { value: 'transaction_date', label: 'תאריך' },
    { value: 'counter_account_name', label: 'שם חשבון נגדי' },
    { value: 'counter_account_number', label: 'מספר חשבון נגדי' },
  ],
  balances: [
    { value: 'account_key', label: 'מפתח חשבון' },
    { value: 'account_name', label: 'שם חשבון' },
    { value: 'month', label: 'חודש' },
    { value: 'year', label: 'שנה' },
    { value: 'opening_balance', label: 'יתרת פתיחה' },
    { value: 'closing_balance', label: 'יתרת סגירה' },
  ],
  categories: [
    { value: 'code', label: 'קוד' },
    { value: 'name', label: 'שם' },
    { value: 'type', label: 'סוג' },
    { value: 'parent_code', label: 'קוד הורה' },
    { value: 'sort_order', label: 'סדר' },
  ],
  accounts: [
    { value: 'account_key', label: 'מפתח חשבון' },
    { value: 'account_name', label: 'שם חשבון' },
    { value: 'category_code', label: 'קוד קטגוריה' },
  ],
  vendors: [
    { value: 'vendor_key', label: 'מפתח ספק' },
    { value: 'vendor_name', label: 'שם ספק' },
    { value: 'category', label: 'קטגוריה' },
  ],
};

export function DataUploader() {
  const tenantId = useTenantId();
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<UploadFileType>('transactions');
  const [parseResult, setParseResult] = useState<ParseResult<Record<string, unknown>> | null>(null);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showMappingModal, setShowMappingModal] = useState(false);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setUploadResult(null);

    const result = await parseCSV(selectedFile);
    setParseResult(result);

    // Auto-map columns with matching names
    const autoMappings: ColumnMapping[] = [];
    const dbFields = DB_FIELDS[fileType];

    for (const csvColumn of result.meta.fields) {
      const match = dbFields.find(
        (f) =>
          f.value.toLowerCase() === csvColumn.toLowerCase() ||
          f.label === csvColumn
      );
      if (match) {
        autoMappings.push({ csvColumn, dbField: match.value });
      }
    }

    setMappings(autoMappings);
    setShowMappingModal(true);
  }, [fileType]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile && droppedFile.name.endsWith('.csv')) {
        handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect]
  );

  const handleUpload = async () => {
    if (!tenantId || !parseResult || !file) return;

    setIsUploading(true);

    try {
      // TODO: Implement actual upload logic
      // 1. Transform data using mappings
      // 2. Validate required fields
      // 3. Insert into Supabase
      // 4. Create upload history record

      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate upload

      setUploadResult({
        success: true,
        message: `הועלו בהצלחה ${parseResult.meta.rowCount} רשומות`,
      });
      setShowMappingModal(false);
    } catch (error) {
      setUploadResult({
        success: false,
        message: 'שגיאה בהעלאת הנתונים',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const updateMapping = (csvColumn: string, dbField: string) => {
    setMappings((prev) => {
      const existing = prev.findIndex((m) => m.csvColumn === csvColumn);
      if (existing >= 0) {
        if (!dbField) {
          return prev.filter((_, i) => i !== existing);
        }
        return prev.map((m, i) => (i === existing ? { ...m, dbField } : m));
      }
      return [...prev, { csvColumn, dbField }];
    });
  };

  const getMappingForColumn = (csvColumn: string) => {
    return mappings.find((m) => m.csvColumn === csvColumn)?.dbField || '';
  };

  const missingRequiredFields = REQUIRED_FIELDS[fileType].filter(
    (field) => !mappings.some((m) => m.dbField === field)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="העלאת נתונים"
          subtitle="העלה קבצי CSV לייבוא נתונים למערכת"
        />

        <div className="space-y-4">
          <Select
            label="סוג קובץ"
            options={FILE_TYPE_OPTIONS}
            value={fileType}
            onChange={(e) => setFileType(e.target.value as UploadFileType)}
          />

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[var(--color-primary)] transition cursor-pointer"
            onClick={() => document.getElementById('file-input')?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">גרור קובץ CSV לכאן או לחץ לבחירה</p>
            <p className="text-sm text-gray-400">תומך בקבצי CSV בלבד</p>
          </div>

          {file && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText size={20} className="text-[var(--color-primary)]" />
              <span className="flex-1">{file.name}</span>
              <span className="text-sm text-gray-500">
                {parseResult?.meta.rowCount} שורות
              </span>
              <button onClick={() => { setFile(null); setParseResult(null); }}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
          )}

          {uploadResult && (
            <div
              className={`flex items-center gap-3 p-4 rounded-lg ${
                uploadResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {uploadResult.success ? (
                <CheckCircle size={20} />
              ) : (
                <AlertCircle size={20} />
              )}
              <span>{uploadResult.message}</span>
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={showMappingModal}
        onClose={() => setShowMappingModal(false)}
        title="מיפוי עמודות"
        size="lg"
      >
        <div className="space-y-6">
          <p className="text-gray-600">
            התאם את עמודות הקובץ לשדות במערכת. שדות חובה מסומנים ב-*
          </p>

          {parseResult?.errors && parseResult.errors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="font-medium text-yellow-800 mb-2">שגיאות בקריאת הקובץ:</p>
              <ul className="text-sm text-yellow-700">
                {parseResult.errors.slice(0, 5).map((err, i) => (
                  <li key={i}>שורה {err.row}: {err.message}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            {parseResult?.meta.fields.map((csvColumn) => (
              <div key={csvColumn} className="flex items-center gap-4">
                <div className="w-1/3">
                  <span className="text-sm font-medium">{csvColumn}</span>
                </div>
                <div className="w-8 text-center text-gray-400">→</div>
                <div className="flex-1">
                  <Select
                    options={[
                      { value: '', label: 'לא ממופה' },
                      ...DB_FIELDS[fileType],
                    ]}
                    value={getMappingForColumn(csvColumn)}
                    onChange={(e) => updateMapping(csvColumn, e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {missingRequiredFields.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-medium text-red-800">שדות חובה חסרים:</p>
              <p className="text-sm text-red-700">
                {missingRequiredFields.join(', ')}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowMappingModal(false)}>
              ביטול
            </Button>
            <Button
              onClick={handleUpload}
              isLoading={isUploading}
              disabled={missingRequiredFields.length > 0}
            >
              העלה נתונים
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
