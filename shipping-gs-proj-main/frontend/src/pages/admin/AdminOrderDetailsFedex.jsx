// src/components/FedexOrderDetails.js
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
import TopBar from "../../components/layout/TopBar";
import { useSelector } from "react-redux";

const baseUrl = import.meta.env.VITE_BASE_URL;

function AdmimOrderDetailsFedex() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        let response;
        if (orderId.startsWith("SHFEDO")) {
          response = await axios.get(`${baseUrl}/api/getOrderByIddomesticAdmin/${orderId}`,{
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          response = await axios.get(`${baseUrl}/api/getOrderByIdInternationalAdmin/${orderId}`,{
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
        setOrder(response.data);
        console.log(response.data);
      } catch (error) {
        toast({
          title: "Failed to load order details",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };
  
    if (orderId) {
      fetchOrderDetails();
    } else {
      toast({
        title: "Invalid Order ID",
        description: "Order ID is missing or invalid.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  }, [orderId, toast]);

  if (loading) return <Spinner />;

  if (!order) return <div className="h-screen"> <TopBar title={"Order Details"}></TopBar><Text>No order found.</Text></div>;

  return (
    <div className="" >
      <TopBar title={"Order Details"}></TopBar>
      <div className="">
    <Box p={8}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Order Details - {order.orderId}
      </Text>
      <Divider mb={4} />
      {/* Display Order Information */}
      <VStack align="start" spacing={2}>
        <Text>
          <strong>Status:</strong> {order.status}
        </Text>
        <Text>
          <strong>Price:</strong> {order.price}
        </Text>
        <Text>
          <strong>Note:</strong> {order.note}
        </Text>
        <Text>
          <strong>Created At:</strong>{" "}
          {new Date(order.createdAt).toLocaleString()}
        </Text>
        {/* Display Sender and Receiver Addresses */}
        <HStack spacing={10} mt={4}>
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">Sender Information:</Text>
            <Text>Name: {order.senderAddress.name}</Text>
            <Text>Street: {order.senderAddress.street}</Text>
            {order.senderAddress.street2 && (
              <Text>Street 2: {order.senderAddress.street2}</Text>
            )}
            <Text>City: {order.senderAddress.city}</Text>
            {order.senderAddress.state && (
              <Text>State: {order.senderAddress.state}</Text>
            )}
            <Text>Zip: {order.senderAddress.zip}</Text>
            <Text>Phone: {order.senderAddress.phone}</Text>
            {order.senderAddress.email && (
              <Text>Email: {order.senderAddress.email}</Text>
            )}
            <Text>Country: {order.senderAddress.country}</Text>
          </VStack>
          <VStack align="start" spacing={1}>
            <Text fontWeight="bold">Receiver Information:</Text>
            <Text>Name: {order.receiverAddress.name}</Text>
            <Text>Street: {order.receiverAddress.street}</Text>
            {order.receiverAddress.street2 && (
              <Text>Street 2: {order.receiverAddress.street2}</Text>
            )}
            <Text>City: {order.receiverAddress.city}</Text>
            {order.receiverAddress.state && (
              <Text>State: {order.receiverAddress.state}</Text>
            )}
            <Text>Zip: {order.receiverAddress.zip}</Text>
            <Text>Phone: {order.receiverAddress.phone}</Text>
            {order.receiverAddress.email && (
              <Text>Email: {order.receiverAddress.email}</Text>
            )}
            <Text>Country: {order.receiverAddress.country}</Text>
          </VStack>
        </HStack>
        {/* Display Pickup Information if available */}
        {order.pickAddress && (
          <VStack align="start" spacing={1} mt={4}>
            <Text fontWeight="bold">Pickup Information:</Text>
            <Text>Name: {order.pickAddress.name}</Text>
            <Text>Street: {order.pickAddress.street}</Text>
            {order.pickAddress.street2 && (
              <Text>Street 2: {order.pickAddress.street2}</Text>
            )}
            <Text>City: {order.pickAddress.city}</Text>
            {order.pickAddress.state && (
              <Text>State: {order.pickAddress.state}</Text>
            )}
            <Text>Zip: {order.pickAddress.zip}</Text>
            <Text>Phone: {order.pickAddress.phone}</Text>
            <Text>Country: {order.pickAddress.country}</Text>
            <Text>
              Pickup Date: {new Date(order.pickupDate).toLocaleDateString()}
            </Text>
            <Text>
              Pickup Time: {order.fromPickupTime} - {order.toPickupTime}
            </Text>
          </VStack>
        )}
        {/* Display Shipment Details */}
        <VStack align="start" spacing={1} mt={4}>
          <Text fontWeight="bold">Shipment Details:</Text>
          <Text>Purpose: {order.shipment.shipmentPurpose}</Text>
          <Text>Currency: {order.shipment.currency}</Text>
          {/* List Items */}
          <VStack align="start" spacing={1}>
            <Text fontWeight="semibold">Items:</Text>
            {order.shipment.items.map((item, index) => (
              <Box
                key={index}
                p={2}
                borderWidth="1px"
                borderRadius="md"
                w="full"
              >
                <Text>
                  <strong>Units:</strong> {item.units}
                </Text>
                <Text>
                  <strong>Description:</strong> {item.description}
                </Text>
                <Text>
                  <strong>Weight:</strong> {item.weight}
                </Text>
                <Text>
                  <strong>Value:</strong> {item.value}
                </Text>
                <Text>
                  <strong>Tariff:</strong> {item.tariff}
                </Text>
              </Box>
            ))}
          </VStack>
        </VStack>
      </VStack>
    </Box>
      </div>
    </div>
  );
}

export default AdmimOrderDetailsFedex;
