import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useLocation } from "react-router-dom";
import {
  Box,
  Heading,
  Text,
  Spinner,
  Input,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Tooltip,
} from "@chakra-ui/react";
import { CopyIcon } from "@chakra-ui/icons";
import TopBar from "../../components/layout/TopBar";

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [payCurrency, setPayCurrency] = useState(""); // Payment cryptocurrency
  const [currencies, setCurrencies] = useState([]);
  const [estimatedAmount, setEstimatedAmount] = useState(null);
  const [loadingEstimate, setLoadingEstimate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useSelector((state) => state.auth);
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const location = useLocation();

  const allowedCurrencies = [
    { name: "USDT (TRC20)", code: "TRX" },
    { name: "USDT (BEP20)", code: "BEP" },
    { name: "BTC", code: "BTC" },
    { name: "LTC", code: "LTC" },
    { name: "ETH", code: "ETH" },
  ];

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
    setCurrencies(allowedCurrencies);
    setPayCurrency(allowedCurrencies[0].code); // Set default to first allowed currency

    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get("payment");

    if (paymentStatus === "success") {
      fetchBalance();
      fetchTransactions();
    }
  }, [location]);

  const fetchBalance = async () => {
    try {
      setLoadingBalance(true);
      const response = await axios.get(`${baseUrl}/api/balance`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBalance(response.data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setError("Failed to fetch balance.");
    } finally {
      setLoadingBalance(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const response = await axios.get(`${baseUrl}/api/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(response.data.transactions || []);
      console.log("Transactions fetched:", response.data.transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to fetch transactions.");
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleEstimate = async () => {
    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber < 15) {
      setError("Please enter a valid amount greater than or equal to 15.");
      return;
    }

    if (!payCurrency) {
      setError("Please select a payment currency.");
      return;
    }

    try {
      setLoadingEstimate(true);
      const response = await axios.get(`${baseUrl}/api/estimate`, {
        params: {
          amount: amountNumber,
          currency: "USD", // Fixed currency
          payCurrency,
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.estimatedAmount) {
        setEstimatedAmount(response.data.estimatedAmount);
        setError(null); // Clear previous errors
      } else {
        setError("Unexpected response from the server.");
      }
    } catch (error) {
      console.error("Error fetching estimate:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to get cryptocurrency estimate.";
      setError(errorMessage);
    } finally {
      setLoadingEstimate(false);
    }
  };

  const handleAddBalance = async () => {
    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber < 15) {
      setError("Please enter a valid amount greater than or equal to 15.");
      return;
    }

    if (!payCurrency) {
      setError("Please select a payment currency.");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${baseUrl}/api/create-payment`,
        { amount: amountNumber, currency: "USD", payCurrency },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.invoiceUrl) {
        window.location.href = response.data.invoiceUrl;
      } else {
        setError("Failed to retrieve invoice URL.");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create payment.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (fieldName, value) => {
    const textToCopy = `${fieldName}: ${value}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      alert(`${fieldName} copied to clipboard.`);
    });
  };

  return (
    <Box minH="100vh" bg="gray.50">
      <TopBar title="Wallet" />
      <Flex justify="center" align="center" py={12} px={4}>
        <Box maxW="3xl" w="full" bg="white" shadow="xl" rounded="lg" p={8}>
          <Heading size="lg" mb={6} textAlign="center">
            Wallet
          </Heading>

          {error && (
            <Text color="red.600" mb={4} textAlign="center">
              {error}
            </Text>
          )}

          <Box mb={8}>
            <Text fontSize="lg" fontWeight="medium" mb={2}>
              Current Balance:
            </Text>
            {loadingBalance ? (
              <Spinner />
            ) : (
              <Text fontSize="xl" fontWeight="bold">
                ${balance.toFixed(2)}
              </Text>
            )}
          </Box>

          <Box mb={8}>
            <Text fontSize="lg" fontWeight="medium" mb={2}>
              Add Balance:
            </Text>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount in USD (min 15)"
              mb={4}
              min={15}
            />
            <Select
              value={payCurrency}
              onChange={(e) => setPayCurrency(e.target.value)}
              mb={4}
            >
              {allowedCurrencies.map((cur) => (
                <option key={cur.code} value={cur.code}>
                  {cur.name}
                </option>
              ))}
            </Select>
            <Button
              onClick={handleEstimate}
              colorScheme="blue"
              w="full"
              mb={4}
              isLoading={loadingEstimate}
            >
              Get Estimate
            </Button>
            {estimatedAmount && (
              <Text mb={4}>
                Estimated Amount: {estimatedAmount} {payCurrency}
              </Text>
            )}
            <Button
              onClick={handleAddBalance}
              colorScheme="green"
              w="full"
              isLoading={loading}
            >
              Proceed to Payment
            </Button>
          </Box>

          <Box>
            <Text fontSize="lg" fontWeight="medium" mb={2}>
              Recent Transactions:
            </Text>
            {loadingTransactions ? (
              <Spinner />
            ) : transactions.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg="gray.100">
                    <Tr>
                      <Th>Payment ID</Th>
                      <Th>Date and Time</Th>
                      <Th>Amount</Th>
                      <Th>Status</Th>
                      <Th>Copy</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {transactions.map((tx) => {
                      let statusColor = "gray.700";
                      if (
                        tx.status === "Completed" ||
                        tx.status === "success"
                      ) {
                        statusColor = "green.500";
                      } else if (tx.status === "Pending") {
                        statusColor = "red.500";
                      }

                      return (
                        <Tr key={tx._id}>
                          <Td>{tx.paymentId || tx._id}</Td>
                          <Td>{new Date(tx.createdAt).toLocaleString()}</Td>
                          <Td>${tx.amount}</Td>
                          <Td>
                            <Text color={statusColor}>{tx.status}</Text>
                          </Td>
                          <Td>
                            <Tooltip label="Copy Payment ID">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleCopy(
                                    "Payment ID",
                                    tx.paymentId || tx._id
                                  )
                                }
                              >
                                <CopyIcon />
                              </Button>
                            </Tooltip>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Text>No transactions found.</Text>
            )}
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default Wallet;
