import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import TopBar from "../../components/layout/TopBar";
const baseUrl = import.meta.env.VITE_BASE_URL;

const UserProfile = () => {
  // State to store user details
  const [user, setUser] = useState({
    username: "",
    name: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const { token } = useSelector((state) => state.auth);
  const [successMessage, setSuccessMessage] = useState("");
   
  console.log("Check token", token);

  useEffect(() => {
    // Fetch user details on component mount
    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/profile`, {
          headers: {
            Authorization: `Bearer ${token}`, // JWT token
          },
        });
        // console.log("profile response", response);
        setUser({
          username: response.data.user.username,
          name: response.data.user.name,
        });
      } catch (err) {
        console.error("Error fetching user profile:", err);
      }
    };

    fetchUserProfile();
  }, []);

  console.log(user.username);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prevState) => ({ ...prevState, [name]: value }));
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (user.newPassword !== user.confirmPassword) {
      setError("New passwords do not match!");
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/updatePassword`,
        {
          oldPassword: user.oldPassword,
          newPassword: user.newPassword,
          confirmPassword: user.confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage(response.data.message);
      setError("");
    } catch (err) {
      setError("Error updating password. Please try again.");
      console.error(err);
    }
  };

  return (
    <div>
      <TopBar title={"Profile"}></TopBar>
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 bg-gray-100">
  <div className="w-full max-w-md sm:max-w-lg lg:max-w-4xl p-6 bg-white rounded-lg shadow-md">
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center text-gray-700 mb-6">
      Profile
    </h1>

    <div className="space-y-4">
      <div>
        <label className="block text-gray-600 font-medium">Username:</label>
        <input
          type="text"
          name="username"
          value={user.username}
          readOnly
          className="mt-2 w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-gray-600 font-medium">Name:</label>
        <input
          type="text"
          name="name"
          value={user.name}
          readOnly
          className="mt-2 w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
        />
      </div>
    </div>

    <h3 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-700 mt-8 mb-4">
      Update Password
    </h3>
    <form onSubmit={handlePasswordUpdate} className="space-y-4">
      <div>
        <label className="block text-gray-600 font-medium">Old Password:</label>
        <input
          type="password"
          name="oldPassword"
          value={user.oldPassword}
          onChange={handleChange}
          required
          className="mt-2 w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-gray-600 font-medium">New Password:</label>
        <input
          type="password"
          name="newPassword"
          value={user.newPassword}
          onChange={handleChange}
          required
          className="mt-2 w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-gray-600 font-medium">Confirm New Password:</label>
        <input
          type="password"
          name="confirmPassword"
          value={user.confirmPassword}
          onChange={handleChange}
          required
          className="mt-2 w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="flex justify-center">
        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Update Password
        </button>
      </div>
    </form>

    {error && <p className="mt-4 text-red-500">{error}</p>}
    {successMessage && (
      <p className="mt-4 text-green-500">{successMessage}</p>
    )}
  </div>
</div>
</div>
  );
};

export default UserProfile;
