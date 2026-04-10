import React, { useState } from 'react';
import { X, Bell } from 'lucide-react';

export interface Notification {
  id: string;
  type: 'task' | 'alert' | 'update';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose, notifications }) => {
  const [readAll, setReadAll] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task':
        return 'border-cyan-500/30 bg-cyan-500/10';
      case 'alert':
        return 'border-amber-500/30 bg-amber-500/10';
      case 'update':
        return 'border-purple-500/30 bg-purple-500/10';
      default:
        return 'border-white/10 bg-white/5';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task':
        return '✓';
      case 'alert':
        return '⚠';
      case 'update':
        return '◆';
      default:
        return '●';
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
            <Bell size={20} className="text-cyan-400" />
            <h2 className="text-xl font-semibold text-foreground">Notifications</h2>
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-1 rounded-full text-xs bg-cyan-500/20 text-cyan-300">
                {unreadCount}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center">
              <div className="text-muted-foreground">
                <p className="mb-2">No notifications yet</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 ${getTypeColor(notification.type)} ${
                    notification.read ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`text-lg font-bold ${
                      notification.type === 'task' ? 'text-cyan-400' :
                      notification.type === 'alert' ? 'text-amber-400' :
                      'text-purple-400'
                    }`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground text-sm">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {notification.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-4 border-t border-white/10 space-y-2">
            <button
              onClick={() => setReadAll(!readAll)}
              className="w-full py-2 text-sm text-cyan-400 hover:text-cyan-300 font-medium transition-all"
            >
              {readAll ? 'Mark as unread' : 'Mark all as read'}
            </button>
            <button className="w-full py-2 text-sm text-red-400 hover:text-red-300 font-medium transition-all">
              Clear all
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
