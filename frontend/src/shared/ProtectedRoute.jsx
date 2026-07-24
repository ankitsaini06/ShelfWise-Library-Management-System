import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { protectedRouteStyles as s } from "../dummyStyles";
import { useAuth } from "./AuthContext";

const ProtectedRoute = ({ allowedRole }) => {
  const { currentUser, ready } = useAuth();
  const location = useLocation();

  // Wait until auth is initialized
  if (!ready) {
    console.log("Protected Route: Auth not ready yet");

    return (
      <div className={s.loadingContainer}>
        <div className={s.loadingCard}>
          Loading your library workspace...
        </div>
      </div>
    );
  }

  // User not logged in
  if (!currentUser) {
    console.warn("Protected Route: User not logged in");

    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  console.log(
    "Protected Route: CurrentUser:",
    currentUser.role,
    "AllowedRole:",
    allowedRole
  );

  // Wrong role
  if (allowedRole && currentUser.role !== allowedRole) {
  console.warn("Protected Route: Role mismatch! Redirecting...");

  return (
    <Navigate
      to={
        currentUser.role === "admin"
          ? "/admin/dashboard"
          : "/user/dashboard"
      }
      replace
    />
  );
}
  console.log("Protected Route: Access Granted");

  return <Outlet />;
};

export default ProtectedRoute;