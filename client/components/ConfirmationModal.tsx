import React from 'react';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

export type ActionType = 'create' | 'update' | 'delete' | 'confirm';
export type AlertType = 'success' | 'warning' | 'error' | 'info';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  actionType: ActionType;
  alertType?: AlertType;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  actionType,
  alertType = 'info',
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
  isLoading = false,
}) => {
  const getActionColor = (type: ActionType) => {
    switch (type) {
      case 'create':
        return 'from-cyan-500 to-cyan-600';
      case 'update':
        return 'from-purple-500 to-purple-600';
      case 'delete':
        return 'from-red-500 to-red-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  const getAlertColor = (type: AlertType) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 bg-emerald-500/10';
      case 'warning':
        return 'border-amber-500/30 bg-amber-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      case 'info':
        return 'border-cyan-500/30 bg-cyan-500/10';
      default:
        return 'border-white/10 bg-white/5';
    }
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-emerald-400" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-amber-400" />;
      case 'error':
        return <AlertTriangle size={20} className="text-red-400" />;
      case 'info':
        return <AlertTriangle size={20} className="text-cyan-400" />;
      default:
        return null;
    }
  };

  const defaultConfirmText = {
    create: 'Create',
    update: 'Update',
    delete: 'Delete',
    confirm: 'Confirm',
  }[actionType];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative glass-panel border-white/10 max-w-md w-full shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-all disabled:opacity-50"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`p-4 rounded-lg bg-gradient-to-br ${getActionColor(actionType)} glow-cyan`}>
              <div className="w-8 h-8 text-background flex items-center justify-center font-bold">
                {actionType === 'delete' ? '⚠' : '?'}
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-foreground text-center mb-4">
            {title}
          </h2>

          {/* Message */}
          <p className="text-muted-foreground text-center mb-6">
            {message}
          </p>

          {/* Alert Box */}
          {actionType === 'delete' && (
            <div className={`p-4 rounded-lg border mb-6 flex items-start gap-3 ${getAlertColor('warning')}`}>
              <AlertTriangle size={20} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-300">
                  This action cannot be undone
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please confirm that you want to permanently delete this item.
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`w-full py-3 rounded-lg bg-gradient-to-r ${getActionColor(actionType)} text-background font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-background"></div>
              )}
              {confirmText || defaultConfirmText}
            </button>

            <button
              onClick={onCancel}
              disabled={isLoading}
              className="w-full py-3 rounded-lg border border-white/20 text-foreground hover:bg-white/5 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText || 'Cancel'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
