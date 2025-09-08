import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-3">
        <h1 className="text-6xl font-extrabold tracking-tight">404</h1>
        <p className="text-muted-foreground">Oops! Page not found</p>
        <Link to="/" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
          Go home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
