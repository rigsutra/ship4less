import { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Header from "./components/layout/Header";
import Loader from "./components/layout/Loader";
import ProtectRoute from "./components/auth/ProtectedRoute";
import AdminProtectRoute from "./components/auth/AdminProtectRoute";

const Home = lazy(() => import("./pages/user/Home"));
const FAQs = lazy(() => import("./pages/user/FAQs"));
const Addresses = lazy(() => import("./pages/user/Addresses"));
const CreateAddresses = lazy(() => import("./pages/user/CreateAddressess"));
const Login = lazy(() => import("./pages/user/Login"));
const NotFound = lazy(() => import("./pages/user/NotFound"));
const UPScreateOrder = lazy(() => import("./pages/user/UPScreateOrder"));
const DHLCreateOrder = lazy(() => import("./pages/user/DHLCreateOrders"));
const FedexOrderListDomastic = lazy(() =>
  import("./pages/user/FedexOrderListDomestic")
);
const CreateFedexOrder = lazy(() => import("./pages/user/CreateFedexOrder"));
const Deposite = lazy(() => import("./pages/user/Deposite"));
import FedexOrderDetails from "./pages/user/FedexOrderDetails";
import DHLOrderDetails from "./pages/user/DHLOrderDetails.jsx";
// import FedexOrderDetailsDomestic from "./pages/user/FedexOrderDetailsDomestic";
// import FedexOrderDetailsInternational from "./pages/user/FedexOrderDetailsInternational";
import OrderDetails from "./pages/user/OrderDetails";

import FedexOrderListinternational from "./pages/user/FedexOrderListinternational";
import UserProfile from "./pages/user/UserProfile";
import TopBar from "./components/layout/TopBar";
import AddAdmin from "./pages/admin/AddAdmin";
import AdminOrderDetailsUps from "./pages/admin/AdminOrderDetailsUPS.jsx";
import AdmimOrderDetailsFedex from "./pages/admin/AdminOrderDetailsFedex";
import AdminUserDetails from "./pages/admin/AdminUserDetails.jsx"

//Admin
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminRevenue = lazy(() => import("./pages/admin/AdminRevenue"));
const AdminFAQs = lazy(() => import("./pages/admin/AdminFAQs"));
// const AdminOrderDetails = lazy(() => import("./pages/admin/AdminOrderDetailsUPS"));

function App() {
  const location = useLocation();
  const { user, loader } = useSelector((state) => state.auth);

  if (loader) {
    return <Loader />;
  }

  return (
    <>
      <div className="flex ">
        {location.pathname !== "/login" && <Header />}
        <div className="flex-grow ">
          <Suspense fallback={<Loader />}>
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={!user ? <Login /> : <Navigate to="/" replace />}
              />

              {/* Admin Protected Routes */}
              <Route element={<AdminProtectRoute />}>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/admin-orders" element={<AdminOrders />} />
                <Route path="/admin-revenue" element={<AdminRevenue />} />
                <Route path="/admin-faqs" element={<AdminFAQs />} />
                <Route
                  path="/admin-ups-order-details/:orderId"
                  element={<AdminOrderDetailsUps />}
                />
                <Route
                  path="/admin-fedex-order-details/:orderId"
                  element={<AdmimOrderDetailsFedex />}
                />
                <Route path="/CreateAdmin" element={<AddAdmin />}></Route>
                <Route path="/userList" element={<AdminUserDetails />}></Route>
              </Route>

              {/* User Protected Routes */}
              <Route element={<ProtectRoute />}>
                <Route path="/" element={<Home />} />
                <Route path="/FAQs" element={<FAQs />} />
                <Route path="/createOrders" element={<UPScreateOrder />} />
                <Route path="/createDHLOrders" element={<DHLCreateOrder />} />
                <Route
                  path="/fedexorders_Domastic"
                  element={<FedexOrderListDomastic />}
                />
                <Route
                  path="/fedexorders_international"
                  element={<FedexOrderListinternational />}
                />

                <Route
                  path="/create-fedex-order"
                  element={<CreateFedexOrder />}
                />
                <Route path="/Deposits" element={<Deposite />} />
                <Route path="/Addresses" element={<Addresses />} />
                <Route path="/CreateAddresses" element={<CreateAddresses />} />
                <Route
                  path="/fedex-order-details/:orderId"
                  element={<FedexOrderDetails />}
                />
                <Route
                  path="/dhl-order-details/:orderId"
                  element={<DHLOrderDetails />}
                />
                <Route
                  path="/usps-order-details/:orderId"
                  element={<OrderDetails />}
                />
                <Route path="/Profile" element={<UserProfile />} />
              </Route>

              {/* Fallback route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </div>

      <Toaster position="bottom-center" />
    </>
  );
}

export default App;
