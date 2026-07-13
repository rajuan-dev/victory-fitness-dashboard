import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";

const SignInPage = lazy(() => import("../pages/auth/SignInPage"));
const ForgetPassword = lazy(() => import("../pages/auth/ForgetPassword"));
const VerificationCode = lazy(() => import("../pages/auth/VerificationCode"));
const ResetPassword = lazy(() => import("../pages/auth/ResetPassword"));
const MainLayout = lazy(() => import("../layout/MainLayout"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const PrivacyPolicy = lazy(() => import("../pages/Privacy Policy/PrivacyPolicy"));
const TermsCondition = lazy(() => import("../pages/Terms Condition/TermsCondition"));
const AboutUs = lazy(() => import("../pages/About Us/AboutUs"));
const UserDetails = lazy(() => import("../pages/userDetails/UserDetails"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));
const Settings = lazy(() => import("../pages/Settings/Settings"));
const ChangePass = lazy(() => import("../pages/profile/ChangePass"));
const EditProfile = lazy(() => import("../pages/profile/EditProfile"));
const Notifications = lazy(() => import("../pages/Notifications/Notifications"));
const FAQ = lazy(() => import("../pages/FAQ/FAQ"));
const Workouts = lazy(() => import("../pages/Workouts/Workouts"));
const Subscriptions = lazy(() => import("../pages/Subscriptions/Subscriptions"));
const Challenges = lazy(() => import("../pages/Challenges/Challenges"));
const Masterclasses = lazy(() => import("../pages/Masterclasses/Masterclasses"));
const Community = lazy(() => import("../pages/Community/Community"));
const AllSubscribers = lazy(() => import("../pages/Subscribers/AllSubscribers"));
const Applications = lazy(() => import("../pages/Applications/Applications"));
const SupportInbox = lazy(() => import("../pages/SupportInbox/SupportInbox"));
const Homepage = lazy(() => import("../pages/Homepage/Homepage"));
const TrialAnalytics = lazy(() => import("../pages/TrialAnalytics/TrialAnalytics"));

function RouteFallback() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-3">
        <div className="h-8 w-64 rounded-xl bg-slate-200" />
        <div className="h-4 w-80 rounded-lg bg-slate-100" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-32 rounded-2xl border border-slate-200 bg-slate-100" />
        ))}
      </div>
      <div className="h-80 rounded-2xl border border-slate-200 bg-slate-100" />
    </div>
  );
}

const withSuspense = (Component) => (
  <Suspense fallback={<RouteFallback />}>
    <Component />
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/sign-in",
    element: withSuspense(SignInPage),
  },
  {
    path: "/forget-password",
    element: withSuspense(ForgetPassword),
  },
  {
    path: "/verification-code",
    element: withSuspense(VerificationCode),
  },
  {
    path: "/new-password",
    element: withSuspense(ResetPassword),
  },

  {
    path: "/",
    element: withSuspense(MainLayout),
    children: [
      {
        path: "/",
        element: withSuspense(DashboardPage),
      },
      {
        path: "/user-details",
        element: withSuspense(UserDetails),
      },
      {
        path: "/workouts",
        element: withSuspense(Workouts),
      },
      {
        path: "/subscriptions",
        element: withSuspense(Subscriptions),
      },
      {
        path: "/all-subscribers",
        element: withSuspense(AllSubscribers),
      },
      {
        path: "/challenges",
        element: withSuspense(Challenges),
      },
      {
        path: "/masterclasses",
        element: withSuspense(Masterclasses),
      },
      {
        path: "/community",
        element: withSuspense(Community),
      },
      {
        path: "/applications",
        element: withSuspense(Applications),
      },
      {
        path: "/support-inbox",
        element: withSuspense(SupportInbox),
      },
      {
        path: "/homepage",
        element: withSuspense(Homepage),
      },
      {
        path: "/trial-analytics",
        element: withSuspense(TrialAnalytics),
      },

      // settings
      {
        path: "/about-us",
        element: withSuspense(AboutUs),
      },
      {
        path: "/privacy-policy",
        element: withSuspense(PrivacyPolicy),
      },
      {
        path: "/terms-and-condition",
        element: withSuspense(TermsCondition),
      },
      {
        path: "/settings",
        element: withSuspense(Settings),
      },
      {
        path: "/edit-profile",
        element: withSuspense(EditProfile),
      },
      {
        path: "/change-password",
        element: withSuspense(ChangePass),
      },
      {
        path: "/faq",
        element: withSuspense(FAQ),
      },

      {
        path: "/notifications",
        element: withSuspense(Notifications),
      },
      {
        path: "/profile",
        element: withSuspense(ProfilePage),
      },
    ],
  },
]);

export default router;
