/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { VideoProvider, useVideos } from './context/VideoContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { AuthModal } from './components/common/AuthModal';
import { ShareModal } from './components/common/ShareModal';
import { ReportModal } from './components/common/ReportModal';
import { Video } from './types';

// Pages
import { HomePage } from './pages/HomePage';
import { WatchPage } from './pages/WatchPage';
import { ShortsPage } from './pages/ShortsPage';
import { UploadPage } from './pages/UploadPage';
import { CreatorProfilePage } from './pages/CreatorProfilePage';
import { CreatorDashboardPage } from './pages/CreatorDashboardPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { LibraryPage } from './pages/LibraryPage';
import { SettingsPage } from './pages/SettingsPage';
import { LegalPage } from './pages/LegalPage';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [pageParams, setPageParams] = useState<any>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Global modals triggered from video cards
  const [modalVideo, setModalVideo] = useState<Video | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Responsive sidebar collapse on smaller screens
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handleNavigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectVideo = (video: Video) => {
    if (video.isShort) {
      handleNavigate('shorts', { id: video.id });
    } else {
      handleNavigate('watch', { id: video.id });
    }
  };

  const handleOpenCreator = (creatorId: string) => {
    handleNavigate('channel', { id: creatorId });
  };

  const handleShareVideo = (video: Video) => {
    setModalVideo(video);
    setIsShareModalOpen(true);
  };

  const handleReportVideo = (video: Video) => {
    setModalVideo(video);
    setIsReportModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0D0E11] text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors selection:bg-[#FF2A38] selection:text-white">
      {/* Top Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex w-full">
        <Sidebar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          isOpen={isSidebarOpen}
          onCloseMobile={() => setIsSidebarOpen(false)}
        />

        {/* Page Content Container */}
        <main
          className={`flex-1 min-w-0 px-3 sm:px-6 md:px-8 pt-4 md:pt-6 transition-all ${
            currentPage === 'shorts' ? 'p-0 sm:p-2' : ''
          }`}
        >
          {currentPage === 'home' && (
            <HomePage
              onSelectVideo={handleSelectVideo}
              onOpenCreator={handleOpenCreator}
              onShareVideo={handleShareVideo}
              onReportVideo={handleReportVideo}
            />
          )}

          {currentPage === 'watch' && (
            <WatchPage
              videoId={pageParams.id || 'vid_1'}
              onSelectVideo={handleSelectVideo}
              onOpenCreator={handleOpenCreator}
            />
          )}

          {currentPage === 'shorts' && (
            <ShortsPage onOpenCreator={handleOpenCreator} />
          )}

          {currentPage === 'upload' && (
            <UploadPage onNavigate={handleNavigate} />
          )}

          {currentPage === 'channel' && (
            <CreatorProfilePage
              creatorId={pageParams.id || 'user_alex'}
              onSelectVideo={handleSelectVideo}
              onNavigate={handleNavigate}
              onShareVideo={handleShareVideo}
              onReportVideo={handleReportVideo}
            />
          )}

          {currentPage === 'dashboard' && (
            <CreatorDashboardPage onNavigate={handleNavigate} />
          )}

          {currentPage === 'search' && (
            <SearchResultsPage
              query={pageParams.q || ''}
              onSelectVideo={handleSelectVideo}
              onOpenCreator={handleOpenCreator}
              onShareVideo={handleShareVideo}
              onReportVideo={handleReportVideo}
            />
          )}

          {currentPage === 'subscriptions' && (
            <SubscriptionsPage
              onSelectVideo={handleSelectVideo}
              onOpenCreator={handleOpenCreator}
              onNavigate={handleNavigate}
              onShareVideo={handleShareVideo}
              onReportVideo={handleReportVideo}
            />
          )}

          {currentPage === 'notifications' && (
            <NotificationsPage onNavigate={handleNavigate} />
          )}

          {currentPage === 'library' && (
            <LibraryPage
              onSelectVideo={handleSelectVideo}
              onOpenCreator={handleOpenCreator}
              onNavigate={handleNavigate}
              onShareVideo={handleShareVideo}
              onReportVideo={handleReportVideo}
            />
          )}

          {currentPage === 'settings' && <SettingsPage />}

          {currentPage === 'terms' && <LegalPage />}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Global Modals */}
      <AuthModal />

      {modalVideo && (
        <>
          <ShareModal
            video={modalVideo}
            isOpen={isShareModalOpen}
            onClose={() => {
              setIsShareModalOpen(false);
              setModalVideo(null);
            }}
          />
          <ReportModal
            video={modalVideo}
            isOpen={isReportModalOpen}
            onClose={() => {
              setIsReportModalOpen(false);
              setModalVideo(null);
            }}
          />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <VideoProvider>
          <AppContent />
        </VideoProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
