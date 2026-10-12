import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, ArrowRight } from 'lucide-react';
import { useVideos } from '../context/VideoContext';

interface NotificationsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ onNavigate }) => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useVideos();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifs = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-800">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#FF2A38]" />
            <span>Notifications</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Activity updates, subscriptions, and system notifications
          </p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 transition-colors"
        >
          <CheckCheck className="w-4 h-4 text-[#FF2A38]" />
          <span>Mark all read</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
            filter === 'all'
              ? 'bg-[#FF2A38] text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
            filter === 'unread'
              ? 'bg-[#FF2A38] text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {filteredNotifs.length === 0 ? (
          <div className="py-20 text-center text-xs text-gray-400 bg-gray-50 dark:bg-[#121418] rounded-3xl border border-dashed border-gray-200 dark:border-gray-800">
            No notifications in this filter.
          </div>
        ) : (
          filteredNotifs.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                markNotificationRead(notif.id);
                if (notif.link) {
                  onNavigate('watch', { id: notif.link });
                }
              }}
              className={`flex items-start gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                !notif.read
                  ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200/60 dark:border-red-900/40 shadow-xs'
                  : 'bg-white dark:bg-[#16181D] border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40'
              }`}
            >
              {notif.avatar ? (
                <img
                  src={notif.avatar}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                />
              ) : notif.thumbnail ? (
                <img
                  src={notif.thumbnail}
                  alt=""
                  className="w-12 h-10 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/60 text-[#FF2A38] flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-900 dark:text-white">
                  {notif.title}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                  {notif.message}
                </p>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  {notif.timestamp}
                </span>
              </div>

              {!notif.read && (
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF2A38] mt-2 flex-shrink-0" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
