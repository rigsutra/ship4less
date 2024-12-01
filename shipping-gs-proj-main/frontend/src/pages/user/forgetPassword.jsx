import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  Heading,
  VStack,
  HStack,
  Icon,
  Spinner,
  useToast,
  Avatar,
  Container,
  useColorModeValue,
} from "@chakra-ui/react";
import { LockIcon } from "@chakra-ui/icons";
import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL;

const ForgotPassword = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!username || !email) {
      toast({
        title: "Error",
        description: "Both fields are required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${baseUrl}/api/forgotPassword`, {
        username,
        email,
      });

      const { success, message } = response.data;

      if (success) {
        toast({
          title: "Success",
          description: message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setUsername("");
        setEmail("");
      } else {
        toast({
          title: "Error",
          description: message || "Failed to send email.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "An error occurred.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="sm" py={10}>
      <Box
        bg={useColorModeValue("white", "gray.800")}
        boxShadow="lg"
        borderRadius="lg"
        p={8}
      >
        <VStack spacing={6}>
          <Avatar bg="blue.500" icon={<LockIcon boxSize="1.5rem" />} />
          <Heading as="h1" size="lg" textAlign="center">
            Forgot Password
          </Heading>
          <Text fontSize="sm" color="gray.600" textAlign="center">
            Enter your username and email to receive a password reset link.
          </Text>
        </VStack>

        <VStack as="form" onSubmit={handleSendEmail} spacing={4} mt={6}>
          <FormControl id="username" isRequired>
            <FormLabel>Username</FormLabel>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormControl>

          <FormControl id="email" isRequired>
            <FormLabel>Email Address</FormLabel>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            width="full"
            isLoading={isLoading}
            loadingText="Sending"
          >
            Send Email
          </Button>
        </VStack>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
