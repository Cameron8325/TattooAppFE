// Route guard backed by AuthContext.
//   <ProtectedRoute>...</ProtectedRoute>            → any authenticated user
//   <ProtectedRoute roles={["admin"]}>...</...>     → role-restricted
// Unauthenticated → /login (original destination preserved in state.from).
// Wrong role → /access-denied.
import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { AuthContext } from "../../context/authContext";

const ProtectedRoute = ({ roles, children }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
        <CircularProgress aria-label="Checking authentication" />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
};

export default ProtectedRoute;
