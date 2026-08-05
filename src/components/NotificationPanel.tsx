import React, { useState } from 'react';
import { NotificationItem } from '../types';
import { Bell, CheckCheck, Trash2, X, AlertTriangle, Info, CheckCircle, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';

interface NotificationPanelProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onDeleteNotification: (id: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onDeleteNotification,
  onNavigateTab,
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'duplicate'>('all');

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'unread') return !n.read;
    if (activeFilter === 'duplicate') return n.category === 'duplicate_registration' || n.type === 'warning';
    return true;
  });

  const getIcon = (type: NotificationItem['type'], category?: NotificationItem['category']) => {
    if (category === 'duplicate_registration') {
      return <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />;
    }
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-purple-500 shrink-0" />;
    }
  };

  return (
    <div 
      className="absolute right-0 top-14 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 z-50 overflow-hidden animate-slideUp font-sans transition-colors duration-200"
      id="notification-panel"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#622569] to-[#9b51e0] p-4 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-white/15 rounded-xl backdrop-blur-md">
            <Bell className="w-4 h-4 text-purple-200" />
          </div>
          <div>
            <h3 className="font-bold text-sm font-['Poppins'] tracking-tight flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                  {unreadCount} new
                </span>
              )}
            </h3>
            <p className="text-[10px] text-purple-100/90">Alerts, updates & chapter notices</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-purple-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          title="Close Notifications"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs & Quick Actions */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              activeFilter === 'all'
                ? 'bg-[#622569] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            All ({notifications.length})
          </button>

          <button
            onClick={() => setActiveFilter('unread')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              activeFilter === 'unread'
                ? 'bg-[#622569] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            Unread ({unreadCount})
          </button>

          <button
            onClick={() => setActiveFilter('duplicate')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              activeFilter === 'duplicate'
                ? 'bg-[#622569] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700'
            }`}
          >
            Alerts
          </button>
        </div>

        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllAsRead}
              className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-[#622569] dark:hover:text-purple-300 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              title="Clear all notifications"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 scrollbar-thin">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">No notifications found</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {activeFilter === 'unread' ? 'All caught up! No unread alerts.' : 'Your notification log is clear.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => {
            const isDuplicateAlert = notif.category === 'duplicate_registration';

            return (
              <div
                key={notif.id}
                onClick={() => onMarkAsRead(notif.id)}
                className={`p-4 transition-colors cursor-pointer group relative flex items-start gap-3 ${
                  !notif.read
                    ? isDuplicateAlert
                      ? 'bg-amber-50/70 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-950/30 border-l-4 border-l-amber-500'
                      : 'bg-purple-50/50 dark:bg-purple-950/20 hover:bg-purple-50 dark:hover:bg-purple-950/40 border-l-4 border-l-[#622569] dark:border-l-purple-500'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                {getIcon(notif.type, notif.category)}

                <div className="flex-1 space-y-1 pr-6">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className={`text-xs font-bold ${
                      isDuplicateAlert
                        ? 'text-amber-900 dark:text-amber-300'
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {notif.title}
                    </h4>

                    {isDuplicateAlert && (
                      <span className="px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                        Duplicate Alert
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                    <span>{notif.timestamp}</span>

                    {notif.linkTab && onNavigateTab && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateTab(notif.linkTab!);
                          onClose();
                        }}
                        className="text-[#622569] dark:text-purple-400 font-bold hover:underline flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteNotification(notif.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-all absolute top-3 right-3"
                  title="Remove notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200/80 dark:border-slate-800 text-center">
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
          IET CONNECT Automated Alert System
        </p>
      </div>
    </div>
  );
};
