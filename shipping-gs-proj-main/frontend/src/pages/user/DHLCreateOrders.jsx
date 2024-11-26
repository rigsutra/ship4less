import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Input,
  Select,
  SimpleGrid,
  VStack,
  Text,
  Flex,
  useToast,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import TopBar from "../../components/layout/TopBar";

const baseUrl = import.meta.env.VITE_BASE_URL;

const OrderFormDHL = () => {
  const [isQuickOrder, setIsQuickOrder] = useState(true);

  const handleToggle = (orderType) => {
    setIsQuickOrder(orderType === "quick");
  };

  return (
    <div>
      <TopBar title={"DHL"} />
      <Box p={6} maxW="1200px" mx="auto" className="h-screen">
        <Box display="flex" justifyContent="center" mb={4}>
          <Button
            onClick={() => handleToggle("quick")}
            colorScheme={isQuickOrder ? "blue" : "gray"}
            variant="solid"
            mr={4}
          >
            Quick Order
          </Button>
          <Button
            onClick={() => handleToggle("normal")}
            colorScheme={!isQuickOrder ? "blue" : "gray"}
            variant="solid"
          >
            Normal Order
          </Button>
        </Box>

        {isQuickOrder ? <QuickOrderFormDHL /> : <NormalOrderFormDHL />}
      </Box>
    </div>
  );
};

// Quick Order Form Component
const QuickOrderFormDHL = () => {
  const [type, setType] = useState("");
  const [weight, setWeight] = useState("");
  const [fromAddress, setFromAddress] = useState({});
  const [toAddress, setToAddress] = useState({});
  const [template, setTemplate] = useState("");
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]); // State to hold fetched addresses
  const toast = useToast();
  const { token } = useSelector((state) => state.auth);

  // Fetch saved addresses when the component mounts
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/getaddresses`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Fetched Addresses:", response.data);
        setAddresses(response.data);
      } catch (error) {
        console.error("Error fetching addresses:", error);
        toast({
          title: "Error",
          description: "Failed to fetch saved addresses.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    fetchAddresses();
  }, [token]);

  const handleQuickOrderSubmit = async () => {
    // Map address fields to match server's expected schema
    const mapAddressFields = (address) => ({
      name: address.name,
      street1: address.street || "",
      street2: address.street2 || "",
      city: address.city,
      state: address.state,
      zip_code: address.zip || "",
      country: address.country || "India",
    });

    const quickOrderData = {
      order_type: type,
      weight: parseFloat(weight) || 0,
      template: template || null,
      total_price: price,
      fromAddress: mapAddressFields(fromAddress),
      toAddress: mapAddressFields(toAddress),
    };

    try {
      setLoading(true);
      await axios.post(`${baseUrl}/api/dhlOrders/quick`, quickOrderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast({
        title: "Quick Order Submitted",
        description: "Your quick order has been submitted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error submitting quick order:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "There was an error submitting your quick order.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPrice = async (orderType) => {
    setLoading(true);
    try {
      const response = await axios.post(`${baseUrl}/api/getPricesDHL`, {
        type: orderType,
      });
      setPrice(response.data.price);
    } catch (error) {
      console.error("Error fetching price:", error);
      toast({
        title: "Error",
        description: "Failed to fetch price.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (type) {
      fetchPrice(type);
    }
  }, [type]);

  return (
    <div>
      <Box>
        <SimpleGrid columns={[1, null, 2]} spacing={6} mb={4}>
          <VStack spacing={4}>
            <Text fontSize="lg">Type</Text>
            <Select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setTemplate("");
              }}
              placeholder="Select type"
            >
              <option value="DHL Ground OZ">DHL Ground OZ</option>
              <option value="DHL Ground lb">DHL Ground lb</option>
              <option value="DHL Priority">DHL Priority</option>
              <option value="DHL Express">DHL Express</option>
              <option value="DHL Priority v2">DHL Priority v2</option>
            </Select>
          </VStack>

          <VStack>
            <Text fontSize="lg">Weight</Text>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight"
            />
          </VStack>
        </SimpleGrid>

        {type === "DHL Priority" && (
          <SimpleGrid columns={2} spacing={6} mb={4}>
            <VStack>
              <Text fontSize="lg">Template</Text>
              <Select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder="Select template"
              >
                <option value="Pitney Bowes">Pitney Bowes</option>
                <option value="Indica">Indica</option>
                <option value="EVS">EVS</option>
              </Select>
            </VStack>
          </SimpleGrid>
        )}

        <SimpleGrid columns={[1, 1, 2]} spacing={6}>
          <AddressSection
            title="From Address"
            selectedAddress={fromAddress}
            setSelectedAddress={setFromAddress}
            addresses={addresses}
          />
          <AddressSection
            title="To Address"
            selectedAddress={toAddress}
            setSelectedAddress={setToAddress}
            addresses={addresses}
          />
        </SimpleGrid>

        <Flex justify="center" mt={6}>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={handleQuickOrderSubmit}
            isLoading={loading}
          >
            Create Quick Order ₹{price}
          </Button>
        </Flex>
      </Box>
    </div>
  );
};

// Address Section Component for Quick Order
const AddressSection = ({
  title,
  selectedAddress,
  setSelectedAddress,
  addresses,
}) => (
  <VStack
    spacing={4}
    p={4}
    bg="gray.800"
    borderRadius="md"
    boxShadow="md"
    color="white"
  >
    <Text fontSize="lg" fontWeight="bold">
      {title} Address
    </Text>
    <Select
      placeholder="Select saved address"
      value={selectedAddress._id || ""}
      onChange={(e) => {
        const selected = addresses.find((addr) => addr._id === e.target.value);
        setSelectedAddress(selected || {});
      }}
      bg="white"
      color="black"
    >
      {addresses.map((addr) => (
        <option key={addr._id} value={addr._id}>
          {addr.name} - {addr.street}, {addr.city}, {addr.state}, {addr.zip}
        </option>
      ))}
    </Select>
    <Box p={2} bg="gray.700" borderRadius="md" w="100%">
      <Text>Selected Address:</Text>
      <Text>
        {selectedAddress.name}, {selectedAddress.street}, {selectedAddress.city}
        , {selectedAddress.state}, {selectedAddress.zip},{" "}
        {selectedAddress.country}
      </Text>
    </Box>
  </VStack>
);

// Normal Order Form Component
const NormalOrderFormDHL = () => {
  const [type, setType] = useState("");
  const [weight, setWeight] = useState("");
  const [template, setTemplate] = useState("");
  const [price, setPrice] = useState(0);
  const [loading, setLoading] = useState(false);

  // From Address States
  const [fromName, setFromName] = useState("");
  const [fromCompany, setFromCompany] = useState("");
  const [fromStreet1, setFromStreet1] = useState("");
  const [fromStreet2, setFromStreet2] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [fromState, setFromState] = useState("");
  const [fromZipCode, setFromZipCode] = useState("");
  const [fromCountry, setFromCountry] = useState("");

  // To Address States
  const [toName, setToName] = useState("");
  const [toCompany, setToCompany] = useState("");
  const [toStreet1, setToStreet1] = useState("");
  const [toStreet2, setToStreet2] = useState("");
  const [toCity, setToCity] = useState("");
  const [toState, setToState] = useState("");
  const [toZipCode, setToZipCode] = useState("");
  const [toCountry, setToCountry] = useState("");

  const toast = useToast();
  const { token } = useSelector((state) => state.auth);

  const handleNormalOrderSubmit = async () => {
    const normalOrderData = {
      order_type: type,
      weight: parseFloat(weight) || 0,
      template: template || null,
      total_price: price,
      fromAddress: {
        name: fromName,
        company: fromCompany,
        street1: fromStreet1,
        street2: fromStreet2,
        city: fromCity,
        state: fromState,
        zip_code: fromZipCode,
        country: fromCountry,
      },
      toAddress: {
        name: toName,
        company: toCompany,
        street1: toStreet1,
        street2: toStreet2,
        city: toCity,
        state: toState,
        zip_code: toZipCode,
        country: toCountry,
      },
    };

    try {
      setLoading(true);
      await axios.post(`${baseUrl}/api/dhlOrders/normal`, normalOrderData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast({
        title: "Normal Order Submitted",
        description: "Your normal order has been submitted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error submitting normal order:", error);
      toast({
        title: "Error",
        description: "Failed to submit the normal order.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Box>
        <SimpleGrid columns={[1, null, 2]} spacing={6} mb={4}>
          <VStack spacing={4}>
            <Text fontSize="lg">Type</Text>
            <Select
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                setTemplate("");
              }}
              placeholder="Select type"
            >
              <option value="DHL Ground OZ">DHL Ground OZ</option>
              <option value="DHL Ground lb">DHL Ground lb</option>
              <option value="DHL Priority">DHL Priority</option>
              <option value="DHL Express">DHL Express</option>
              <option value="DHL Priority v2">DHL Priority v2</option>
            </Select>
          </VStack>

          <VStack>
            <Text fontSize="lg">Weight</Text>
            <Input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight"
            />
          </VStack>
        </SimpleGrid>

        {type === "DHL Priority" && (
          <SimpleGrid columns={2} spacing={6} mb={4}>
            <VStack>
              <Text fontSize="lg">Template</Text>
              <Select
                value={template}
                onChange={(e) => setTemplate(e.target.value)}
                placeholder="Select template"
              >
                <option value="Pitney Bowes">Pitney Bowes</option>
                <option value="Indica">Indica</option>
                <option value="EVS">EVS</option>
              </Select>
            </VStack>
          </SimpleGrid>
        )}

        <SimpleGrid columns={[1, 1, 2]} spacing={6}>
          <AddressForm
            title="From Address"
            name={fromName}
            setName={setFromName}
            company={fromCompany}
            setCompany={setFromCompany}
            street1={fromStreet1}
            setStreet1={setFromStreet1}
            street2={fromStreet2}
            setStreet2={setFromStreet2}
            city={fromCity}
            setCity={setFromCity}
            state={fromState}
            setState={setFromState}
            zipCode={fromZipCode}
            setZipCode={setFromZipCode}
            country={fromCountry}
            setCountry={setFromCountry}
          />
          <AddressForm
            title="To Address"
            name={toName}
            setName={setToName}
            company={toCompany}
            setCompany={setToCompany}
            street1={toStreet1}
            setStreet1={setToStreet1}
            street2={toStreet2}
            setStreet2={setToStreet2}
            city={toCity}
            setCity={setToCity}
            state={toState}
            setState={setToState}
            zipCode={toZipCode}
            setZipCode={setToZipCode}
            country={toCountry}
            setCountry={setToCountry}
          />
        </SimpleGrid>

        <Flex justify="center" mt={6}>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={handleNormalOrderSubmit}
            isLoading={loading}
          >
            Create Normal Order ₹{price}
          </Button>
        </Flex>
      </Box>
    </div>
  );
};

// Address Form Component for Normal Orders
const AddressForm = ({
  title,
  name,
  setName,
  company,
  setCompany,
  street1,
  setStreet1,
  street2,
  setStreet2,
  city,
  setCity,
  state,
  setState,
  zipCode,
  setZipCode,
  country,
  setCountry,
}) => (
  <VStack
    spacing={4}
    p={4}
    bg="gray.800"
    borderRadius="md"
    boxShadow="md"
    color="white"
  >
    <Text fontSize="lg" fontWeight="bold">
      {title}
    </Text>
    <Input
      value={name}
      onChange={(e) => setName(e.target.value)}
      placeholder="Full Name"
    />
    <Input
      value={company}
      onChange={(e) => setCompany(e.target.value)}
      placeholder="Company Name"
    />
    <Input
      value={street1}
      onChange={(e) => setStreet1(e.target.value)}
      placeholder="Street 1"
    />
    <Input
      value={street2}
      onChange={(e) => setStreet2(e.target.value)}
      placeholder="Street 2"
    />
    <Input
      value={city}
      onChange={(e) => setCity(e.target.value)}
      placeholder="City"
    />
    <Input
      value={state}
      onChange={(e) => setState(e.target.value)}
      placeholder="State"
    />
    <Input
      value={zipCode}
      onChange={(e) => setZipCode(e.target.value)}
      placeholder="Zip Code"
    />
    <Input
      value={country}
      onChange={(e) => setCountry(e.target.value)}
      placeholder="Country"
    />
  </VStack>
);

OrderFormDHL.propTypes = {
  handleToggle: PropTypes.func.isRequired,
};

export default OrderFormDHL;
