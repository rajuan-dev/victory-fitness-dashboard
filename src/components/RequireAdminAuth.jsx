import { Navigate, useLocation } from "react-router-dom";
import { clearUserInfo, hasAdminAccess } from "../../services/auth.service";

function RequireAdminAuth({ children }) {
  const location = useLocation();

  if (!hasAdminAccess()) {
    clearUserInfo();
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  return children;
}

export default RequireAdminAuth;
