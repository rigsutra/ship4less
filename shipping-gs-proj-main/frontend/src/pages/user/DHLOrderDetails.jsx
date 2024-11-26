import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Text,
  VStack,
  HStack,
  Divider,
  Spinner,
  useToast,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";

const baseUrl = import.meta.env.VITE_BASE_URL;

function DHLOrderDetails() {
  const { orderId } = useParams(); // Retrieve orderId from route params
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Fetch order details from the backend
        const response = await axios.get(
          `${baseUrl}/api/dhlOrders/${orderId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setOrder(response.data);
      } catch (error) {
        toast({
          title: "Failed to load order details",
          description: error.response?.data?.message || error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, token, toast]);

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (!order) {
    return (
      <Box p={8} textAlign="center">
        <Text>No order found.</Text>
      </Box>
    );
  }

  const formatDateTime = (date) =>
    date ? new Date(date).toLocaleString() : "N/A";

  return (
    <Box p={8}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Order Details - {order.orderId}
      </Text>
      <Divider mb={4} />
      <VStack align="start" spacing={2}>
        <Text>
          <strong>Status:</strong> {order.status}
        </Text>
        <Text>
          <strong>Price:</strong> {order.total_price || order.price}
        </Text>
        <Text>
          <strong>Note:</strong> {order.note || order.template || "N/A"}
        </Text>
        <Text>
          <strong>Created At:</strong> {formatDateTime(order.createdAt)}
        </Text>

        <HStack spacing={10} mt={4}>
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">Sender Information:</Text>
            <Text>Name: {order.fromAddress?.name || "N/A"}</Text>
            <Text>Street: {order.fromAddress?.street1 || "N/A"}</Text>
            {order.fromAddress?.street2 && (
              <Text>Street 2: {order.fromAddress.street2}</Text>
            )}
            <Text>City: {order.fromAddress?.city || "N/A"}</Text>
            <Text>State: {order.fromAddress?.state || "N/A"}</Text>
            <Text>Zip: {order.fromAddress?.zip_code || "N/A"}</Text>
            <Text>Phone: {order.fromAddress?.phone || "N/A"}</Text>
            <Text>Country: {order.fromAddress?.country || "N/A"}</Text>
          </VStack>

          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">Receiver Information:</Text>
            <Text>Name: {order.toAddress?.name || "N/A"}</Text>
            <Text>Street: {order.toAddress?.street1 || "N/A"}</Text>
            {order.toAddress?.street2 && (
              <Text>Street 2: {order.toAddress.street2}</Text>
            )}
            <Text>City: {order.toAddress?.city || "N/A"}</Text>
            <Text>State: {order.toAddress?.state || "N/A"}</Text>
            <Text>Zip: {order.toAddress?.zip_code || "N/A"}</Text>
            <Text>Phone: {order.toAddress?.phone || "N/A"}</Text>
            <Text>Country: {order.toAddress?.country || "N/A"}</Text>
          </VStack>
        </HStack>

        {/* Pickup Information */}
        {order.pickAddress && (
          <VStack align="start" spacing={1} mt={4}>
            <Text fontWeight="bold">Pickup Information:</Text>
            <Text>Name: {order.pickAddress?.name || "N/A"}</Text>
            <Text>Street: {order.pickAddress?.street || "N/A"}</Text>
            {order.pickAddress?.street2 && (
              <Text>Street 2: {order.pickAddress?.street2}</Text>
            )}
            <Text>City: {order.pickAddress?.city || "N/A"}</Text>
            <Text>State: {order.pickAddress?.state || "N/A"}</Text>
            <Text>Zip: {order.pickAddress?.zip || "N/A"}</Text>
            <Text>Phone: {order.pickAddress?.phone || "N/A"}</Text>
            <Text>Country: {order.pickAddress?.country || "N/A"}</Text>
            <Text>
              Pickup Date:{" "}
              {order.pickupDate
                ? new Date(order.pickupDate).toLocaleDateString()
                : "N/A"}
            </Text>
            <Text>
              Pickup Time: {order.fromPickupTime || "N/A"} -{" "}
              {order.toPickupTime || "N/A"}
            </Text>
          </VStack>
        )}
      </VStack>
    </Box>
  );
}

export default DHLOrderDetails;
