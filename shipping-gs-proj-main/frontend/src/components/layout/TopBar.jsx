import { useEffect, useState } from "react";
import { Button, Menu } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import React from "react";
import logo from "../../assets/logomain1.png"

const TopBar = ({ title }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Fetch admin name
  useEffect(() => {
    // Retrieve the user data from sessionStorage
    const storedUser = sessionStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user data", error);
      }
    }
  }, []);

  // Handlers
  const handleProfile = () => {
    navigate("/Profile");
  };

  const handleCreateAdmin = () => {
    navigate("/CreateAdmin"); // Navigate to the "Create Admin" page
  };

  return (

    <div className="sticky top-0 z-[100]">
      <div className=" flex px-5  py-5 items-center justify-between bg-blue-400 h-full">
        <h2 className="text-heading2-bold">{title}</h2>
        <img src={logo} className="w-[200px] h-30">
        </img>
        <div className="flex gap-3 items-center">
          {/* Display admin/user name */}
          <p className="mr-3">{user?.name || "Loading..."}</p>
          <Button
            borderRadius="50%"
            height="55px"
            width="55px"
            className="flex"
            borderColor="gray.500"
            border="4px"
            onClick={handleProfile}
          >
            <FaRegUser className="w-full h-full" />
            
          </Button>

          {/* Show "Create Admin" button only for admins */}
          {user?.role === "admin" && (
            <Button
              colorScheme="blue"
              onClick={handleCreateAdmin}
              className="ml-3"
            >
              Create New Admin
            </Button>
          )}
        </div>
      </div>
    </div>

  );
};

export default TopBar;
