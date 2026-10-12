import React from 'react';
import {
  Home,
  Flame,
  Tv,
  History,
  ThumbsUp,
  LayoutDashboard,
  Film,
  Compass,
  Settings,
  ShieldAlert,
  FileText,
  UserCheck,
  Video as VideoFolder,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVideos } from '../../context/VideoContext';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
  isOpen: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  isOpen,
  onCloseMobile,
}) => {
  const { currentUser, allUsers } = useAuth();
  const { subscriptions } = useVideos();

  // Get subscribed creator objects
  const subscribedCreators = allUsers.filter((u) => subscriptions.includes(u.id));

  const navItemClass = (page: string, paramsCheck?: boolean) => {
    const isActive = currentPage === page && (paramsCheck === undefined || paramsCheck);
    return `flex items-center gap-4 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-red-50 dark:bg-red-950/40 text-[#FF2A38] font-bold'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60'
    }`;
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed md:sticky top-14 md:top-16 left-0 h-[calc(100vh-3.5rem)] md:h-[calc(100vh-4rem)] z-50 md:z-30 bg-white dark:bg-[#0D0E11] border-r border-gray-200 dark:border-gray-800 transition-all duration-200 overflow-y-auto ${
          isOpen ? 'w-64 translate-x-0' : '-translate-x-full md:translate-x-0 md:w-20'
        }`}
      >
        <div className="p-3 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            <button
              onClick={() => {
                onNavigate('home');
                onCloseMobile?.();
              }}
              className={navItemClass('home')}
              title="Home"
            >
              <Home className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span>Home</span>}
            </button>

            <button
              onClick={() => {
                onNavigate('shorts');
                onCloseMobile?.();
              }}
              className={navItemClass('shorts')}
              title="Shorts"
            >
              <Flame className="w-5 h-5 flex-shrink-0 text-amber-500" />
              {isOpen && <span>Shorts</span>}
            </button>

            <button
              onClick={() => {
                onNavigate('subscriptions');
                onCloseMobile?.();
              }}
              className={navItemClass('subscriptions')}
              title="Subscriptions"
            >
              <Tv className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span>Subscriptions</span>}
            </button>
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800/80 pt-3" />

          {/* Library Section */}
          <div className="space-y-1">
            {isOpen && (
              <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                You
              </h4>
            )}

            <button
              onClick={() => {
                if (currentUser) {
                  onNavigate('channel', { id: currentUser.id });
                } else {
                  onNavigate('login');
                }
                onCloseMobile?.();
              }}
              className={navItemClass('channel')}
              title="Your Channel"
            >
              <UserCheck className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span>Your Channel</span>}
            </button>

            <button
              onClick={() => {
                onNavigate('dashboard');
                onCloseMobile?.();
              }}
              className={navItemClass('dashboard')}
              title="Creator Studio"
            >
              <LayoutDashboard className="w-5 h-5 flex-shrink-0 text-[#FF2A38]" />
              {isOpen && <span>Creator Studio</span>}
            </button>

            <button
              onClick={() => {
                onNavigate('library');
                onCloseMobile?.();
              }}
              className={navItemClass('library')}
              title="History & Library"
            >
              <History className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span>History & Library</span>}
            </button>
          </div>

          {/* Subscriptions section */}
          {isOpen && subscribedCreators.length > 0 && (
            <>
              <div className="border-t border-gray-100 dark:border-gray-800/80 pt-3" />
              <div className="space-y-1">
                <h4 className="px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Subscribed ({subscribedCreators.length})
                </h4>
                {subscribedCreators.map((creator) => (
                  <button
                    key={creator.id}
                    onClick={() => {
                      onNavigate('channel', { id: creator.id });
                      onCloseMobile?.();
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={creator.avatarUrl}
                        alt={creator.name}
                        className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                      />
                      <span className="truncate">{creator.name}</span>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-[#FF2A38]" />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Platform Settings & Legal */}
          <div className="border-t border-gray-100 dark:border-gray-800/80 pt-3" />
          <div className="space-y-1">
            <button
              onClick={() => {
                onNavigate('settings');
                onCloseMobile?.();
              }}
              className={navItemClass('settings')}
              title="Settings"
            >
              <Settings className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span>Settings & Storage</span>}
            </button>

            <button
              onClick={() => {
                onNavigate('terms');
                onCloseMobile?.();
              }}
              className={navItemClass('terms')}
              title="Terms & Privacy"
            >
              <FileText className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span>Terms & Privacy</span>}
            </button>
          </div>

          {isOpen && (
            <div className="px-3 pt-4 text-[11px] text-gray-400 dark:text-gray-600 space-y-1">
              <p className="font-semibold text-gray-500 dark:text-gray-400">PaPip Platform</p>
              <p>© 2026 PaPip Inc.</p>
              <p>Watch • Create • Share</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
