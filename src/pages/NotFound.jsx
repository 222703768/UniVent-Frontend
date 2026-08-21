import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function NotFound() {
  const { getHomePath } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold text-gray-800">404</h1>
      <p className="text-gray-500">Page not found.</p>
      <Link to={getHomePath()} className="text-purple-600 underline">
        Back to Dashboard
      </Link>
    </div>
  );
}