import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  VStack,
  HStack,
  Avatar,
  Button,
  Heading,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { UserPen } from "lucide-react";
import axios from "axios";
import TopBar from "../../components/layout/TopBar";
import { useSelector } from "react-redux";

const baseUrl = import.meta.env.VITE_BASE_URL;

function AdminDashboard() {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [AllUsers, setAllUsers] = useState([]);
  // const [adminName, setAdminName] = useState(""); // State for admin name

  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  const EditProfile = () => {
    navigate("/EditProfile");
  };

  useEffect(() => {
    // Fetch total orders and revenue
    const fetchData = async () => {
      try {
        const users = await axios.get(`${baseUrl}/api/getusers`);
        setAllUsers(users?.data);

        const FedexDomesticordersResponse = await axios.get(
          `${baseUrl}/api/getAllOrdersdomesticAdmin`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const uspsResponse = await axios.get(`${baseUrl}/api/upsordersAdmin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(users);
        const FedexDomesticordersData = FedexDomesticordersResponse.data;
        const uspsData = uspsResponse.data;
        console.log(FedexDomesticordersData[0].price);
        console.log(uspsData.orders);
        console.log(uspsData.orders[0].total_price);
        setTotalOrders(FedexDomesticordersData.length + uspsData.orders.length);
        // setTotalRevenue(
        //   [...FedexDomesticordersData, ...uspsData.orders].reduce(
        //     (acc, order) => acc + parseFloat(order.price || 0),
        //     0
        //   )
        // );
        console.log(FedexDomesticordersData);
        let fedexDomesticRevenue = 0;
        let upsRevenue = 0;
        if (FedexDomesticordersData.length > 0) {
          fedexDomesticRevenue = FedexDomesticordersData.reduce(
            (acc, order) => {
              const numericPrice =
                parseFloat(order.price.replace("$", "")) || 0; // Remove "$" and parse as a number
              return acc + numericPrice;
            },
            0
          );
        }
        if (uspsData.orders.length > 0) {
          upsRevenue = uspsData.orders.reduce(
            (acc, order) => acc + parseFloat(order.total_price || 0),
            0
          );
        }
        setTotalRevenue(fedexDomesticRevenue + upsRevenue);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [token]);

  return (
    <div>
      <TopBar title={"Dashboard"} />
      <Box bg="gray.50" minH="100vh" p={4}>
        <VStack spacing={6} align="stretch">
          {/* Metrics Section */}
          <SimpleGrid columns={[1, 2, 3]} spacing={6}>
            <Box
              bg="white"
              p={6}
              borderRadius="lg"
              shadow="md"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Stat>
                <StatLabel fontWeight="bold" color="gray.600">
                  Total Orders
                </StatLabel>
                <StatNumber fontSize="2xl">{totalOrders}</StatNumber>
              </Stat>
            </Box>
            <Box
              bg="white"
              p={6}
              borderRadius="lg"
              shadow="md"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Stat>
                <StatLabel fontWeight="bold" color="gray.600">
                  Total Revenue
                </StatLabel>
                <StatNumber fontSize="2xl">
                  ${totalRevenue.toFixed(2)}
                </StatNumber>
              </Stat>
            </Box>
            <Box
              bg="white"
              p={6}
              borderRadius="lg"
              shadow="md"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Stat>
                <StatLabel fontWeight="bold" color="gray.600">
                  Total Users
                </StatLabel>
                <StatNumber fontSize="2xl">{AllUsers.length}</StatNumber>
              </Stat>
            </Box>
          </SimpleGrid>

          {/* Users Section */}
          <Box bg="white" p={6} borderRadius="lg" shadow="md">
            <Heading size="md" mb={4}>
              User List
            </Heading>
            <VStack spacing={4} align="stretch">
              {AllUsers.map((user) => (
                <HStack
                  key={user._id}
                  p={4}
                  borderWidth="1px"
                  borderRadius="md"
                  bg="gray.100"
                  borderColor="gray.300"
                  justify="space-between"
                >
                  <HStack>
                    <Avatar
                      name={user.name}
                      size="sm"
                      bg="teal.500"
                      color="white"
                    />
                    <Text fontWeight="medium">{user.name}</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.500">
                    {user.email}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </Box>

          {/* Admin Profile Section */}
          {/* <Box bg="white" p={6} borderRadius="lg" shadow="md">
            <HStack justify="space-between">
              <Box>
                <Heading size="md">Admin Profile</Heading>
                <Text color="gray.500">Name: {adminName || "Admin"}</Text>
              </Box>
              <Button
                leftIcon={<UserPen size={16} />}
                colorScheme="teal"
                onClick={EditProfile}
              >
                Edit Profile
              </Button>
            </HStack>
          </Box> */}
        </VStack>
      </Box>
    </div>
  );
}

export default AdminDashboard;
