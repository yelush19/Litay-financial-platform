import React, { useState, useEffect, useMemo } from 'react';
import { FinancialDashboard } from '@/features/reports/components/Dashboard';
import { useTenant } from '@/features/tenant';
import { Loader2 } from 'lucide-react';

// Demo data generator for development
const generateDemoData = () => {
  const year = 2024;
  const activeMonths = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  // Generate transactions
  const transactions: Array<{
    accountKey: number;
    accountName: string;
    sortCode: number;
    sortCodeName: string;
    amount: number;
    month: number;
  }> = [];

  const accounts = [
    { key: 1001, name: 'קופה ראשית', sortCode: 100, sortCodeName: 'מזומנים' },
    { key: 1301, name: 'בנק לאומי', sortCode: 130, sortCodeName: 'בנקים' },
    { key: 1601, name: 'לקוחות כלליים', sortCode: 160, sortCodeName: 'לקוחות' },
    { key: 2001, name: 'ספקים כלליים', sortCode: 200, sortCodeName: 'ספקים' },
    { key: 6001, name: 'הכנסות ממכירות', sortCode: 600, sortCodeName: 'הכנסות' },
    { key: 6002, name: 'הכנסות משירותים', sortCode: 600, sortCodeName: 'הכנסות' },
    { key: 8001, name: 'עלות סחורה', sortCode: 800, sortCodeName: 'עלות המכר' },
    { key: 8011, name: 'הוצאות שכר', sortCode: 811, sortCodeName: 'הוצאות שכר' },
    { key: 8021, name: 'הוצאות משרד', sortCode: 802, sortCodeName: 'הוצאות הנהלה' },
  ];

  activeMonths.forEach(month => {
    accounts.forEach(account => {
      const baseAmount = Math.random() * 50000 + 10000;
      const variance = (Math.random() - 0.5) * 10000;

      transactions.push({
        accountKey: account.key,
        accountName: account.name,
        sortCode: account.sortCode,
        sortCodeName: account.sortCodeName,
        amount: account.sortCode >= 600 ? -(baseAmount + variance) : baseAmount + variance,
        month,
      });
    });
  });

  // Generate trial balance (with some intentional discrepancies)
  const trialBalance = accounts.map(account => {
    const months: { [key: number]: number } = {};

    activeMonths.forEach(month => {
      const txAmount = transactions
        .filter(tx => tx.accountKey === account.key && tx.month === month)
        .reduce((sum, tx) => sum + tx.amount, 0);

      // Add small discrepancy to some accounts
      const discrepancy = Math.random() > 0.7 ? (Math.random() - 0.5) * 2000 : 0;
      months[month] = txAmount + discrepancy;
    });

    return {
      accountKey: account.key,
      accountName: account.name,
      sortCode: account.sortCode,
      sortCodeName: account.sortCodeName,
      months,
    };
  });

  // Generate balance data
  const balances = accounts.flatMap(account => {
    return activeMonths.map(month => {
      const prevMonth = month === 1 ? 0 : month - 1;
      const prevBalance = prevMonth === 0 ? Math.random() * 100000 : 0;
      const change = transactions
        .filter(tx => tx.accountKey === account.key && tx.month === month)
        .reduce((sum, tx) => sum + tx.amount, 0);

      return {
        accountKey: account.key,
        accountName: account.name,
        accountType: account.sortCode < 200 ? 'asset' : account.sortCode < 300 ? 'liability' : 'other',
        month,
        year,
        openingBalance: prevBalance,
        closingBalance: prevBalance + change,
        change,
      };
    });
  });

  return { transactions, trialBalance, balances, activeMonths, year };
};

export function ReportsPage() {
  const { tenant } = useTenant();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<ReturnType<typeof generateDemoData> | null>(null);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setData(generateDemoData());
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('he-IL', {
      style: 'currency',
      currency: 'ILS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500">
        אין נתונים להצגה
      </div>
    );
  }

  return (
    <div className="-m-6">
      <FinancialDashboard
        transactions={data.transactions}
        trialBalance={data.trialBalance}
        balances={data.balances}
        activeMonths={data.activeMonths}
        year={data.year}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
