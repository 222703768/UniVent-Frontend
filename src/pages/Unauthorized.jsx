import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Unauthorized() {
  const { getHomePath } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold text-gray-800">403</h1>
      <p className="text-gray-500">You don't have permission to view this page.</p>
      <Link to={getHomePath()} className="text-purple-600 underline">
        Back to Dashboard
      </Link>
    </div>
  );
}