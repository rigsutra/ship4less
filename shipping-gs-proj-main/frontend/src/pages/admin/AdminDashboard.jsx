// src/pages/AdminDashboardOverview.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";

import { useNavigate } from "react-router-dom";
const baseUrl = import.meta.env.VITE_BASE_URL;
import { UserPen } from "lucide-react";
import axios from "axios";
import TopBar from "../../components/layout/TopBar";
import { useSelector } from "react-redux";
function AdminDashboard() {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [AllUsers, setAllUsers] = useState([]);
  const [adminName, setAdminName] = useState(""); // State for admin name

  const navigate = useNavigate();
  const {token}=useSelector((state)=>state.auth);

  const EditProfile = () => {
    navigate("/EditProfile");
  };

  useEffect(() => {
    // Fetch total orders and revenue
    const fetchData = async () => {
      const users = await axios.get(`${baseUrl}/api/getusers`);
      setAllUsers(users?.data);
      const ordersResponse = await axios.get(`${baseUrl}/api/getAllOrdersdomestic`,{
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      const ordersData = await ordersResponse.json();
      const uspsResponse = await axios.get(`${baseUrl}/api/uspsorderdomestic`);
      const uspsData = await uspsResponse.json();
      // const usersData = await users.json();

      setTotalOrders(ordersData.length + uspsData.length);
      setTotalRevenue(
        [...ordersData, ...uspsData].reduce(
          (acc, order) => acc + parseFloat(order.price || 0),
          0
        )
      );
    };

    fetchData();
  }, []);

  return (
    <div className="pb-10 h-screen ">
      <TopBar title={"Dashboard"}></TopBar>
      <Box className="mx-3 mt-3">
        <SimpleGrid columns={2} spacing={10}>
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
            <Stat>
              <StatLabel>Total Orders</StatLabel>
              <StatNumber>{totalOrders}</StatNumber>
            </Stat>
          </Box>
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
            <Stat>
              <StatLabel>Total Revenue</StatLabel>
              <StatNumber>${totalRevenue.toFixed(2)}</StatNumber>
            </Stat>
          </Box>
        </SimpleGrid>
      </Box>

      <Box className="mx-3 mt-3">
        <SimpleGrid columns={2} spacing={10}>
          <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
            <Stat>
              <StatLabel>Users</StatLabel>
              <StatNumber>${totalRevenue.toFixed(2)}</StatNumber>
              <Text>Total Users: {AllUsers.length}</Text>
              {/* Display total users */}
              <Box p={5} shadow="md" borderWidth="1px" borderRadius="md">
                {AllUsers.map((user) => (
                  <Box key={user._id}>
                    <Text>{user.name}</Text>
                  </Box>
                ))}
              </Box>
            </Stat>
          </Box>
        </SimpleGrid>
      </Box>
    </div>
  );
}

export default AdminDashboard;
