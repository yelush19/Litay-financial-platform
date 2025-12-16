import React, { useState, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown, Check } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type { ExportConfig, DiscrepancySummary, ComparisonData, AlertItem } from './types';
import type { CashFlowData } from '../CashFlow/types';

interface ExportButtonProps {
  discrepancySummary?: DiscrepancySummary;
  comparisonData?: ComparisonData[];
  cashFlowData?: CashFlowData;
  alerts?: AlertItem[];
  year: number;
  formatCurrency: (amount: number) => string;
}

const ExportButton: React.FC<ExportButtonProps> = ({
  discrepancySummary,
  comparisonData,
  cashFlowData,
  alerts,
  year,
  formatCurrency,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const exportToExcel = async (config: ExportConfig) => {
    setIsExporting(true);

    try {
      const workbook = XLSX.utils.book_new();

      // Summary Sheet
      if (config.sections.includes('summary') && discrepancySummary) {
        const summaryData = [
          ['דוח סיכום - השוואת ביאורים למאזן בוחן', '', '', ''],
          ['שנה:', year, '', ''],
          ['', '', '', ''],
          ['מדד', 'ערך', '', ''],
          ['סה"כ חשבונות', discrepancySummary.totalAccounts, '', ''],
          ['חשבונות תואמים', discrepancySummary.matchedAccounts, '', ''],
          ['חשבונות עם הפרש', discrepancySummary.discrepancyAccounts, '', ''],
          ['אחוז התאמה', `${discrepancySummary.matchRate.toFixed(1)}%`, '', ''],
          ['סה"כ הפרשים', discrepancySummary.totalDiscrepancyAmount, '', ''],
          ['התראות קריטיות', discrepancySummary.criticalCount, '', ''],
          ['אזהרות', discrepancySummary.warningCount, '', ''],
        ];

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'סיכום');
      }

      // Discrepancies Sheet
      if (config.sections.includes('discrepancies') && comparisonData) {
        const discrepancyRows = comparisonData
          .filter(item => Math.abs(item.difference) > 0.01)
          .map(item => ({
            'מפתח חשבון': item.accountKey,
            'שם חשבון': item.accountName,
            'קוד מיון': item.sortCode,
            'שם קוד מיון': item.sortCodeName,
            'סה"כ ביאורים': item.biurimTotal,
            'סה"כ מאזן': item.balanceTotal,
            'הפרש': item.difference,
            'אחוז התאמה': `${item.matchRate.toFixed(1)}%`,
          }));

        if (discrepancyRows.length > 0) {
          const discrepancySheet = XLSX.utils.json_to_sheet(discrepancyRows);
          XLSX.utils.book_append_sheet(workbook, discrepancySheet, 'הפרשים');
        }
      }

      // Cash Flow Sheet
      if (config.sections.includes('cashflow') && cashFlowData) {
        const cashFlowRows = [
          ['דוח תזרים מזומנים', '', ''],
          ['', '', ''],
          ['פעילות שוטפת', '', ''],
          ['רווח נקי', cashFlowData.netIncome, ''],
          ['פחת', cashFlowData.depreciation, ''],
          ['שינוי בלקוחות', -cashFlowData.accountsReceivableChange, ''],
          ['שינוי בספקים', cashFlowData.accountsPayableChange, ''],
          ['שינוי במלאי', -cashFlowData.inventoryChange, ''],
          ['סה"כ פעילות שוטפת', cashFlowData.operatingCashFlow, ''],
          ['', '', ''],
          ['פעילות השקעה', '', ''],
          ['רכישת נכסים', -cashFlowData.propertyPurchase, ''],
          ['מכירת נכסים', cashFlowData.propertySale, ''],
          ['סה"כ פעילות השקעה', cashFlowData.investingCashFlow, ''],
          ['', '', ''],
          ['פעילות מימון', '', ''],
          ['קבלת הלוואות', cashFlowData.loanProceeds, ''],
          ['פירעון הלוואות', -cashFlowData.loanRepayments, ''],
          ['סה"כ פעילות מימון', cashFlowData.financingCashFlow, ''],
          ['', '', ''],
          ['שינוי נטו במזומנים', cashFlowData.netCashChange, ''],
          ['יתרת פתיחה', cashFlowData.openingCash, ''],
          ['יתרת סגירה', cashFlowData.closingCash, ''],
        ];

        const cashFlowSheet = XLSX.utils.aoa_to_sheet(cashFlowRows);
        XLSX.utils.book_append_sheet(workbook, cashFlowSheet, 'תזרים מזומנים');
      }

      // Alerts Sheet
      if (config.sections.includes('alerts') && alerts && alerts.length > 0) {
        const alertRows = alerts.map(alert => ({
          'סוג': alert.type === 'critical' ? 'קריטי' : alert.type === 'warning' ? 'אזהרה' : 'מידע',
          'קטגוריה': alert.category,
          'כותרת': alert.title,
          'הודעה': alert.message,
          'ערך': alert.value,
          'סף': alert.threshold || '',
          'חשבון': alert.accountName || '',
          'חודש': alert.month || '',
        }));

        const alertsSheet = XLSX.utils.json_to_sheet(alertRows);
        XLSX.utils.book_append_sheet(workbook, alertsSheet, 'התראות');
      }

      // Generate file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const fileName = `דוח_פיננסי_${year}_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const exportToCSV = async (section: ExportConfig['sections'][0]) => {
    setIsExporting(true);

    try {
      let csvContent = '';
      let fileName = '';

      if (section === 'discrepancies' && comparisonData) {
        const headers = ['מפתח חשבון', 'שם חשבון', 'קוד מיון', 'ביאורים', 'מאזן', 'הפרש'];
        csvContent = headers.join(',') + '\n';

        comparisonData
          .filter(item => Math.abs(item.difference) > 0.01)
          .forEach(item => {
            csvContent += [
              item.accountKey,
              `"${item.accountName}"`,
              item.sortCode,
              item.biurimTotal,
              item.balanceTotal,
              item.difference,
            ].join(',') + '\n';
          });

        fileName = `הפרשים_${year}.csv`;
      }

      if (csvContent) {
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, fileName);
      }
    } catch (error) {
      console.error('Error exporting to CSV:', error);
    } finally {
      setIsExporting(false);
      setIsOpen(false);
    }
  };

  const exportOptions = [
    {
      id: 'excel-full',
      label: 'דוח מלא (Excel)',
      icon: FileSpreadsheet,
      color: '#16a34a',
      action: () => exportToExcel({
        format: 'excel',
        sections: ['summary', 'discrepancies', 'cashflow', 'alerts'],
        includeCharts: false,
      }),
    },
    {
      id: 'excel-discrepancies',
      label: 'הפרשים בלבד (Excel)',
      icon: FileSpreadsheet,
      color: '#16a34a',
      action: () => exportToExcel({
        format: 'excel',
        sections: ['discrepancies'],
        includeCharts: false,
      }),
    },
    {
      id: 'csv-discrepancies',
      label: 'הפרשים (CSV)',
      icon: FileText,
      color: '#6b7280',
      action: () => exportToCSV('discrepancies'),
    },
  ];

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          backgroundColor: '#16a34a',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: isExporting ? 'wait' : 'pointer',
          transition: 'all 0.2s',
          opacity: isExporting ? 0.7 : 1,
        }}
        onMouseEnter={(e) => {
          if (!isExporting) e.currentTarget.style.backgroundColor = '#15803d';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#16a34a';
        }}
      >
        {isExporting ? (
          <>
            <div style={{
              width: '16px',
              height: '16px',
              border: '2px solid white',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
            מייצא...
          </>
        ) : (
          <>
            <Download size={16} />
            ייצוא
            <ChevronDown size={14} />
          </>
        )}
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          marginTop: '4px',
          backgroundColor: 'white',
          borderRadius: '10px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
          border: '1px solid #e5e7eb',
          minWidth: '220px',
          zIndex: 50,
          overflow: 'hidden',
        }}>
          <div style={{
            padding: '8px 12px',
            fontSize: '11px',
            fontWeight: '600',
            color: '#9ca3af',
            textTransform: 'uppercase',
            borderBottom: '1px solid #f3f4f6',
          }}>
            בחר פורמט
          </div>

          {exportOptions.map((option) => (
            <button
              key={option.id}
              onClick={option.action}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '100%',
                padding: '10px 14px',
                backgroundColor: 'white',
                border: 'none',
                fontSize: '13px',
                color: '#374151',
                cursor: 'pointer',
                textAlign: 'right',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f9fafb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
              }}
            >
              <option.icon size={18} color={option.color} />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default ExportButton;
