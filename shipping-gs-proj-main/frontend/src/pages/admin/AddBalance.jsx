import React, { useState } from "react";
import axios from "axios";


const baseUrl = import.meta.env.VITE_BASE_URL;
const AddBalance = () => {
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { token } = useSelector((state) => state.auth);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!userId || !amount || amount <= 0) {
      setError("Please provide a valid user ID and amount.");
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}/api/add-balance`,
        { userId, amount: Number(amount) },
        {
          headers: {
            Authorization: `Bearer ${token}`, // Pass the JWT token for authentication
          },
        }
      );

      setMessage(response.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while adding balance.");
    }
  };

  return (
    <div className="add-balance-form">
      <h2>Add Balance to User Account</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="userId">User ID:</label>
          <input
            type="text"
            id="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="amount">Amount:</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <button type="submit">Add Balance</button>
      </form>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default AddBalance;
