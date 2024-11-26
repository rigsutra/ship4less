// src/components/CreateFedexOrder.js
import React, { useEffect, useState } from "react";
import {
  Input,
  VStack,
  HStack,
  Divider,
  Text,
  Box,
  Select,
  Button,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import TopBar from "../../components/layout/TopBar";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
const baseUrl = import.meta.env.VITE_BASE_URL;

function CreateFedexOrder() {
  const toast = useToast();
  const location = useLocation();
   
  const [customType, setCustomType] = useState(""); // State to store the `type` query parameter
  const { token } = useSelector((state) => state.auth);

  // Extract the `type` parameter from the URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const type = params.get("type"); // Get the value of `type` query parameter
    if (type) {
      setCustomType(type);
    }
  }, [location.search]);

  // Form state for sender, receiver, package, and pickup details
  const [formData, setFormData] = useState({
    senderName: "",
    senderStreet: "",
    senderStreet2: "",
    senderCity: "",
    senderState: "",
    senderZip: "",
    senderPhone: "",
    senderEmail: "",
    senderCountry: "",
    receiverName: "",
    receiverStreet: "",
    receiverStreet2: "",
    receiverCity: "",
    receiverState: "",
    receiverZip: "",
    receiverPhone: "",
    receiverEmail: "",
    receiverCountry: "",
    pickup: false,
    pickupDate: "",
    fromPickupTime: "",
    toPickupTime: "",
    signature: false,
    shipmentPurpose: "",
    currency: "USD",
    specialNotes: "",
    pickupName: "",
    pickupStreet: "",
    pickupStreet2: "",
    pickupCity: "",
    pickupState: "",
    pickupZip: "",
    pickupPhone: "",
    pickupCountry: "",
  });

  const [showPickupDetails, setShowPickupDetails] = useState(false);
  const [items, setItems] = useState([]);

  const handleAddItem = () => {
    const newItem = {
      units: "",
      description: "",
      weight: "",
      value: "",
      tariff: "",
    };
    setItems((prevItems) => [...prevItems, newItem]);
  };

  const handleDeleteItem = (index) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, name, value) => {
    setItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, [name]: value } : item
      )
    );
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "pickup") {
      setShowPickupDetails(checked);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Data validation before submission
    if (
      !formData.senderName ||
      !formData.senderStreet ||
      !formData.senderCity ||
      !formData.senderZip ||
      !formData.senderPhone ||
      !formData.senderCountry ||
      !formData.receiverName ||
      !formData.receiverStreet ||
      !formData.receiverCity ||
      !formData.receiverZip ||
      !formData.receiverPhone ||
      !formData.receiverCountry ||
      !formData.shipmentPurpose ||
      items.length === 0
    ) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const data = {
      ...formData,
      items,
    };

    try {
      const response = await axios.post(
        `${baseUrl}/api/createfedexorder/${customType}`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: `Order Created Successfully!`,
        description: `Order ID: ${response.data.orderId}`,
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Reset form after successful submission
      setFormData({
        senderName: "",
        senderStreet: "",
        senderStreet2: "",
        senderCity: "",
        senderState: "",
        senderZip: "",
        senderPhone: "",
        senderEmail: "",
        senderCountry: "",
        receiverName: "",
        receiverStreet: "",
        receiverStreet2: "",
        receiverCity: "",
        receiverState: "",
        receiverZip: "",
        receiverPhone: "",
        receiverEmail: "",
        receiverCountry: "",
        pickup: false,
        pickupDate: "",
        fromPickupTime: "",
        toPickupTime: "",
        signature: false,
        shipmentPurpose: "",
        currency: "USD",
        specialNotes: "",
        pickupName: "",
        pickupStreet: "",
        pickupStreet2: "",
        pickupCity: "",
        pickupState: "",
        pickupZip: "",
        pickupPhone: "",
        pickupCountry: "",
      });
      setItems([]);
      setShowPickupDetails(false);
    } catch (error) {
      toast({
        title: "Failed to Create Order",
        description: error.response?.data?.message || "Something went wrong.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <div className="h-full">
      <TopBar title={"Create Order"}></TopBar>
    <Box px={10} py={5} className="bg-gray-800" color="white" >
      <form onSubmit={handleSubmit} >
        <VStack spacing={8} align="stretch">
          {/* Sender and Receiver Information */}
          <HStack spacing={10} align="start">
            {/* Sender Information */}
            <VStack align="start" spacing={4} w="full">
              <Text fontSize="xl" fontWeight="bold">
                Sender Information
              </Text>
              <Input
                name="senderName"
                placeholder="Name"
                value={formData.senderName}
                onChange={handleChange}
                isRequired
              />
              <Input
                name="senderStreet"
                placeholder="Street"
                value={formData.senderStreet}
                onChange={handleChange}
                isRequired
              />
              <Input
                name="senderStreet2"
                placeholder="Street 2 (optional)"
                value={formData.senderStreet2}
                onChange={handleChange}
              />
              <Input
                name="senderCity"
                placeholder="City"
                value={formData.senderCity}
                onChange={handleChange}
                isRequired
              />
              <Input
                name="senderState"
                placeholder="State (optional)"
                value={formData.senderState}
                onChange={handleChange}
              />
              <Input
                name="senderZip"
                placeholder="Zip"
                value={formData.senderZip}
                onChange={handleChange}
                isRequired
              />
              <Input
                name="senderPhone"
                placeholder="Phone"
                value={formData.senderPhone}
                onChange={handleChange}
                isRequired
              />
              <Input
                name="senderEmail"
                placeholder="Email (optional)"
                value={formData.senderEmail}
                onChange={handleChange}
              />
              <Input
                name="senderCountry"
                placeholder="Country"
                value={formData.senderCountry}
                onChange={handleChange}
                isRequired
              />
            </VStack>

            {/* Receiver Information */}
            <VStack align="start" spacing={4} w="full">
              <Text fontSize="xl" fontWeight="bold">
                Receiver Information
              </Text>
              <Input
                name="receiverName"
                placeholder="Name"
                value={formData.receiverName}
                onChange={handleChange}
                isRequired
              />
              <Input
                name="receiverStreet"
                placeholder="Street"
                value={formData.receiverStreet}
                onChange={handleChange}
                isRequired
              />
              <Input
                name="receiverStreet2"
                placeholder="Street 2 (optional)"
                value={formData.receiverStreet2}
                onChange={handleChange}
              />
              <Input
                name="receiverCity"
                placeholder="City"
                value={formData.receiverCity}
                onChange={handleChange}
                isRequired
              />
              <Input
                name="receiverState"
                placeholder="State (optional)"
                value={formData.receiverState}
                onChange={handleChange}
              />
              <Input
                name="receiverZip"
                placeholder="Zip"
                value={formData.receiverZip}
                onChange={handleChange}
                isRequired
              />
              <Input
                name="receiverPhone"
                placeholder="Phone"
                value={formData.receiverPhone}
                onChange={handleChange}
                isRequired
              />
              <Input
                name="receiverEmail"
                placeholder="Email (optional)"
                value={formData.receiverEmail}
                onChange={handleChange}
              />
              <Input
                name="receiverCountry"
                placeholder="Country"
                value={formData.receiverCountry}
                onChange={handleChange}
                isRequired
              />
            </VStack>
          </HStack>

          <Divider borderColor="gray.700" />

          {/* Pickup and Signature Options */}
          <HStack align="center" spacing={4}>
            <label>
              <input
                type="checkbox"
                name="pickup"
                checked={formData.pickup}
                onChange={handleChange}
              />{" "}
              Pickup
            </label>
            <label>
              <input
                type="checkbox"
                name="signature"
                checked={formData.signature}
                onChange={handleChange}
              />{" "}
              Signature
            </label>
          </HStack>

          {/* Pickup Details */}
          {showPickupDetails && (
            <VStack align="start" spacing={4}>
              <Text fontSize="xl" fontWeight="bold">
                Pickup Details
              </Text>
              <HStack spacing={4} w="full">
                <Input
                  name="pickupDate"
                  type="date"
                  value={formData.pickupDate}
                  onChange={handleChange}
                  isRequired
                />
                <Input
                  name="fromPickupTime"
                  type="time"
                  value={formData.fromPickupTime}
                  onChange={handleChange}
                  isRequired
                />
                <Input
                  name="toPickupTime"
                  type="time"
                  value={formData.toPickupTime}
                  onChange={handleChange}
                  isRequired
                />
              </HStack>
              <VStack align="start" spacing={4} w="full">
                <Text fontSize="xl" fontWeight="bold">
                  Pickup Location Information
                </Text>
                <Input
                  name="pickupName"
                  placeholder="Name"
                  value={formData.pickupName}
                  onChange={handleChange}
                  isRequired
                />
                <Input
                  name="pickupStreet"
                  placeholder="Street"
                  value={formData.pickupStreet}
                  onChange={handleChange}
                  isRequired
                />
                <Input
                  name="pickupStreet2"
                  placeholder="Street 2 (optional)"
                  value={formData.pickupStreet2}
                  onChange={handleChange}
                />
                <Input
                  name="pickupCity"
                  placeholder="City"
                  value={formData.pickupCity}
                  onChange={handleChange}
                  isRequired
                />
                <Input
                  name="pickupState"
                  placeholder="State (optional)"
                  value={formData.pickupState}
                  onChange={handleChange}
                />
                <Input
                  name="pickupZip"
                  placeholder="Zip"
                  value={formData.pickupZip}
                  onChange={handleChange}
                  isRequired
                />
                <Input
                  name="pickupPhone"
                  placeholder="Phone"
                  value={formData.pickupPhone}
                  onChange={handleChange}
                  isRequired
                />
                <Input
                  name="pickupCountry"
                  placeholder="Country"
                  value={formData.pickupCountry}
                  onChange={handleChange}
                  isRequired
                />
              </VStack>
            </VStack>
          )}

          <Divider borderColor="gray.700" />

          {/* Shipment Details */}
          <VStack align="start" spacing={6} className="bg-gray-800">
            <Text fontSize="xl" fontWeight="bold">
              Shipment Details
            </Text>
            <Select
              name="shipmentPurpose"
              value={formData.shipmentPurpose}
              onChange={handleChange}
              placeholder="Select Shipment Purpose"
              isRequired
              className="bg-inherit"
              // color="black" 
            >
              <option className="text-black" value="Gift">Gift (recommended)</option>
              <option className="text-black" value="Sample">Sample</option>
              <option  className="text-black"value="Commercial">Commercial</option>
              <option className="text-black" value="Return">Return</option>
              <option className="text-black" value="Repair">Repair</option>
              <option className="text-black" value="Personal Effects">Personal Effects</option>
              <option className="text-black"value="Personal Use">Personal Use</option>
              
            </Select>

            <Text>Currency</Text>
            <Box
              border="0.5px solid"
              borderColor="blue.100"
              px={2}
              py={1}
              borderRadius="md"
              w="full"
            >
              <Text>{formData.currency}</Text>
            </Box>

            <Button colorScheme="blue" onClick={handleAddItem}>
              Add Item
            </Button>

            {items.map((item, index) => (
              <HStack key={index} spacing={4} w="full">
                <Input
                  name="units"
                  placeholder="Units"
                  value={item.units}
                  onChange={(e) =>
                    handleItemChange(index, "units", e.target.value)
                  }
                  isRequired
                />
                <Input
                  name="description"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) =>
                    handleItemChange(index, "description", e.target.value)
                  }
                />
                <Input
                  name="weight"
                  placeholder="Weight"
                  value={item.weight}
                  onChange={(e) =>
                    handleItemChange(index, "weight", e.target.value)
                  }
                  isRequired
                />
                <Input
                  name="value"
                  placeholder="Value"
                  value={item.value}
                  onChange={(e) =>
                    handleItemChange(index, "value", e.target.value)
                  }
                  isRequired
                />
                <Input
                  name="tariff"
                  placeholder="Tariff"
                  value={item.tariff}
                  onChange={(e) =>
                    handleItemChange(index, "tariff", e.target.value)
                  }
                  isRequired
                />
                <Button
                  colorScheme="red"
                  onClick={() => handleDeleteItem(index)}
                >
                  Delete
                </Button>
              </HStack>
            ))}

            <Textarea
              name="specialNotes"
              placeholder="Special Notes (Optional)"
              value={formData.specialNotes}
              onChange={handleChange}
            />
          </VStack>

          <Button colorScheme="blue" type="submit">
            Create Order
          </Button>
        </VStack>
      </form>
    </Box>
    </div>
  );
}

export default CreateFedexOrder;
