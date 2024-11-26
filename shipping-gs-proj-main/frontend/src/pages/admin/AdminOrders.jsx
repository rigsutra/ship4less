import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Select,
  Text,
  Spinner,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Input,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import TopBar from "../../components/layout/TopBar";

const baseUrl = import.meta.env.VITE_BASE_URL; // Ensure this includes '/api'

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [trackingId, setTrackingId] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  // Configuration mapping for each order type
  const orderTypeConfig = {
    "FedEx Domestic": {
      fetchEndpoint: "/api/getAllOrdersdomesticAdmin",
      updateStatusEndpoint: "/api/updateOrderStatusdomesticAdmin",
      detailRoute: "/admin-fedex-domestic-order-details",
    },
    "FedEx International": {
      fetchEndpoint: "/api/getAllOrdersInternationalAdmin",
      updateStatusEndpoint: "/api/updateOrderStatusInternationalAdmin",
      detailRoute: "/admin-fedex-international-order-details",
    },
    DHL: {
      fetchEndpoint: "/api/dhlordersAdmin",
      updateStatusEndpoint: "/api/dhlOrderStatus", // Assuming PUT /api/dhlOrders/:id updates status
      detailRoute: "/admin-dhl-order-details",
    },
    UPS: {
      fetchEndpoint: "/api/upsordersAdmin",
      updateStatusEndpoint: "/api/upsOrderStatus",
      detailRoute: "/admin-ups-order-details",
    },
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Prepare fetch promises for each order type
        const fetchPromises = Object.values(orderTypeConfig).map((config) =>
          fetch(`${baseUrl}${config.fetchEndpoint}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        );

        const responses = await Promise.all(fetchPromises);

        // Check for failed responses
        responses.forEach((response, index) => {
          if (!response.ok) {
            throw new Error(
              `Failed to fetch orders from ${
                Object.keys(orderTypeConfig)[index]
              }`
            );
          }
        });

        // Parse all responses
        const dataPromises = responses.map((response) => response.json());
        const data = await Promise.all(dataPromises);
        console.log(data);

        let combinedOrders = [];

        // Process FedEx Domestic Orders
        const fedexDomesticOrders = data[0].map((order) => ({
          ...order,
          orderType: "FedEx Domestic",
          price: parseFloat(order.price?.replace(/[^0-9.-]+/g, "") || 0),
          status: order.status || "Pending",
        }));
        combinedOrders = combinedOrders.concat(fedexDomesticOrders);

        // Process FedEx International Orders
        const fedexInternationalOrders = data[1].map((order) => ({
          ...order,
          orderType: "FedEx International",
          price: parseFloat(order.price?.replace(/[^0-9.-]+/g, "") || 0),
          status: order.status || "Pending",
        }));
        combinedOrders = combinedOrders.concat(fedexInternationalOrders);

        // Process DHL Orders (accessing `dhlOrders` array)
        if (data[2]?.orders?.length > 0) {
          const dhlOrders = data[2].orders.map((order) => ({
            ...order,
            orderType: "DHL",
            price: parseFloat(order.price?.replace(/[^0-9.-]+/g, "") || 0),
            status: order.status || "Pending",
          }));
          combinedOrders = combinedOrders.concat(dhlOrders);
        }

        // Process UPS Orders (accessing `orders` array)
        if (data[3]?.orders?.length > 0) {
          const uspsOrders = data[3].orders.map((order) => ({
            ...order,
            orderType: "UPS",
            price: parseFloat(order.total_price) || 0, // `total_price` is already numeric
            status: order.status || "Pending",
          }));
          combinedOrders = combinedOrders.concat(uspsOrders);
        }

        setOrders(combinedOrders);

        const total = combinedOrders.reduce(
          (sum, order) => sum + (isNaN(order.price) ? 0 : order.price),
          0
        );
        setTotalAmount(total);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "Error fetching orders",
          description:
            error.message || "An error occurred while fetching orders.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token, baseUrl, toast]);

  // Handle Status Change
  const handleStatusChange = async (_id, status, orderType) => {
    try {
      const config = orderTypeConfig[orderType];
      if (!config) throw new Error("Invalid order type");

      const updateEndpoint = `${baseUrl}${config.updateStatusEndpoint}/${_id}`;

      const response = await fetch(updateEndpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update order status");
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === _id ? { ...order, status } : order
        )
      );

      toast({
        title: "Status Updated",
        description: `Order status updated to ${status}`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error updating status",
        description:
          error.message || "An error occurred while updating the order status.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Handle Tracking ID Submit
  const handleTrackingSubmit = async () => {
    if (!selectedOrder) {
      toast({
        title: "No Order Selected",
        description: "Please select an order to update tracking ID.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // if (!trackingId.trim()) {
    //   toast({
    //     title: "Invalid Tracking ID",
    //     description: "Tracking ID cannot be empty.",
    //     status: "warning",
    //     duration: 3000,
    //     isClosable: true,
    //   });
    //   return;
    // }

    try {
      // Determine the correct endpoint based on orderType
      const config = orderTypeConfig[selectedOrder.orderType];
      if (!config) throw new Error("Invalid order type");

      const updateEndpoint = `${baseUrl}/api/updateTracking/${selectedOrder._id}`;

      const response = await fetch(updateEndpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ trackingId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update tracking ID");
      }

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === selectedOrder._id ? { ...order, trackingId } : order
        )
      );

      toast({
        title: "Tracking ID Updated",
        description: "The tracking ID has been updated successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      closeTrackingModal();
    } catch (error) {
      console.error("Error updating tracking ID:", error);
      toast({
        title: "Error updating tracking ID",
        description:
          error.message || "An error occurred while updating the tracking ID.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Open Tracking Modal
  const openTrackingModal = (order) => {
    setSelectedOrder(order);
    setTrackingId(order.trackingId || "");
    setIsTrackingModalOpen(true);
  };

  // Close Tracking Modal
  const closeTrackingModal = () => {
    setIsTrackingModalOpen(false);
    setSelectedOrder(null);
    setTrackingId("");
  };

  // View Order Details
  const viewOrderDetails = (order) => {
    const config = orderTypeConfig[order.orderType];
    if (!config) {
      toast({
        title: "Invalid Order Type",
        description: "Cannot navigate to order details for this order type.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const orderId = order.orderId || order._id;
    navigate(`${config.detailRoute}/${orderId}`);
  };

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <div>
      <TopBar title="Order Management" />
      <Box p={4}>
        <Text fontSize="2xl" mb={4}>
          Orders Management
        </Text>
        <Text fontSize="lg" mb={4}>
          Total Amount: ${totalAmount.toFixed(2)}
        </Text>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Order ID</Th>
              <Th>Order Type</Th>
              <Th>Status</Th>
              <Th>Price</Th>

              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.length === 0 ? (
              <Tr>
                <Td colSpan="6" textAlign="center">
                  No orders found.
                </Td>
              </Tr>
            ) : (
              orders.map((order) => (
                <Tr key={order._id}>
                  <Td>{order.orderId || order._id}</Td>
                  <Td>{order.orderType}</Td>
                  <Td>
                    <Select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusChange(
                          order._id,
                          e.target.value,
                          order.orderType
                        )
                      }
                      maxWidth="150px"
                    >
                      {/* Customize status options based on order type if needed */}
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Process</option>
                      <option value="Completed">Completed</option>
                    </Select>
                  </Td>
                  <Td>
                    ${isNaN(order.price) ? "0.00" : order.price.toFixed(2)}
                  </Td>
                  <Td>
                    <Button
                      colorScheme="teal"
                      size="sm"
                      onClick={() => viewOrderDetails(order)}
                      mr={2}
                    >
                      View
                    </Button>
                    <Button
                      colorScheme={order.trackingId ? "green" : "blue"}
                      size="sm"
                      onClick={() => openTrackingModal(order)}
                    >
                      {order.trackingId ? "Update Tracking" : "Add Tracking"}
                    </Button>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>

        {/* Tracking ID Modal */}
        <Modal isOpen={isTrackingModalOpen} onClose={closeTrackingModal}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {selectedOrder?.trackingId ? "Update" : "Add"} Tracking ID
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                placeholder="Enter Tracking ID"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="teal" onClick={handleTrackingSubmit}>
                Submit
              </Button>
              <Button variant="ghost" onClick={closeTrackingModal} ml={3}>
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </div>
  );
}

export default AdminOrders;
