import { Link, useNavigate } from "react-router-dom";
import StatusPage, { primaryAction, secondaryAction } from "@/components/shared/StatusPage";
import { useAuth } from "@/hooks/useAuth";

/*
 * FE 53 Unauthorized.
 * Explains the rejection without revealing anything about the protected page.
 * "Go back" uses history, never a fixed redirect, so it cannot create a loop.
 */
export default function Unauthorized() {
  const { isAuthenticated, getHomePath } = useAuth();
  const navigate = useNavigate();
  const signedIn = isAuthenticated();
  const home = getHomePath();

  return (
    <StatusPage
      code="403"
      title="You do not have access"
      message="Your account does not have permission to open this page. If you think this is a mistake, contact the ICT support desk."
    >
      {signedIn && home !== "/login" ? (
        <Link to={home} className={primaryAction}>Back to your home</Link>
      ) : (
        <Link to="/login" className={primaryAction}>Go to login</Link>
      )}
      <button type="button" onClick={() => navigate(-1)} className={secondaryAction}>Go back</button>
    </StatusPage>
  );
}