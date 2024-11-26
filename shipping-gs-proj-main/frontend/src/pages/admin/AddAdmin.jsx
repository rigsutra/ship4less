import React, { useState } from "react";
import axios from "axios";
import { Button, Input, FormControl, FormLabel, Box, Text } from "@chakra-ui/react";
import toast from "react-hot-toast";
import TopBar from "../../components/layout/TopBar";
import { useSelector } from "react-redux";

const AddAdmin = () => {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Creating admin...");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/addadmin`,
        formData,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`, // JWT token
          },
        }
      );

      if (response.data.success) {
        toast.success("Admin created successfully!", { id: toastId });
        setFormData({ name: "", username: "", password: "" }); // Reset form
      } else {
        toast.error(response.data.message || "Failed to create admin", { id: toastId });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Server error", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen">
      <TopBar title="Create Admin" />
    <Box p={5}>
      <Box mt={5} maxW="500px" mx="auto">
        <form onSubmit={handleSubmit}>
          <FormControl mb={4} isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              type="text"
              name="name"
              placeholder="Enter admin name"
              value={formData.name}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl mb={4} isRequired>
            <FormLabel>Username</FormLabel>
            <Input
              type="text"
              name="username"
              placeholder="Enter admin username"
              value={formData.username}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl mb={4} isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            isFullWidth
            isLoading={isLoading}
          >
            Create Admin
          </Button>
        </form>
      </Box>
    </Box>
    </div>
  );
};

export default AddAdmin;
