import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button, Card, CardHeader, Modal, Select } from '@/shared/components/ui';
import { parseCSV } from '@/shared/utils/csvParser';
import { useTenantId } from '@/features/tenant';
import { useAuth } from '@/features/auth';
import {
  upsertSortCodes,
  upsertAccounts,
  logIndexSync,
  getLastSync,
} from '@/lib/supabase/queries/indexes';
import type {
  SortCodeInput,
  AccountIndexInput,
  IndexType,
  IndexSyncHistory,
  DEFAULT_HASHAVSHEVET_MAPPINGS,
} from '@/shared/types';

type UploadType = 'sort_codes' | 'accounts' | 'customers' | 'suppliers';

const UPLOAD_OPTIONS = [
  { value: 'sort_codes', label: 'קודי מיון' },
  { value: 'accounts', label: 'אינדקס חשבונות (כללי)' },
  { value: 'customers', label: 'לקוחות' },
  { value: 'suppliers', label: 'ספקים' },
];

interface UploadResult {
  success: boolean;
  message: string;
  details?: {
    total: number;
    added: number;
    updated: number;
    errors: string[];
  };
}

export function IndexUploader() {
  const tenantId = useTenantId();
  const { profile } = useAuth();
  const [uploadType, setUploadType] = useState<UploadType>('sort_codes');
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [lastSync, setLastSync] = useState<IndexSyncHistory | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, unknown>[]>([]);

  const loadLastSync = useCallback(async () => {
    if (!tenantId) return;
    const indexType: IndexType = uploadType === 'sort_codes' ? 'sort_codes' : 'accounts';
    const sync = await getLastSync(tenantId, indexType);
    setLastSync(sync);
  }, [tenantId, uploadType]);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);

    const parsed = await parseCSV(selectedFile);
    if (parsed.data.length > 0) {
      setPreviewData(parsed.data.slice(0, 5) as Record<string, unknown>[]);
      setShowPreview(true);
    }

    loadLastSync();
  };

  const handleUpload = async () => {
    if (!tenantId || !file) return;

    setIsUploading(true);
    setResult(null);

    try {
      const parsed = await parseCSV(file);
      const data = parsed.data as Record<string, unknown>[];

      let uploadResult: { added: number; updated: number; errors: string[] };
      const indexType: IndexType = uploadType === 'sort_codes' ? 'sort_codes' : 'accounts';

      if (uploadType === 'sort_codes') {
        // Transform to SortCodeInput
        const sortCodes: SortCodeInput[] = data.map((row, idx) => ({
          code: Number(row['קוד מיון'] || row['code'] || row['קוד'] || idx + 600),
          name: String(row['שם קוד מיון'] || row['name'] || row['שם'] || ''),
          parentCode: row['קוד אב'] ? Number(row['קוד אב']) : undefined,
          reportType: detectReportType(Number(row['קוד מיון'] || row['code'] || 0)),
        })).filter(sc => sc.name);

        uploadResult = await upsertSortCodes(tenantId, sortCodes);
      } else {
        // Transform to AccountIndexInput
        const accountType = uploadType === 'customers' ? 'customer' :
                           uploadType === 'suppliers' ? 'supplier' : undefined;

        const accounts: AccountIndexInput[] = data.map((row) => ({
          accountKey: Number(row['מפתח'] || row['account_key'] || row['key'] || 0),
          accountName: String(row['שם'] || row['account_name'] || row['name'] || ''),
          sortCode: row['קוד מיון'] ? Number(row['קוד מיון']) : undefined,
          accountType: accountType || detectAccountType(row),
          idNumber: row['מספר זהות'] || row['ח.פ'] ? String(row['מספר זהות'] || row['ח.פ']) : undefined,
          address: row['כתובת'] ? String(row['כתובת']) : undefined,
          phone: row['טלפון'] ? String(row['טלפון']) : undefined,
          email: row['דואר אלקטרוני'] || row['email'] ? String(row['דואר אלקטרוני'] || row['email']) : undefined,
          currentBalance: row['יתרה'] ? Number(row['יתרה']) : undefined,
        })).filter(acc => acc.accountKey && acc.accountName);

        uploadResult = await upsertAccounts(tenantId, accounts);
      }

      // Log the sync
      await logIndexSync(
        tenantId,
        indexType,
        'hashavshevet_export',
        {
          total: data.length,
          added: uploadResult.added,
          updated: uploadResult.updated,
          status: uploadResult.errors.length === 0 ? 'success' : 'partial',
          errorMessage: uploadResult.errors.length > 0 ? uploadResult.errors.join('; ') : undefined,
        },
        profile?.id
      );

      setResult({
        success: uploadResult.errors.length === 0,
        message: uploadResult.errors.length === 0
          ? 'הנתונים נטענו בהצלחה!'
          : 'חלק מהנתונים נטענו עם שגיאות',
        details: {
          total: data.length,
          added: uploadResult.added,
          updated: uploadResult.updated,
          errors: uploadResult.errors,
        },
      });

      loadLastSync();
    } catch (error) {
      setResult({
        success: false,
        message: 'שגיאה בטעינת הנתונים',
      });
    } finally {
      setIsUploading(false);
      setShowPreview(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader
          title="טעינת אינדקסים מחשבשבת"
          subtitle="ייבוא קודי מיון, לקוחות, ספקים וכרטיסי חשבון"
        />

        <div className="space-y-4">
          <Select
            label="סוג נתונים"
            options={UPLOAD_OPTIONS}
            value={uploadType}
            onChange={(e) => {
              setUploadType(e.target.value as UploadType);
              setFile(null);
              setResult(null);
            }}
          />

          {lastSync && (
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <RefreshCw size={16} />
              <span>
                סנכרון אחרון: {new Date(lastSync.syncedAt).toLocaleDateString('he-IL')}{' '}
                ({lastSync.recordsAdded} נוספו, {lastSync.recordsUpdated} עודכנו)
              </span>
            </div>
          )}

          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[var(--color-primary)] transition cursor-pointer"
            onClick={() => document.getElementById('index-file-input')?.click()}
          >
            <input
              id="index-file-input"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 mb-2">
              גרור קובץ CSV מחשבשבת או לחץ לבחירה
            </p>
            <p className="text-sm text-gray-400">
              {uploadType === 'sort_codes' && 'קובץ קודי מיון'}
              {uploadType === 'accounts' && 'קובץ אינדקס חשבונות'}
              {uploadType === 'customers' && 'קובץ לקוחות'}
              {uploadType === 'suppliers' && 'קובץ ספקים'}
            </p>
          </div>

          {file && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <FileText size={20} className="text-[var(--color-primary)]" />
              <span className="flex-1">{file.name}</span>
              <Button size="sm" onClick={handleUpload} isLoading={isUploading}>
                טען נתונים
              </Button>
            </div>
          )}

          {result && (
            <div
              className={`p-4 rounded-lg ${
                result.success ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {result.success ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span className="font-medium">{result.message}</span>
              </div>
              {result.details && (
                <div className="text-sm mt-2">
                  <p>סה"כ רשומות: {result.details.total}</p>
                  <p>נוספו: {result.details.added}</p>
                  <p>עודכנו: {result.details.updated}</p>
                  {result.details.errors.length > 0 && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-red-600">
                        {result.details.errors.length} שגיאות
                      </summary>
                      <ul className="mt-1 text-red-600 text-xs">
                        {result.details.errors.slice(0, 10).map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="תצוגה מקדימה"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            נמצאו {previewData.length > 5 ? '5+' : previewData.length} רשומות. הנה תצוגה מקדימה:
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  {previewData[0] &&
                    Object.keys(previewData[0]).slice(0, 5).map((key) => (
                      <th key={key} className="px-3 py-2 text-right">
                        {key}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody>
                {previewData.map((row, idx) => (
                  <tr key={idx} className="border-b">
                    {Object.values(row).slice(0, 5).map((val, i) => (
                      <td key={i} className="px-3 py-2">
                        {String(val).substring(0, 30)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              ביטול
            </Button>
            <Button onClick={handleUpload} isLoading={isUploading}>
              טען {previewData.length}+ רשומות
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Helper functions
function detectReportType(code: number): 'income' | 'cogs' | 'operating' | 'financial' | undefined {
  if (code >= 600 && code < 700) return 'income';
  if (code >= 700 && code < 800) return 'cogs';
  if (code >= 800 && code < 900) return 'operating';
  if (code >= 900) return 'financial';
  return undefined;
}

function detectAccountType(row: Record<string, unknown>): AccountIndexInput['accountType'] {
  const sortCode = Number(row['קוד מיון'] || 0);
  if (sortCode >= 100 && sortCode < 200) return 'customer';
  if (sortCode >= 200 && sortCode < 300) return 'supplier';
  if (sortCode >= 800 && sortCode < 900) return 'expense';
  if (sortCode >= 600 && sortCode < 700) return 'income';
  return 'other';
}
