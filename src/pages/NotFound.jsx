import { Link, useNavigate } from "react-router-dom";
import StatusPage, { primaryAction } from "@/components/shared/StatusPage";
import { useAuth } from "@/hooks/useAuth";

/*
 * FE 53 Not Found.
 * Anonymous users are sent to Login; signed-in users to their own role home.
 * If a signed-in account has an unrecognised role, there is no valid home to send it to,
 * so we offer "Sign out" instead of a link that would bounce back here (no redirect loop).
 */
export default function NotFound() {
  const { isAuthenticated, getHomePath, logout } = useAuth();
  const navigate = useNavigate();
  const signedIn = isAuthenticated();
  const home = getHomePath();
  const hasValidHome = signedIn && home !== "/login";

  return (
    <StatusPage code="404" title="Page not found" message="The page you are looking for does not exist or may have moved.">
      {hasValidHome && <Link to={home} className={primaryAction}>Back to your home</Link>}
      {!signedIn && <Link to="/login" className={primaryAction}>Go to login</Link>}
      {signedIn && !hasValidHome && (
        <button
          type="button"
          onClick={() => {
            logout();
            navigate("/login", { replace: true });
          }}
          className={primaryAction}
        >
          Sign out
        </button>
      )}
    </StatusPage>
  );
}