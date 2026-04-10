import React from 'react';
import { X, AlertCircle } from 'lucide-react';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  actionable?: boolean;
}

interface AlertsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onAction?: (alertId: string) => void;
}

const AlertsPanel: React.FC<AlertsPanelProps> = ({ isOpen, onClose, alerts, onAction }) => {
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const highCount = alerts.filter(a => a.severity === 'high').length;

  const getSeverityColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500/50 bg-red-500/10';
      case 'high':
        return 'border-amber-500/50 bg-amber-500/10';
      case 'medium':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'low':
        return 'border-cyan-500/30 bg-cyan-500/10';
      default:
        return 'border-white/10 bg-white/5';
    }
  };

  const getSeverityTextColor = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-300';
      case 'high':
        return 'text-amber-300';
      case 'medium':
        return 'text-yellow-300';
      case 'low':
        return 'text-cyan-300';
      default:
        return 'text-foreground';
    }
  };

  const getSeverityBadge = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-300';
      case 'high':
        return 'bg-amber-500/20 text-amber-300';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'low':
        return 'bg-cyan-500/20 text-cyan-300';
      default:
        return 'bg-white/10 text-foreground';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-screen w-full max-w-md glass-panel border-l border-white/10 rounded-none flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <AlertCircle size={20} className="text-amber-400" />
            <h2 className="text-xl font-semibold text-foreground">Alerts</h2>
            {(criticalCount + highCount) > 0 && (
              <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                criticalCount > 0 ? 'bg-red-500/20 text-red-300' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {criticalCount + highCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-2 p-4 border-b border-white/10">
          <div className="text-center">
            <p className="text-xl font-bold text-red-300">{criticalCount}</p>
            <p className="text-xs text-muted-foreground">Critical</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-amber-300">{highCount}</p>
            <p className="text-xs text-muted-foreground">High</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-yellow-300">{alerts.filter(a => a.severity === 'medium').length}</p>
            <p className="text-xs text-muted-foreground">Medium</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-cyan-300">{alerts.filter(a => a.severity === 'low').length}</p>
            <p className="text-xs text-muted-foreground">Low</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="text-muted-foreground">
                <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p className="mb-2">No active alerts</p>
                <p className="text-sm">All systems operating normally</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-l-4 ${getSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-foreground text-sm">
                          {alert.title}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${getSeverityBadge(alert.severity)}`}>
                          {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {alert.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {alert.timestamp}
                      </p>
                    </div>
                    {alert.actionable && (
                      <button
                        onClick={() => onAction?.(alert.id)}
                        className="flex-shrink-0 px-3 py-1 rounded text-xs font-medium bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 transition-all whitespace-nowrap"
                      >
                        Action
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {alerts.length > 0 && (
          <div className="p-4 border-t border-white/10 space-y-2">
            <button className="w-full py-2 text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-all">
              Acknowledge all
            </button>
            <button className="w-full py-2 text-sm text-muted-foreground hover:text-foreground font-medium transition-all">
              View in dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertsPanel;
