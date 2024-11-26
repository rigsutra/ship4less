// src/components/auth/AdminProtectRoute.js
import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import PropTypes from 'prop-types';

const AdminProtectRoute = ({ redirectPath = "/login" }) => {
  const { user, loader } = useSelector((state) => state.auth);

  if (loader) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

AdminProtectRoute.propTypes = {
  redirectPath: PropTypes.string,
};

export default AdminProtectRoute;


// const ProtectRoute = ({ redirectPath = "/login" }) => {
//     const { user, loader } = useSelector((state) => state.auth);
  
//     if (loader) {
//       // You can return a loader here if you have one
//       return <div>Loading...</div>; // Or use your <Loader /> component
//     }
  
//     if (!user) {
//       return <Navigate to={redirectPath} replace />;
//     }
  
//     return <Outlet />;
//   };
  
//   export default ProtectRoute;
