import { createBrowserRouter } from "react-router-dom";
import SignInPage from "../pages/auth/SignInPage";
import ForgetPassword from "../pages/auth/ForgetPassword";
import VerificationCode from "../pages/auth/VerificationCode";
import ResetPassword from "../pages/auth/ResetPassword";
import MainLayout from "../layout/MainLayout";
import DashboardPage from "../pages/dashboard/DashboardPage";
import PrivacyPolicy from "../pages/Privacy Policy/PrivacyPolicy";
import TermsCondition from "../pages/Terms Condition/TermsCondition";
import AboutUs from "../pages/About Us/AboutUs";
import UserDetails from "../pages/userDetails/UserDetails";
import ProfilePage from "../pages/profile/ProfilePage";
import Settings from "../pages/Settings/Settings";
import ChangePass from "../pages/profile/ChangePass";
import EditProfile from "../pages/profile/EditProfile";
import Notifications from "../pages/Notifications/Notifications";
import FAQ from "../pages/FAQ/FAQ";
import Workouts from "../pages/Workouts/Workouts";
import Subscriptions from "../pages/Subscriptions/Subscriptions";
import Challenges from "../pages/Challenges/Challenges";
import Masterclasses from "../pages/Masterclasses/Masterclasses";
import Community from "../pages/Community/Community";
import AllSubscribers from "../pages/Subscribers/AllSubscribers";

const router = createBrowserRouter([
  {
    path: "/sign-in",
    element: <SignInPage />,
  },
  {
    path: "/forget-password",
    element: <ForgetPassword />,
  },
  {
    path: "/verification-code",
    element: <VerificationCode />,
  },
  {
    path: "/new-password",
    element: <ResetPassword />,
  },

  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
      {
        path: "/user-details",
        element: <UserDetails />,
      },
      {
        path: "/workouts",
        element: <Workouts />,
      },
      {
        path: "/subscriptions",
        element: <Subscriptions />,
      },
      {
        path: "/all-subscribers",
        element: <AllSubscribers />,
      },
      {
        path: "/challenges",
        element: <Challenges />,
      },
      {
        path: "/masterclasses",
        element: <Masterclasses />,
      },
      {
        path: "/community",
        element: <Community />,
      },

      // settings
      {
        path: "/about-us",
        element: <AboutUs />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/terms-and-condition",
        element: <TermsCondition />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/edit-profile",
        element: <EditProfile />,
      },
      {
        path: "/change-password",
        element: <ChangePass />,
      },
      {
        path: "/faq",
        element: <FAQ />,
      },

      {
        path: "/notifications",
        element: <Notifications />,
      },
      {
        path: "/profile",
        element: <ProfilePage />,
      },
    ],
  },
]);

export default router;
