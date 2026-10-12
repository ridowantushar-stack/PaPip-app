import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Video as VideoIcon,
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
  Settings,
  LayoutDashboard,
  Check,
  Menu,
  X,
  Play,
  Share2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useVideos } from '../../context/VideoContext';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNavigate,
  currentPage,
  onToggleSidebar,
}) => {
  const { currentUser, isAuthenticated, logout, openAuthModal, allUsers, switchDemoUser } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useVideos();
  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchMobile, setShowSearchMobile] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('search', { q: searchQuery.trim() });
      setShowSearchMobile(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-[#0D0E11]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="flex items-center justify-between px-3 md:px-5 h-14 md:h-16 gap-2">
        {/* Left: Hamburger & Logo */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            title="Toggle Menu"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 group text-left focus:outline-none"
            aria-label="PaPip Home"
          >
            {/* Custom PaPip Logo: Crimson Play Hexagon/Pill */}
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#C91420] to-[#FF3B48] shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
              <Play className="w-4 h-4 text-white fill-white translate-x-0.5" />
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="font-black text-xl tracking-tight text-gray-900 dark:text-white font-mono">
                  Pa<span className="text-[#FF2A38]">Pip</span>
                </span>
              </div>
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-widest text-gray-400 dark:text-gray-500 -mt-1">
                Watch • Create • Share
              </span>
            </div>
          </button>
        </div>

        {/* Center: Search Omnibar (Desktop) */}
        <div className="hidden sm:flex items-center justify-center flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
            <div className="relative flex items-center w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos, creators, or topics..."
                className="w-full h-10 pl-4 pr-10 text-sm rounded-l-full bg-gray-100 dark:bg-[#16181D] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-[#FF2A38] focus:ring-1 focus:ring-[#FF2A38] transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="flex items-center justify-center px-5 h-10 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-700 rounded-r-full text-gray-700 dark:text-gray-200 transition-colors"
              title="Search"
              aria-label="Submit search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Mobile search toggle */}
          <button
            onClick={() => setShowSearchMobile(!showSearchMobile)}
            className="sm:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
            title="Search"
            aria-label="Toggle search input"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Upload Button */}
          <button
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal('login');
              } else {
                onNavigate('upload');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF2A38] hover:bg-[#E51927] text-white font-medium text-xs sm:text-sm shadow-sm transition-all hover:shadow-red-500/20 active:scale-95"
            title="Upload Video"
          >
            <VideoIcon className="w-4 h-4" />
            <span className="hidden md:inline">Upload</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle color theme"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-gray-600" />}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[#FF2A38] rounded-full ring-2 ring-white dark:ring-[#0D0E11]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#16181D] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-[11px] bg-red-100 dark:bg-red-950/60 text-[#FF2A38] font-semibold px-2 py-0.5 rounded-full">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-xs text-[#FF2A38] hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800/60">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-xs">No notifications yet</div>
                  ) : (
                    notifications.slice(0, 6).map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationRead(notif.id);
                          if (notif.link) {
                            onNavigate('watch', { id: notif.link });
                          }
                          setShowNotifMenu(false);
                        }}
                        className={`flex items-start gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors ${
                          !notif.read ? 'bg-red-50/40 dark:bg-red-950/20' : ''
                        }`}
                      >
                        {notif.avatar ? (
                          <img
                            src={notif.avatar}
                            alt=""
                            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                          />
                        ) : notif.thumbnail ? (
                          <img
                            src={notif.thumbnail}
                            alt=""
                            className="w-10 h-8 rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center text-[#FF2A38] flex-shrink-0">
                            <Bell className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                            {notif.title}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">
                            {notif.message}
                          </p>
                          <span className="text-[10px] text-gray-400 mt-1 block">{notif.timestamp}</span>
                        </div>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-[#FF2A38] mt-1.5 flex-shrink-0" />
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-gray-100 dark:border-gray-800 text-center">
                  <button
                    onClick={() => {
                      onNavigate('notifications');
                      setShowNotifMenu(false);
                    }}
                    className="text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-[#FF2A38] transition-colors"
                  >
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth */}
          {isAuthenticated && currentUser ? (
            <div className="relative" ref={userRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-0.5 rounded-full ring-2 ring-transparent hover:ring-[#FF2A38] transition-all"
                title={currentUser.name}
                aria-label="User account menu"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-[#16181D] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  {/* User info banner */}
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.name}
                      className="w-11 h-11 rounded-full object-cover border border-red-500/30"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {currentUser.handle}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        onNavigate('channel', { id: currentUser.id });
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <UserIcon className="w-4 h-4 text-gray-400" />
                      Your Channel Profile
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('dashboard');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-[#FF2A38]" />
                      Creator Studio Dashboard
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('settings');
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-gray-400" />
                      Settings & Storage
                    </button>
                  </div>

                  {/* Switch Demo Personas */}
                  <div className="px-4 py-2 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      Switch Creator Persona
                    </p>
                    <div className="space-y-1">
                      {allUsers.map((user) => (
                        <button
                          key={user.id}
                          onClick={() => {
                            switchDemoUser(user.id);
                            setShowUserMenu(false);
                          }}
                          className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors ${
                            user.id === currentUser.id
                              ? 'bg-red-50 dark:bg-red-950/40 text-[#FF2A38] font-bold'
                              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <img
                              src={user.avatarUrl}
                              alt=""
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="truncate">{user.name}</span>
                          </div>
                          {user.id === currentUser.id && <Check className="w-3.5 h-3.5 text-[#FF2A38]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Log out */}
                  <div className="pt-1 border-t border-gray-100 dark:border-gray-800">
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 dark:border-gray-700 hover:border-[#FF2A38] text-gray-700 dark:text-gray-200 hover:text-[#FF2A38] text-xs sm:text-sm font-semibold transition-all"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile search bar expands when clicked */}
      {showSearchMobile && (
        <div className="sm:hidden px-3 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#121418]">
          <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search videos, creators..."
              className="w-full h-9 pl-3 pr-8 text-xs rounded-l-full bg-white dark:bg-[#16181D] border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:border-[#FF2A38]"
              autoFocus
            />
            <button
              type="submit"
              className="px-4 h-9 bg-gray-200 dark:bg-gray-800 border border-l-0 border-gray-300 dark:border-gray-700 rounded-r-full text-gray-700 dark:text-gray-200"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </header>
  );
};
