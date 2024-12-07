import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Extract the NP_id (payment ID) from the query parameters
  const paymentId = searchParams.get("NP_id");

  useEffect(() => {
    const fetchPaymentDetails = async () => {
      if (!paymentId) {
        setError("Payment ID is missing from the URL.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${baseUrl}/api/payment-status/${paymentId}`
        );
        setPaymentDetails(response.data);
      } catch (err) {
        setError("Failed to fetch payment details. Please try again.");
        console.error(err.response ? err.response.data : err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [paymentId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Payment Success</h1>
      {paymentDetails ? (
        <div style={{ border: "1px solid #ccc", padding: "10px" }}>
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
            <strong>Paid:</strong> {paymentDetails.actually_paid}{" "}
            {paymentDetails.pay_currency}
          </p>
          <p>
            <strong>Created At:</strong>{" "}
            {new Date(paymentDetails.created_at).toLocaleString()}
          </p>
        </div>
      ) : (
        <p>No payment details available.</p>
      )}
    </div>
  );
};

export default PaymentSuccess;
