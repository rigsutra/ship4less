import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  Box,
  Text,
  VStack,
  HStack,
  Heading,
  Input,
  Button,
  Spinner,
  Divider,
} from "@chakra-ui/react";

const baseUrl = import.meta.env.VITE_BASE_URL;

const AdminRevenue = () => {
  const [AllUsers, setAllUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [transactions, setTransactions] = useState([]);
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const users = await axios.post(
          `${baseUrl}/api/getusers`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAllUsers(users.data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Error fetching users.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/transactions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Transactions response:", response.data);

        // Corrected: transactions are in response.data.transaction
        const fetchedTransactions = Array.isArray(response.data.transaction)
          ? response.data.transaction
          : [];
        setTransactions(fetchedTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setTransactions([]);
      }
    };
    fetchTransactions();
  }, [token]);

  const filteredUsers = AllUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedUsers = filteredUsers.slice(0, 5);

  const handleAddAmountClick = (userId) => {
    setEditingUserId(userId);
    setAmount("");
    setMessage("");
    setError("");
  };

  const handleConfirmAddAmount = async (userId) => {
    setMessage("");
    setError("");

    if (!amount || amount <= 0) {
      setError("Please provide a valid amount.");
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/add-balance`,
        { userId, amount: Number(amount) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditingUserId(null);
      setAmount("");
      setMessage(
        `Successfully added $${response.data.transaction.amount} to ${userId}. New balance: $${response.data.balance}`
      );

      // Refetch transactions after adding balance
      const updatedResponse = await axios.get(`${baseUrl}/api/transactions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedTransactions = Array.isArray(
        updatedResponse.data.transaction
      )
        ? updatedResponse.data.transaction
        : [];
      setTransactions(updatedTransactions);
    } catch (err) {
      console.error("Error adding balance:", err);
      setError(
        err.response?.data?.message || "An error occurred while adding balance."
      );
    }
  };

  const transactionsWithUserName = Array.isArray(transactions)
    ? transactions.map((t) => {
        const user = AllUsers.find((u) => u._id === t.userId);
        return {
          ...t,
          userName: user ? user.name : "Unknown User",
        };
      })
    : [];

  return (
    <Box bg="gray.50" minH="100vh" p={4}>
      <Heading size="lg" mb={4}>
        Add Balance to Users
      </Heading>
      <Input
        placeholder="Search users by name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        mb={4}
      />

      {message && (
        <Text color="green.600" mb={4}>
          {message}
        </Text>
      )}
      {error && (
        <Text color="red.600" mb={4}>
          {error}
        </Text>
      )}

      {isLoading ? (
        <Spinner size="xl" />
      ) : (
        <VStack
          spacing={4}
          align="stretch"
          maxH="300px"
          overflowY="auto"
          mb={8}
        >
          {displayedUsers.map((user) => (
            <HStack
              key={user._id}
              bg="white"
              p={4}
              borderRadius="lg"
              spacing={4}
              shadow="sm"
              align="center"
              justify="space-between"
            >
              <Text fontSize="lg">{user.name}</Text>
              {editingUserId === user._id ? (
                <HStack spacing={2}>
                  <Input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    width="100px"
                  />
                  <Button
                    colorScheme="blue"
                    onClick={() => handleConfirmAddAmount(user._id)}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setEditingUserId(null)}
                  >
                    Cancel
                  </Button>
                </HStack>
              ) : (
                <Button
                  colorScheme="blue"
                  onClick={() => handleAddAmountClick(user._id)}
                >
                  Add Amount
                </Button>
              )}
            </HStack>
          ))}
          {filteredUsers.length > 5 && (
            <Text fontSize="sm" color="gray.600">
              Showing only the first 5 matches. Refine your search to see
              others.
            </Text>
          )}
        </VStack>
      )}

      <Divider mb={8} />

      <Heading size="md" mb={4}>
        Transaction History
      </Heading>
      <VStack spacing={4} align="stretch" maxH="300px" overflowY="auto">
        {transactionsWithUserName.map((txn) => (
          <HStack
            key={txn._id}
            bg="white"
            p={4}
            borderRadius="lg"
            spacing={4}
            shadow="sm"
            align="center"
            justify="space-between"
          >
            <Text fontSize="md">{txn.userName}</Text>
            <Text fontSize="md">Amount: ${txn.amount}</Text>
            <Text fontSize="sm" color="gray.600">
              {new Date(txn.createdAt).toLocaleString()}
            </Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default AdminRevenue;
