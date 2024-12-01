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
  Input,
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
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [dailyEarnings, setDailyEarnings] = useState(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState(0);
  const [yearlyEarnings, setYearlyEarnings] = useState(0);

  const EditProfile = () => {
    navigate("/EditProfile");
  };

  useEffect(() => {
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
        const FedexInternationalordersResponse = await axios.get(
          `${baseUrl}/api/getAllOrdersInternationalAdmin`,
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
        const dhlResponse = await axios.get(`${baseUrl}/api/dhlordersAdmin`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const FedexDomesticordersData = FedexDomesticordersResponse.data;
        const FedexInternationalordersData =
          FedexInternationalordersResponse.data;
        const uspsData = uspsResponse.data;
        const dhlData = dhlResponse.data;

        setTotalOrders(
          FedexDomesticordersData.length +
            uspsData.orders.length +
            FedexInternationalordersData.length +
            dhlData.orders.length
        );

        let fedexDomesticRevenue = 0;
        let fedexInternationalRevenue = 0;
        let upsRevenue = 0;
        let dhlRevenue = 0;

        if (FedexDomesticordersData.length > 0) {
          fedexDomesticRevenue = FedexDomesticordersData.reduce(
            (acc, order) => {
              const numericPrice =
                parseFloat(order.price.replace("$", "")) || 0;
              return acc + numericPrice;
            },
            0
          );
        }
        if (FedexInternationalordersData.length > 0) {
          fedexInternationalRevenue = FedexInternationalordersData.reduce(
            (acc, order) => {
              const numericPrice =
                parseFloat(order.price.replace("$", "")) || 0;
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
        if (dhlData.orders.length > 0) {
          dhlRevenue = dhlData.orders.reduce(
            (acc, order) => acc + parseFloat(order.total_price || 0),
            0
          );
        }
        setTotalRevenue(
          fedexDomesticRevenue +
            upsRevenue +
            fedexInternationalRevenue +
            dhlRevenue
        );
        // Fetch earnings
        const [
          domesticEarnings,
          internationalEarnings,
          upsEarnings,
          dhlEarnings,
        ] = await Promise.all([
          axios.get(`${baseUrl}/api/earningDomestic`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseUrl}/api/earningInternational`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseUrl}/api/earningUPS`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${baseUrl}/api/earningDHL`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setDailyEarnings(
          domesticEarnings.data.dailyEarnings +
            internationalEarnings.data.dailyEarnings +
            upsEarnings.data.dailyEarnings +
            dhlEarnings.data.dailyEarnings
        );
        setMonthlyEarnings(
          domesticEarnings.data.monthlyEarnings +
            internationalEarnings.data.monthlyEarnings +
            upsEarnings.data.monthlyEarnings +
            dhlEarnings.data.monthlyEarnings
        );
        setYearlyEarnings(
          domesticEarnings.data.yearlyEarnings +
            internationalEarnings.data.yearlyEarnings +
            upsEarnings.data.yearlyEarnings +
            dhlEarnings.data.yearlyEarnings
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [token]);

  // Filter users based on the search term
  const filteredUsers = AllUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

          {/* Billing Section: Daily, Monthly, Yearly Earnings */}
          <div className="flex justify-around items-start">
            <div>
              <Box bg="white" p={6} borderRadius="lg" shadow="md">
                <Heading size="md" mb={4}>
                  Billing
                </Heading>
                <SimpleGrid columns={[1, 3]} spacing={6}>
                  <Box bg="white" p={4} borderRadius="lg" shadow="md">
                    <Stat>
                      <StatLabel>Daily Earnings</StatLabel>
                      <StatNumber>${dailyEarnings.toFixed(2)}</StatNumber>
                    </Stat>
                  </Box>
                  <Box bg="white" p={4} borderRadius="lg" shadow="md">
                    <Stat>
                      <StatLabel>Monthly Earnings</StatLabel>
                      <StatNumber>${monthlyEarnings.toFixed(2)}</StatNumber>
                    </Stat>
                  </Box>
                  <Box bg="white" p={4} borderRadius="lg" shadow="md">
                    <Stat>
                      <StatLabel>Yearly Earnings</StatLabel>
                      <StatNumber>${yearlyEarnings.toFixed(2)}</StatNumber>
                    </Stat>
                  </Box>
                </SimpleGrid>
              </Box>
            </div>

            {/* Search Section */}
            <div className="max-w-[50%] w-full ">
              <Box
                bg="white"
                p={6}
                borderRadius="lg"
                shadow="md"
                className="mb-[10px]"
              >
                <Input
                  placeholder="Search users by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Box>

              {/* Users Section */}
              <Box
                bg="white"
                p={6}
                borderRadius="lg"
                shadow="md"
                maxW="1000px"
                mx="auto"
              >
                <Heading size="md" mb={4}>
                  User List
                </Heading>
                <VStack
                  spacing={4}
                  align="stretch"
                  maxH="300px" // Set the maximum height for the scrollable area
                  overflowY="auto"
                >
                  {filteredUsers.map((user) => (
                    <HStack
                      key={user._id}
                      bg="gray.50"
                      p={4}
                      borderRadius="lg"
                      spacing={4}
                      shadow="sm"
                      align="center"
                    >
                      {/* <Avatar size="md" name={user.name} /> */}
                      <Text fontSize="lg">{user.name}</Text>
                      {/* <Button
                    leftIcon={<UserPen />}
                    colorScheme="teal"
                    variant="outline"
                    onClick={EditProfile}
                  >
                    Edit
                  </Button> */}
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </div>
          </div>
        </VStack>
      </Box>
    </div>
  );
}

export default AdminDashboard;
