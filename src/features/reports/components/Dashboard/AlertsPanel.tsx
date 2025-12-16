import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  ChevronDown,
  ChevronUp,
  Bell,
  Check,
} from 'lucide-react';
import type { AlertItem } from './types';

interface AlertsPanelProps {
  alerts: AlertItem[];
  formatCurrency: (amount: number) => string;
  onDismiss?: (alertId: string) => void;
  onDismissAll?: () => void;
  maxVisible?: number;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({
  alerts,
  formatCurrency,
  onDismiss,
  onDismissAll,
  maxVisible = 5,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const visibleAlerts = alerts.filter(a => !dismissedIds.has(a.id) && !a.dismissed);
  const displayAlerts = expanded ? visibleAlerts : visibleAlerts.slice(0, maxVisible);
  const hasMore = visibleAlerts.length > maxVisible;

  const criticalCount = visibleAlerts.filter(a => a.type === 'critical').length;
  const warningCount = visibleAlerts.filter(a => a.type === 'warning').length;
  const infoCount = visibleAlerts.filter(a => a.type === 'info').length;

  const handleDismiss = (alertId: string) => {
    setDismissedIds(prev => new Set([...prev, alertId]));
    onDismiss?.(alertId);
  };

  const handleDismissAll = () => {
    setDismissedIds(new Set(visibleAlerts.map(a => a.id)));
    onDismissAll?.();
  };

  const getAlertStyle = (type: AlertItem['type']) => {
    switch (type) {
      case 'critical':
        return {
          bg: '#fef2f2',
          border: '#fecaca',
          icon: AlertTriangle,
          iconColor: '#dc2626',
          titleColor: '#991b1b',
        };
      case 'warning':
        return {
          bg: '#fffbeb',
          border: '#fde68a',
          icon: AlertCircle,
          iconColor: '#d97706',
          titleColor: '#92400e',
        };
      case 'info':
      default:
        return {
          bg: '#eff6ff',
          border: '#bfdbfe',
          icon: Info,
          iconColor: '#2563eb',
          titleColor: '#1e40af',
        };
    }
  };

  const getCategoryLabel = (category: AlertItem['category']) => {
    const labels: Record<AlertItem['category'], string> = {
      discrepancy: 'הפרש',
      cash: 'תזרים',
      trend: 'מגמה',
      threshold: 'סף',
    };
    return labels[category] || category;
  };

  if (visibleAlerts.length === 0) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: '#ecfdf5',
        borderRadius: '12px',
        border: '1px solid #a7f3d0',
      }}>
        <Check size={40} color="#10b981" style={{ marginBottom: '12px' }} />
        <div style={{ fontSize: '16px', fontWeight: '600', color: '#047857' }}>
          אין התראות פעילות
        </div>
        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
          כל הנתונים תקינים
        </div>
      </div>
    );
  }

  return (
    <div style={{ direction: 'rtl' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 12px',
            backgroundColor: '#f3f4f6',
            borderRadius: '16px',
          }}>
            <Bell size={14} color="#6b7280" />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>
              {visibleAlerts.length} התראות
            </span>
          </div>

          {criticalCount > 0 && (
            <span style={{
              padding: '2px 8px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '600',
            }}>
              {criticalCount} קריטי
            </span>
          )}
          {warningCount > 0 && (
            <span style={{
              padding: '2px 8px',
              backgroundColor: '#fffbeb',
              color: '#d97706',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '600',
            }}>
              {warningCount} אזהרה
            </span>
          )}
          {infoCount > 0 && (
            <span style={{
              padding: '2px 8px',
              backgroundColor: '#eff6ff',
              color: '#2563eb',
              borderRadius: '10px',
              fontSize: '11px',
              fontWeight: '600',
            }}>
              {infoCount} מידע
            </span>
          )}
        </div>

        {visibleAlerts.length > 0 && (
          <button
            onClick={handleDismissAll}
            style={{
              padding: '4px 12px',
              backgroundColor: 'transparent',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#6b7280',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            סמן הכל כנקרא
          </button>
        )}
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {displayAlerts.map((alert) => {
          const style = getAlertStyle(alert.type);
          const IconComponent = style.icon;

          return (
            <div
              key={alert.id}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '12px 16px',
                backgroundColor: style.bg,
                border: `1px solid ${style.border}`,
                borderRadius: '10px',
                position: 'relative',
              }}
            >
              {/* Icon */}
              <div style={{
                flexShrink: 0,
                marginTop: '2px',
              }}>
                <IconComponent size={20} color={style.iconColor} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px',
                }}>
                  <span style={{
                    fontWeight: '600',
                    fontSize: '14px',
                    color: style.titleColor,
                  }}>
                    {alert.title}
                  </span>
                  <span style={{
                    padding: '2px 6px',
                    backgroundColor: 'white',
                    borderRadius: '4px',
                    fontSize: '10px',
                    color: '#6b7280',
                  }}>
                    {getCategoryLabel(alert.category)}
                  </span>
                </div>

                <p style={{
                  fontSize: '13px',
                  color: '#374151',
                  margin: 0,
                  lineHeight: 1.5,
                }}>
                  {alert.message}
                </p>

                {/* Details */}
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#6b7280',
                }}>
                  {alert.value !== undefined && (
                    <span>
                      ערך: <strong style={{ color: style.titleColor }}>
                        {formatCurrency(alert.value)}
                      </strong>
                    </span>
                  )}
                  {alert.threshold !== undefined && (
                    <span>סף: {formatCurrency(alert.threshold)}</span>
                  )}
                  {alert.accountName && (
                    <span>חשבון: {alert.accountName}</span>
                  )}
                  {alert.month && (
                    <span>חודש: {alert.month}</span>
                  )}
                </div>
              </div>

              {/* Dismiss button */}
              <button
                onClick={() => handleDismiss(alert.id)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  padding: '4px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)';
                  e.currentTarget.style.color = '#6b7280';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#9ca3af';
                }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Show More/Less */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            width: '100%',
            padding: '10px',
            marginTop: '0.75rem',
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '13px',
            color: '#6b7280',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#f9fafb';
          }}
        >
          {expanded ? (
            <>
              הצג פחות
              <ChevronUp size={16} />
            </>
          ) : (
            <>
              הצג עוד {visibleAlerts.length - maxVisible} התראות
              <ChevronDown size={16} />
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default AlertsPanel;
