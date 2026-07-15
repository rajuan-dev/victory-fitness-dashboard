import { useState, useEffect } from "react";
import Sidebar from "../shared/Sidebar/Sidebar";
import MainHeader from "../shared/MainHeader/MainHeader";
import { Outlet, useLocation } from "react-router-dom";
import RequireAdminAuth from "../components/RequireAdminAuth";

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Close sidebar when route changes (for mobile)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Set initial state based on screen size
    handleResize();

    // Add event listener for window resize
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-slate-100">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          aria-label="Close sidebar overlay"
        />
      )}


      {/* Sidebar - Fixed on mobile with animation, static on desktop */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content - Takes full width on mobile */}
      <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <div className="shrink-0">
          <MainHeader toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        </div>
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-4 lg:p-6">
          <div className="bg-white rounded-lg shadow-sm min-h-[calc(100vh-6rem)] sm:min-h-[calc(100vh-2rem)] p-3 sm:p-4 lg:p-6">
            <RequireAdminAuth>
              <Outlet />
            </RequireAdminAuth>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
