import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { navLinks } from "../../lib/constants";
import { Menu, X } from "lucide-react";
import { userNotExists } from "../../redux/reducer/auth";
import logo from "../../assets/logomain1.png"
import { Button } from "@chakra-ui/react";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false); // Manage menu state
  const location = useLocation(); // Get the current location (pathname)
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Get dispatch function from Redux

  const { user } = useSelector((state) => state.auth); // Get user data from Redux
  const userRole = user?.role;

  // Filter links based on user role
  const filteredNavLinks = navLinks.filter((link) => link.role === userRole);

  const handleLogout = () => {
    dispatch(userNotExists());
    navigate("/login");
  };
  const handleCreateAdmin = () => {
    navigate("/CreateAdmin"); // Navigate to the "Create Admin" page
  };

  return (
    <header className=" lg:bg-blue-200">
      <div className="sticky top-0 z-[1000] h-screen :bg-blue-200 ">
      <div className="flex items-center justify-between p-4">
        {/* Hamburger Icon for Small Screens */}
        <Menu
          className="text-black w-8 h-8 cursor-pointer lg:hidden"
          onClick={() => setMenuOpen(true)}
        />

        {/* Logo */}
        <div className="items-center lg:flex hidden mx-auto">
          <img
            src={logo}
            alt="logo"
            className="w-[200px] h-30 bg-none rounded-lg"
            
          />
        </div>

        {/* Logout Button for Larger Screens */}
        
      </div>

      {/* Sidebar / Drawer Menu */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-blue-200 w-64 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:relative lg:w-72`}
      >
        {/* Close Icon for Small Screens */}
        <div className="lg:hidden flex justify-end p-4">
          <X
            className="w-8 h-8 cursor-pointer text-black"
            onClick={() => setMenuOpen(false)}
          />
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-6 p-6">
          {filteredNavLinks.map((link) => (
            <Link
              to={link.url}
              key={link.label}
              className={`flex items-center gap-3 text-lg font-medium ${
                location.pathname === link.url
                  ? "text-blue-500"
                  : "text-gray-600 hover:text-blue-500"
              }`}
              onClick={() => setMenuOpen(false)}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}

          {/* Logout Button for Mobile */}
          {user?.role === "admin" && (
            <button
              colorScheme="blue"
              onClick={handleCreateAdmin}
              className=" px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Create New Admin
            </button>
          )}
          <button
            className=" px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            onClick={handleLogout}
          >
            Logout
          </button>
        </nav>
      </div>
      </div>
      {/* Overlay for Small Screens */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 lg:hidden z-40"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}
    </header>
  );
}

export default Header;
