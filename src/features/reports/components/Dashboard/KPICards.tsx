import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  DollarSign,
  Users,
  Truck,
  Calendar,
  Percent,
  CheckCircle,
  AlertTriangle,
  Wallet,
  BarChart3,
} from 'lucide-react';
import type { KPIData } from './types';

interface KPICardsProps {
  kpis: KPIData[];
  formatCurrency: (amount: number) => string;
}

const ICONS: Record<string, React.FC<{ size?: number; color?: string }>> = {
  dollar: DollarSign,
  users: Users,
  truck: Truck,
  calendar: Calendar,
  percent: Percent,
  check: CheckCircle,
  alert: AlertTriangle,
  wallet: Wallet,
  chart: BarChart3,
};

const KPICards: React.FC<KPICardsProps> = ({ kpis, formatCurrency }) => {
  const formatValue = (kpi: KPIData): string => {
    switch (kpi.format) {
      case 'currency':
        return formatCurrency(kpi.value);
      case 'percent':
        return `${kpi.value.toFixed(1)}%`;
      case 'days':
        return `${kpi.value.toFixed(0)} ימים`;
      case 'number':
        return kpi.value.toLocaleString('he-IL');
      default:
        return kpi.value.toString();
    }
  };

  const getTrendIcon = (trend?: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      default:
        return Minus;
    }
  };

  const getTrendColor = (trend?: 'up' | 'down' | 'stable', isPositiveGood = true) => {
    if (!trend || trend === 'stable') return '#6b7280';
    if (trend === 'up') return isPositiveGood ? '#10b981' : '#ef4444';
    return isPositiveGood ? '#ef4444' : '#10b981';
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1rem',
    }}>
      {kpis.map((kpi) => {
        const IconComponent = kpi.icon ? ICONS[kpi.icon] : DollarSign;
        const TrendIcon = getTrendIcon(kpi.trend);
        const trendColor = getTrendColor(kpi.trend);

        return (
          <div
            key={kpi.id}
            style={{
              padding: '1.25rem',
              backgroundColor: kpi.bgColor,
              borderRadius: '12px',
              border: `1px solid ${kpi.color}30`,
              transition: 'transform 0.2s, box-shadow 0.2s',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '0.75rem',
            }}>
              <span style={{
                fontSize: '13px',
                color: '#6b7280',
                fontWeight: '500',
              }}>
                {kpi.title}
              </span>
              {IconComponent && (
                <div style={{
                  padding: '8px',
                  backgroundColor: `${kpi.color}20`,
                  borderRadius: '8px',
                }}>
                  <IconComponent size={18} color={kpi.color} />
                </div>
              )}
            </div>

            {/* Value */}
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: kpi.color,
              marginBottom: '0.5rem',
            }}>
              {formatValue(kpi)}
            </div>

            {/* Trend */}
            {kpi.trend && kpi.trendValue !== undefined && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12px',
                color: trendColor,
              }}>
                <TrendIcon size={14} />
                <span>
                  {kpi.trendValue >= 0 ? '+' : ''}{kpi.trendValue.toFixed(1)}%
                </span>
                <span style={{ color: '#9ca3af', marginRight: '4px' }}>
                  מהחודש הקודם
                </span>
              </div>
            )}

            {/* Previous value */}
            {kpi.previousValue !== undefined && (
              <div style={{
                fontSize: '11px',
                color: '#9ca3af',
                marginTop: '4px',
              }}>
                קודם: {kpi.format === 'currency'
                  ? formatCurrency(kpi.previousValue)
                  : kpi.previousValue.toLocaleString('he-IL')}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default KPICards;
