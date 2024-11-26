// src/components/OrderDetails.js
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

function OrderDetails() {
  const { orderId } = useParams();  // Only need orderId, orderType can be hardcoded or passed in another way
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Fetch order details from the backend
        const response = await axios.get(`${baseUrl}/api/uspsorders/${orderId}`,{
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setOrder(response.data);
        setLoading(false);
      } catch (error) {
        toast({
          title: "Failed to load order details",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId, toast]);

  if (loading) return <Spinner />;
  if (!order) return <Text>No order found.</Text>;

  return (
    <Box p={8}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Order Details - {order.orderId}
      </Text>
      <Divider mb={4} />
      <VStack align="start" spacing={2}>
        <Text><strong>Status:</strong> {order.status}</Text>
        <Text><strong>Price:</strong> {order.total_price || order.price}</Text>
        <Text><strong>Note:</strong> {order.note || order.template}</Text>
        <Text><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</Text>

        <HStack spacing={10} mt={4}>
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">Sender Information:</Text>
            <Text>Name: {order.fromAddress?.name}</Text>
            <Text>Street: {order.fromAddress?.street1}</Text>
            {order.fromAddress?.street2 && <Text>Street 2: {order.fromAddress.street2}</Text>}
            <Text>City: {order.fromAddress?.city}</Text>
            <Text>State: {order.fromAddress?.state}</Text>
            <Text>Zip: {order.fromAddress?.zip_code}</Text>
            <Text>Phone: {order.fromAddress?.phone || "N/A"}</Text>
            <Text>Country: {order.fromAddress?.country}</Text>
          </VStack>

          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">Receiver Information:</Text>
            <Text>Name: {order.toAddress?.name}</Text>
            <Text>Street: {order.toAddress?.street1}</Text>
            {order.toAddress?.street2 && <Text>Street 2: {order.toAddress.street2}</Text>}
            <Text>City: {order.toAddress?.city}</Text>
            <Text>State: {order.toAddress?.state}</Text>
            <Text>Zip: {order.toAddress?.zip_code}</Text>
            <Text>Phone: {order.toAddress?.phone || "N/A"}</Text>
            <Text>Country: {order.toAddress?.country}</Text>
          </VStack>
        </HStack>

        {/* Pickup Information */}
        {order.pickAddress && (
          <VStack align="start" spacing={1} mt={4}>
            <Text fontWeight="bold">Pickup Information:</Text>
            <Text>Name: {order.pickAddress?.name}</Text>
            <Text>Street: {order.pickAddress?.street}</Text>
            {order.pickAddress?.street2 && <Text>Street 2: {order.pickAddress?.street2}</Text>}
            <Text>City: {order.pickAddress?.city}</Text>
            <Text>State: {order.pickAddress?.state}</Text>
            <Text>Zip: {order.pickAddress?.zip}</Text>
            <Text>Phone: {order.pickAddress?.phone}</Text>
            <Text>Country: {order.pickAddress?.country}</Text>
            <Text>Pickup Date: {new Date(order.pickupDate).toLocaleDateString()}</Text>
            <Text>Pickup Time: {order.fromPickupTime} - {order.toPickupTime}</Text>
          </VStack>
        )}
      </VStack>
    </Box>
  );
}

export default OrderDetails;
