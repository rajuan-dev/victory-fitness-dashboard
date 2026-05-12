/* eslint-disable react/prop-types */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoMenu, IoNotificationsOutline } from "react-icons/io5";
import { globalDemoData } from "../../utils/demoData";
import { adminApiRequest, getUserData, storeUserInfo } from "../../../services/auth.service";


const MainHeader = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(getUserData());
  const [isLoading, setIsLoading] = useState(true);
  const notificationData = globalDemoData.notifications;
  const displayName =
    currentUser?.fullName ||
    currentUser?.name ||
    "Admin";
  const displayRole =
    currentUser?.role ||
    "Admin";
  const displayImage =
    currentUser?.profileImage ||
    currentUser?.profile_image ||
    "/userimg.png";

  useEffect(() => {
    let isMounted = true;

    const loadAdminProfile = async () => {
      setIsLoading(true);
      try {
        const response = await adminApiRequest("/admin/me");
        if (!isMounted) {
          return;
        }

        const nextUser = {
          ...getUserData(),
          fullName: response.fullName,
          name: response.fullName,
          role: response.role,
          profileImage: response.profileImage,
          country: response.country,
          contactNumber: response.contactNumber,
          email: response.email,
        };
        storeUserInfo(nextUser);
        setCurrentUser(nextUser);
      } catch {
        if (isMounted) {
          setCurrentUser(getUserData());
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const syncHeaderProfile = () => {
      setCurrentUser(getUserData());
      loadAdminProfile();
    };

    loadAdminProfile();
    window.addEventListener("admin-profile-updated", syncHeaderProfile);

    return () => {
      isMounted = false;
      window.removeEventListener("admin-profile-updated", syncHeaderProfile);
    };
  }, []);

  const notificationCount = notificationData?.filter((item) => !item?.read).length || 0;

  return (
    <div className="relative w-full px-3 sm:px-4 lg:px-5">
      <header className="shadow-sm rounded-lg border border-slate-200 overflow-hidden bg-white">
        <div className="flex items-center px-3 sm:px-5 md:px-10 h-[60px] sm:h-[70px] lg:h-[80px]">
          {/* Left: Hamburger Menu */}
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="md:hidden p-2 rounded-lg hover:bg-blue-50 active:bg-blue-100 focus:outline-none transition-colors duration-200"
          >
            <IoMenu className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
          </button>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Right: Notification & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification */}
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => navigate("/notifications")}
              className="relative p-2 rounded-full border border-blue-600 hover:bg-blue-50 active:bg-blue-100 transition-colors duration-200"
            >
              <IoNotificationsOutline className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              {notificationCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-blue-600 text-white text-[10px] px-1 leading-none font-semibold">
                  {notificationCount}
                </span>
              )}
            </button>

            {/* Profile */}
            <div
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <img
                src={displayImage}
                className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 object-cover rounded-full border-2 border-blue-100"
                alt="User Avatar"
                onError={(e) => {
                  e.target.src = "/userimg.png";
                }}
              />
              <div className="hidden sm:block">
                <h3 className="hidden md:block text-blue-600 text-sm lg:text-base font-semibold leading-tight">
                  {isLoading
                    ? "Loading..."
                    : displayName}
                </h3>
                <p className="text-blue-600 text-xs sm:text-sm lg:text-base font-semibold">
                  {displayRole}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default MainHeader;
