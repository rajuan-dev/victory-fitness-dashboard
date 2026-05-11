import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { clearUserInfo, ensureAdminSession } from "../../services/auth.service";

function RequireAdminAuth({ children }) {
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    let isMounted = true;

    ensureAdminSession()
      .then((allowed) => {
        if (!isMounted) {
          return;
        }

        if (!allowed) {
          clearUserInfo();
        }
        setIsAuthorized(allowed);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }
        clearUserInfo();
        setIsAuthorized(false);
      });

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-slate-600">
        Checking admin session...
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default RequireAdminAuth;
