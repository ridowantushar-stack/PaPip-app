import React from 'react';
import { Home, Flame, Plus, Tv, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileBottomNavProps {
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentPage,
  onNavigate,
}) => {
  const { currentUser, isAuthenticated, openAuthModal } = useAuth();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0D0E11]/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 transition-colors">
      <div className="flex items-center justify-around h-14 px-2">
        {/* Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            currentPage === 'home'
              ? 'text-[#FF2A38] font-bold'
              : 'text-gray-500 dark:text-gray-400'
          }`}
          aria-label="Home"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Home</span>
        </button>

        {/* Shorts */}
        <button
          onClick={() => onNavigate('shorts')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            currentPage === 'shorts'
              ? 'text-[#FF2A38] font-bold'
              : 'text-gray-500 dark:text-gray-400'
          }`}
          aria-label="Shorts"
        >
          <Flame className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Shorts</span>
        </button>

        {/* Upload Button (Hero Pill) */}
        <div className="flex items-center justify-center flex-1">
          <button
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal('login');
              } else {
                onNavigate('upload');
              }
            }}
            className="flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-tr from-[#C91420] to-[#FF3B48] text-white shadow-lg shadow-red-500/30 active:scale-95 transition-transform"
            title="Upload"
            aria-label="Upload Video"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Subscriptions */}
        <button
          onClick={() => onNavigate('subscriptions')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            currentPage === 'subscriptions'
              ? 'text-[#FF2A38] font-bold'
              : 'text-gray-500 dark:text-gray-400'
          }`}
          aria-label="Subscriptions"
        >
          <Tv className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Subs</span>
        </button>

        {/* You / Profile */}
        <button
          onClick={() => {
            if (currentUser) {
              onNavigate('channel', { id: currentUser.id });
            } else {
              openAuthModal('login');
            }
          }}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            currentPage === 'channel' || currentPage === 'library'
              ? 'text-[#FF2A38] font-bold'
              : 'text-gray-500 dark:text-gray-400'
          }`}
          aria-label="Profile and Library"
        >
          {currentUser ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className={`w-5 h-5 rounded-full object-cover ${
                currentPage === 'channel' ? 'ring-2 ring-[#FF2A38]' : ''
              }`}
            />
          ) : (
            <UserIcon className="w-5 h-5" />
          )}
          <span className="text-[10px] mt-0.5">You</span>
        </button>
      </div>
    </nav>
  );
};
