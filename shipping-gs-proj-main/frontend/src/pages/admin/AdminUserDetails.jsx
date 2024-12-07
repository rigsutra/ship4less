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
  VStack,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  NumberInput,
  NumberInputField,
  useToast, // Import the useToast hook
} from "@chakra-ui/react";
import axios from "axios";
import { useSelector } from "react-redux";
import TopBar from "../../components/layout/TopBar";

const baseUrl = import.meta.env.VITE_BASE_URL;

function UserTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [emailSearchTerm, setEmailSearchTerm] = useState("");
  const { token } = useSelector((state) => state.auth);

  const { isOpen, onOpen, onClose } = useDisclosure(); // Chakra UI modal hooks
  const [selectedUser, setSelectedUser] = useState(null); // To track which user is being edited
  const [balanceAmount, setBalanceAmount] = useState(0); // Amount to add
  const toast = useToast(); // Initialize the toast hook

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.post(
          `${baseUrl}/api/getusers`,
          {},
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

  const handleAddBalance = async () => {
    try {
      const response = await axios.post(
        `${baseUrl}/api/add-balance`,
        { userId: selectedUser._id, amount: balanceAmount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Balance Updated",
        description: response.data.message,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setBalanceAmount(0);
      setSelectedUser(null);
      onClose();
    } catch (error) {
      console.error("Error adding balance:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add balance",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const filteredUsers = users.filter((user) =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-100vh">
      <TopBar title={"User List"} />
      <Box p={4} bg="gray.50" minH="100vh">
        <VStack spacing={4} align="start">
          <Input
            placeholder="Search by username"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            width="300px"
          />
          <Input
            placeholder="Search by email"
            value={emailSearchTerm}
            onChange={(e) => setEmailSearchTerm(e.target.value)}
            width="300px"
          />
        </VStack>

        {loading ? (
          <Spinner size="xl" />
        ) : (
          <TableContainer
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            bg="white"
          >
            <Table variant="simple">
              <Thead bg="gray.100">
                <Tr>
                  <Th>#</Th>
                  <Th>Username</Th>
                  <Th>Email</Th>
                  <Th>Created Date</Th>
                  <Th>Total Orders</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUsers.map((user, index) => (
                  <Tr key={user._id}>
                    <Td>{index + 1}</Td>
                    <Td>{user.name}</Td>
                    <Td>{user.email}</Td>
                    <Td>{new Date(user.createdAt).toLocaleDateString()}</Td>
                    <Td>{user.totalOrders}</Td>
                    <Td>
                      <Button
                        size="sm"
                        colorScheme="blue"
                        onClick={() => {
                          setSelectedUser(user);
                          onOpen();
                        }}
                      >
                        Add Balance
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        )}

        {/* Modal for adding balance */}
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add Balance</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <p>Adding balance for: {selectedUser?.name}</p>
                <NumberInput
                  value={balanceAmount}
                  onChange={(valueString) =>
                    setBalanceAmount(Number(valueString))
                  }
                  min={0}
                >
                  <NumberInputField placeholder="Enter amount" />
                </NumberInput>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={handleAddBalance}>
                Add Balance
              </Button>
              <Button variant="ghost" onClick={onClose} ml={3}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </div>
  );
}

export default UserTable;
