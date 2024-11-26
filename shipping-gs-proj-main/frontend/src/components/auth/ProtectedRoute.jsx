import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

// eslint-disable-next-line react/prop-types
const ProtectRoute = ({ redirectPath = "/login" }) => {
  const { user, loader } = useSelector((state) => state.auth);

  if (loader) {
    // You can return a loader here if you have one
    return <div>Loading...</div>; // Or use your <Loader /> component
  }

  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

export default ProtectRoute;
