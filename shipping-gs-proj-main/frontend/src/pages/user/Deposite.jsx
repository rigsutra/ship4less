import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useLocation } from "react-router-dom";
import TopBar from "../../components/layout/TopBar";

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("$"); // Default currency
  const [currencies, setCurrencies] = useState([]); // List of available currencies
  const [loading, setLoading] = useState(false);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingCurrencies, setLoadingCurrencies] = useState(false);
  const [error, setError] = useState(null);

  const { token } = useSelector((state) => state.auth);
  const baseUrl = import.meta.env.VITE_BASE_URL;
  const location = useLocation();

  const allowedCurrencies = [
    { name: "USDT (TRC20)", code: "USDT_TRX" },
    { name: "USDT (BEP20)", code: "USDT_BEP" },
    { name: "USDT (BSC20)", code: "USDT_BSC" },
    { name: "BTC", code: "BTC" },
    { name: "LTC", code: "LTC" },
    { name: "ETH", code: "ETH" },
  ];

  useEffect(() => {
    fetchBalance();
    fetchTransactions();
    setCurrencies(allowedCurrencies);

    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get("payment");

    if (paymentStatus === "success") {
      fetchBalance();
      fetchTransactions();
    }

    const handleFocus = () => {
      fetchBalance();
      fetchTransactions();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [location]);

  const fetchBalance = async () => {
    try {
      setLoadingBalance(true);
      const response = await axios.get(
        `${baseUrl}/api/balance?currency=${currency}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBalance(response.data.balance);
    } catch (error) {
      console.error("Error fetching balance:", error);
      setError("Failed to fetch balance");
    } finally {
      setLoadingBalance(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const response = await axios.get(
        `${baseUrl}/api/transactions?currency=${currency}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setError("Failed to fetch transactions");
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleAddBalance = async () => {
    const amountNumber = parseFloat(amount);
    if (isNaN(amountNumber) || amountNumber <= 0) {
      alert("Please enter a valid amount greater than 11");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${baseUrl}/api/create-payment`,
        { amount: amountNumber, currency },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.invoiceUrl) {
        window.location.href = response.data.invoiceUrl;
      } else if (response.data.error) {
        alert(`Error: ${response.data.error}`);
      } else {
        alert("Failed to retrieve invoice URL");
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      alert("Failed to create payment");
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value === "" || (Number(value) > 0 && /^\d*\.?\d*$/.test(value))) {
      setAmount(value);
    }
  };

  const handleCurrencyChange = (e) => {
    setCurrency(e.target.value);
    fetchBalance();
    fetchTransactions();
  };

  return (
    <div className="min-h-screen ">
      <TopBar title={"Deposits"} />
      <div className="flex justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full bg-white shadow-xl rounded-lg p-8 space-y-8">
          <h1 className="text-2xl font-semibold text-center text-gray-800">
            Wallet
          </h1>

          {error && (
            <div className="text-red-600 bg-red-100 border border-red-400 rounded-lg p-3">
              {error}
            </div>
          )}

          {/* Wallet Balance Section */}
          <div className="mb-6">
            {loadingBalance ? (
              <div className="text-gray-600">Loading balance...</div>
            ) : (
              <div className="text-lg font-bold text-gray-800 text-center">
                Current Balance:{" "}
                <span className="font-semibold text-green-600">
                  {balance} {currency}
                </span>
              </div>
            )}
          </div>

          {/* Add Balance Section */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-xl font-medium text-gray-700 mb-4">
              Add Balance
            </h3>
            <div className="space-y-4">
              <input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              />
              <select
                value={currency}
                onChange={handleCurrencyChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-500"
              >
                {allowedCurrencies.map((cur, index) => (
                  <option key={index} value={cur.code}>
                    {cur.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddBalance}
                disabled={loading}
                className={`w-full py-2 text-white rounded-md ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading ? "Processing..." : "Add Balance"}
              </button>
            </div>
          </div>

          {/* Transaction History Section */}
          <div className="bg-white shadow-sm rounded-lg p-6">
            <h3 className="text-xl font-medium text-gray-700 mb-4">
              Transaction History
            </h3>
            {loadingTransactions ? (
              <div className="text-gray-600">Loading transactions...</div>
            ) : transactions.length > 0 ? (
              <ul className="space-y-4">
                {transactions.map((tx, index) => (
                  <li
                    key={index}
                    className="flex justify-between items-center border-b pb-3"
                  >
                    <span className="text-gray-600">
                      {new Date(tx.createdAt).toLocaleString()}
                    </span>
                    <span className="text-gray-800 font-medium">
                      {tx.amount} {tx.currency}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        tx.status === "success"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-600">No transactions found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
