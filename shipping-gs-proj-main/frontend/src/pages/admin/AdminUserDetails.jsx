import React, { useEffect, useState } from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Spinner,
  Input,
  HStack,
} from "@chakra-ui/react";
import axios from "axios";
import { useSelector } from "react-redux";
import TopBar from "../../components/layout/TopBar";

const baseUrl = import.meta.env.VITE_BASE_URL;

function UserTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = useSelector((state) => state.auth);

  // Fetch users and their total orders
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.post(
          `${baseUrl}/api/getusers`,
          {}, // Empty body for POST request
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const usersWithOrders = await Promise.all(
          response.data.map(async (user) => {
            const ordersResponseDomestic = await axios.get(
              `${baseUrl}/api/getAllOrdersdomestic/${user._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const ordersResponseInternational = await axios.get(
              `${baseUrl}/api/getAllOrdersinternational/${user._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const ordersResponseUps = await axios.get(
              `${baseUrl}/api/upsAllorders/${user._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const ordersResponseDhl = await axios.get(
              `${baseUrl}/api/dhlAllorders/${user._id}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            const totalOrders =
              ordersResponseDomestic.data.totalOrderCount +
              ordersResponseInternational.data.totalOrderCount +
              ordersResponseUps.data.totalOrderCount +
              ordersResponseDhl.data.totalOrderCount;
            return { ...user, totalOrders: totalOrders };
          })
        );

        setUsers(usersWithOrders);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching users or orders:", error);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  // Filter users based on the search term
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-100vh">
      <TopBar title={"User List"}></TopBar>
      <Box p={4} bg="gray.50" minH="100vh">
        {/* Search Bar */}
        <HStack mb={4}>
          <Input
            placeholder="Search by username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            width="300px"
          />
        </HStack>

        {loading ? (
          <Spinner size="xl" />
        ) : (
          <TableContainer border="1px solid" borderColor="gray.200" borderRadius="md" bg="white">
            <Table variant="simple">
              <Thead bg="gray.100">
                <Tr>
                  <Th>#</Th>
                  <Th>Username</Th>
                  <Th>Created Date</Th>
                  <Th>Total Orders</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUsers.map((user, index) => (
                  <Tr key={user._id}>
                    <Td>{index + 1}</Td>
                    <Td>{user.name}</Td>
                    <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                    <Td>{user.totalOrders}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </div>
  );
}

export default UserTable;
