/* eslint-disable react/prop-types */
import { Link, useNavigate, useLocation } from "react-router-dom";
import { RxDashboard } from "react-icons/rx";
import { LuUsers } from "react-icons/lu";
import { IoMdSettings } from "react-icons/io";
import { IoCloseSharp, IoLogOutOutline } from "react-icons/io5";
import { MdCardMembership, MdOutlineGroups } from "react-icons/md";
import { FaDumbbell, FaTrophy, FaGraduationCap, FaUsers, FaFileAlt, FaHeadset } from "react-icons/fa";
import { clearUserInfo } from "../../../services/auth.service";


const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const isActive = (path) => currentPath === path;
  const navigate = useNavigate();

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  const handleLogout = () => {
    clearUserInfo();
    localStorage.removeItem("resetToken");
    navigate("/sign-in");
    if (window.innerWidth < 768) {
      toggleSidebar();
    }
  };

  return (
    <div
      className={`bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 h-screen overflow-y-auto z-[60] transition-all duration-500 ease-in-out
        w-[100%] sm:w-[85%] md:w-72 xl:w-80
        ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full shadow-none "}
        fixed top-0 left-0
        md:static md:translate-x-0 md:shadow-xl
        border-r border-slate-200/60
        [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-blue-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-blue-300
      `}
    >
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-blue-100/30 pointer-events-none"></div>

      {/* Close Button (Mobile Only) */}
      <button
        onClick={toggleSidebar}
        className="absolute top-6 right-6 md:hidden text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none p-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-[70]"
        aria-label="Close sidebar"
      >
        <IoCloseSharp className="w-5 h-5" />
      </button>

      {/* Logo Section */}
      <div className="relative flex flex-col justify-center items-center gap-2 px-4 sm:px-6 pt-6 sm:pt-8 pb-4 sm:pb-6">
        <div className="relative"></div>
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            Victory Fitness
          </h2>
          <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1">
            Admin Dashboard
          </p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-4 sm:mx-6 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>

      {/* Sidebar Menu */}
      <nav className="relative mt-4 sm:mt-6 px-3 sm:px-4 pb-28 sm:pb-32">
        {/* Main Navigation Section */}
        <div className="space-y-0.5 sm:space-y-1">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 sm:px-3 mb-2 sm:mb-3">
            Main Menu
          </p>

          {/* Dashboard */}
          <Link to="/" onClick={handleLinkClick}>
            <li
              className={`group flex items-center gap-2 sm:gap-3 cursor-pointer transition-all duration-300 ease-in-out list-none
                ${isActive("/")
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/30 scale-[1.02]"
                  : "text-slate-700 hover:bg-white/70 hover:shadow-md px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl hover:scale-[1.01]"
                }`}
            >
              <RxDashboard
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isActive("/") ? "" : "group-hover:scale-110"}`}
              />
              <p className="text-xs sm:text-sm font-semibold">Dashboard</p>
              {isActive("/") && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              )}
            </li>
          </Link>

          {/* All Users */}
          <Link to="/user-details" onClick={handleLinkClick}>
            <li
              className={`group flex items-center gap-2 sm:gap-3 cursor-pointer transition-all duration-300 ease-in-out list-none
                ${isActive("/user-details")
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/30 scale-[1.02]"
                  : "text-slate-700 hover:bg-white/70 hover:shadow-md px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl hover:scale-[1.01]"
                }`}
            >
              <LuUsers
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isActive("/user-details") ? "" : "group-hover:scale-110"}`}
              />
              <p className="text-xs sm:text-sm font-semibold">All Users</p>
              {isActive("/user-details") && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              )}
            </li>
          </Link>

          {/* Workouts */}
          <Link to="/workouts" onClick={handleLinkClick}>
            <li
              className={`group flex items-center gap-2 sm:gap-3 cursor-pointer transition-all duration-300 ease-in-out list-none
                ${isActive("/workouts")
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/30 scale-[1.02]"
                  : "text-slate-700 hover:bg-white/70 hover:shadow-md px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl hover:scale-[1.01]"
                }`}
            >
              <FaDumbbell
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isActive("/workouts") ? "" : "group-hover:scale-110"}`}
              />
              <p className="text-xs sm:text-sm font-semibold">Workouts</p>
              {isActive("/workouts") && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              )}
            </li>
          </Link>

          {/* Challenges */}
          <Link to="/challenges" onClick={handleLinkClick}>
            <li
              className={`group flex items-center gap-2 sm:gap-3 cursor-pointer transition-all duration-300 ease-in-out list-none
                ${isActive("/challenges")
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/30 scale-[1.02]"
                  : "text-slate-700 hover:bg-white/70 hover:shadow-md px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl hover:scale-[1.01]"
                }`}
            >
              <FaTrophy
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isActive("/challenges") ? "" : "group-hover:scale-110"}`}
              />
              <p className="text-xs sm:text-sm font-semibold">Challenges</p>
              {isActive("/challenges") && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              )}
            </li>
          </Link>

          {/* Masterclasses */}
          <Link to="/masterclasses" onClick={handleLinkClick}>
            <li
              className={`group flex items-center gap-2 sm:gap-3 cursor-pointer transition-all duration-300 ease-in-out list-none
                ${isActive("/masterclasses")
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/30 scale-[1.02]"
                  : "text-slate-700 hover:bg-white/70 hover:shadow-md px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl hover:scale-[1.01]"
                }`}
            >
              <FaGraduationCap
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isActive("/masterclasses") ? "" : "group-hover:scale-110"}`}
              />
              <p className="text-xs sm:text-sm font-semibold">Masterclasses</p>
              {isActive("/masterclasses") && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              )}
            </li>
          </Link>

          {/* Subscriptions */}
          <Link to="/subscriptions" onClick={handleLinkClick}>
            <li
              className={`group flex items-center gap-2 sm:gap-3 cursor-pointer transition-all duration-300 ease-in-out list-none
                ${isActive("/subscriptions")
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/30 scale-[1.02]"
                  : "text-slate-700 hover:bg-white/70 hover:shadow-md px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl hover:scale-[1.01]"
                }`}
            >
              <MdCardMembership
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isActive("/subscriptions") ? "" : "group-hover:scale-110"}`}
              />
              <p className="text-xs sm:text-sm font-semibold">Subscriptions</p>
              {isActive("/subscriptions") && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              )}
            </li>
          </Link>

          {/* All Subscribers */}
          <Link to="/all-subscribers" onClick={handleLinkClick}>
            <li
              className={`group flex items-center gap-2 sm:gap-3 cursor-pointer transition-all duration-300 ease-in-out list-none
                ${isActive("/all-subscribers")
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/30 scale-[1.02]"
                  : "text-slate-700 hover:bg-white/70 hover:shadow-md px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl hover:scale-[1.01]"
                }`}
            >
              <FaUsers
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isActive("/all-subscribers") ? "" : "group-hover:scale-110"}`}
              />
              <p className="text-xs sm:text-sm font-semibold">All Subscriber</p>
              {isActive("/all-subscribers") && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              )}
            </li>
          </Link>

          {/* Community */}
          <Link to="/community" onClick={handleLinkClick}>
            <li
              className={`group flex items-center gap-2 sm:gap-3 cursor-pointer transition-all duration-300 ease-in-out list-none
                ${isActive("/community")
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/30 scale-[1.02]"
                  : "text-slate-700 hover:bg-white/70 hover:shadow-md px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl hover:scale-[1.01]"
                }`}
            >
              <MdOutlineGroups
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isActive("/community") ? "" : "group-hover:scale-110"}`}
              />
              <p className="text-xs sm:text-sm font-semibold">Community</p>
              {isActive("/community") && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              )}
            </li>
          </Link>

          <Link to="/applications" onClick={handleLinkClick}>
            <li
              className={`group flex items-center gap-2 sm:gap-3 cursor-pointer transition-all duration-300 ease-in-out list-none
                ${isActive("/applications")
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/30 scale-[1.02]"
                  : "text-slate-700 hover:bg-white/70 hover:shadow-md px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl hover:scale-[1.01]"
                }`}
            >
              <FaFileAlt
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isActive("/applications") ? "" : "group-hover:scale-110"}`}
              />
              <p className="text-xs sm:text-sm font-semibold">Applications</p>
              {isActive("/applications") && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              )}
            </li>
          </Link>

          <Link to="/support-inbox" onClick={handleLinkClick}>
            <li
              className={`group flex items-center gap-2 sm:gap-3 cursor-pointer transition-all duration-300 ease-in-out list-none
                ${isActive("/support-inbox")
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/30 scale-[1.02]"
                  : "text-slate-700 hover:bg-white/70 hover:shadow-md px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl hover:scale-[1.01]"
                }`}
            >
              <FaHeadset
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isActive("/support-inbox") ? "" : "group-hover:scale-110"}`}
              />
              <p className="text-xs sm:text-sm font-semibold">Help & Support</p>
              {isActive("/support-inbox") && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              )}
            </li>
          </Link>
        </div>

        {/* Divider */}
        <div className="my-4 sm:my-6 mx-2 sm:mx-3 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>

        {/* Settings Section */}
        <div className="space-y-0.5 sm:space-y-1">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 sm:px-3 mb-2 sm:mb-3">
            Administration
          </p>

          {/* Settings */}
          <Link to="/settings" onClick={handleLinkClick}>
            <li
              className={`group flex items-center gap-2 sm:gap-3 cursor-pointer transition-all duration-300 ease-in-out list-none
                ${isActive("/settings")
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl shadow-lg shadow-blue-500/30 scale-[1.02]"
                  : "text-slate-700 hover:bg-white/70 hover:shadow-md px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl hover:scale-[1.01]"
                }`}
            >
              <IoMdSettings
                className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-300 ${isActive("/settings") ? "" : "group-hover:scale-110"}`}
              />
              <p className="text-xs sm:text-sm font-semibold">Settings</p>
              {isActive("/settings") && (
                <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
              )}
            </li>
          </Link>
        </div>
      </nav>

      {/* Logout Button */}
      <div className="sticky bottom-0 left-0 right-0 p-3 sm:p-5 bg-gradient-to-t from-slate-100 to-slate-50 backdrop-blur-sm">
        <button
          onClick={handleLogout}
          className="group flex items-center justify-center gap-2 sm:gap-3 w-full py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg shadow-red-500/30 transition-all duration-300 text-white text-sm sm:text-base font-semibold hover:scale-[1.02] hover:shadow-xl hover:shadow-red-500/40"
        >
          <IoLogOutOutline className="w-4 h-4 sm:w-5 sm:h-5 font-bold transition-transform duration-300 group-hover:translate-x-[-2px]" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
