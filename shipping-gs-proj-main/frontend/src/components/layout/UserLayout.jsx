// // src/components/layout/UserLayout.jsx
// import React, { useState, useEffect } from "react";
// import TopBar from "./TopBar";
// import { useSelector } from "react-redux";
// import { Outlet, useNavigate } from "react-router-dom";

// function UserLayout() {
//   const { user } = useSelector((state) => state.auth);
//   const [balance, setBalance] = useState(0);
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Fetch balance or other data if needed
//     setBalance(user?.balance || 0); // Placeholder for actual balance data
//   }, [user]);

//   const handleEditProfile = () => {
//     navigate("/edit-profile");
//   };

//   return (
//     <div>
//       {/* TopBar as a persistent header */}
//       <TopBar
//         userName={user?.name}
//         balance={balance}
//         onEditProfile={handleEditProfile}
//       />

//       {/* Main content area adjusted for fixed TopBar */}
//       <div className="pt-24 px-4">
//         {" "}
//         {/* Padding-top to offset TopBar */}
//         <Outlet /> {/* Renders the user-specific routes */}
//       </div>
//     </div>
//   );
// }

// export default UserLayout;
