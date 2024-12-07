import React, { useState } from "react";
import axios from "axios";

const PaymentStatusChecker = () => {
  const [paymentId, setPaymentId] = useState("");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPaymentStatus = async () => {
    if (!paymentId) {
      setError("Please enter a Payment ID.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/payment-status/${paymentId}`); // Replace with your backend API URL
      console.log(response.data);
      setPaymentDetails(response.data);
    } catch (err) {
      setError("Failed to fetch payment status. Please try again.");
      console.error("Error:", err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Check Payment Status</h1>
      <div>
        <label htmlFor="paymentId">Payment ID:</label>
        <input
          type="text"
          id="paymentId"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
          style={{ marginLeft: "10px", padding: "5px" }}
        />
        <button
          onClick={fetchPaymentStatus}
          style={{ marginLeft: "10px", padding: "5px 10px" }}
          disabled={loading}
        >
          {loading ? "Checking..." : "Check Status"}
        </button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {paymentDetails && (
        <div
          style={{
            marginTop: "20px",
            border: "1px solid #ccc",
            padding: "10px",
          }}
        >
          <h3>Payment Details</h3>
          <p>
            <strong>Payment ID:</strong> {paymentDetails.payment_id}
          </p>
          <p>
            <strong>Order ID:</strong> {paymentDetails.order_id}
          </p>
          <p>
            <strong>Status:</strong> {paymentDetails.payment_status}
          </p>
          <p>
            <strong>Amount:</strong> {paymentDetails.price_amount}{" "}
            {paymentDetails.price_currency}
          </p>
          <p>
            <strong>Actually Paid:</strong>{" "}
            {paymentDetails.actually_paid || "0"} {paymentDetails.pay_currency}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(paymentDetails.created_at).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentStatusChecker;
