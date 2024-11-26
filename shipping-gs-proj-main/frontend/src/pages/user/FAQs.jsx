import React, { useState, useEffect } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Box,
  Divider,
  Text,
  VStack,
  Container,
  useBreakpointValue,
} from "@chakra-ui/react";
import axios from "axios";
import TopBar from "../../components/layout/TopBar";

const baseUrl = import.meta.env.VITE_BASE_URL;

function FAQs() {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFAQs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseUrl}/api/getFaqs`);
        setFaqs(response.data);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  return (
    <div className="h-screen">
      <TopBar title={"FAQ"} />
      <Container maxW="container.md" py={8} px={{ base: 4, md: 8 }}>
        <Text
          fontSize="2xl"
          fontWeight="bold"
          mb={6}
          color="gray.700"
          textAlign="center"
        >
          Frequently Asked Questions
        </Text>
        <Divider borderColor="gray.300" mb={8} />

        {loading ? (
          <Text textAlign="center" color="gray.500">
            Loading FAQs...
          </Text>
        ) : (
          <Accordion allowToggle>
            {faqs.map((faq) => (
              <AccordionItem key={faq._id} border="none">
                <h2>
                  <AccordionButton
                    _expanded={{
                      bg: "blue.600",
                      color: "white",
                    }}
                    p={4}
                    borderRadius="md"
                    boxShadow="md"
                  >
                    <Box flex="1" textAlign="left" fontSize="lg" fontWeight="semibold">
                      {faq.question}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel
                  pb={4}
                  fontSize="md"
                  color="gray.600"
                  bg="gray.50"
                  borderRadius="md"
                  boxShadow="sm"
                  p={4}
                >
                  {faq.answer}
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </Container>
    </div>
  );
}

export default FAQs;
