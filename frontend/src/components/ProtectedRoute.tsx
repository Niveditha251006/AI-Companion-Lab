import { Navigate } from "react-router-dom";
import Navbar from "./Navbar";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isLoggedIn = localStorage.getItem("isLoggedIn");

  if (isLoggedIn !== "true") {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />

      {children}
    </>
  );
}

export default ProtectedRoute;