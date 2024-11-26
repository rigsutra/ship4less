// src/pages/AdminRevenue.jsx
import React, { useEffect, useState } from "react";
import { Box, Text, Stat, StatLabel, StatNumber } from "@chakra-ui/react";
import TopBar from "../../components/layout/TopBar";
const baseUrl = import.meta.env.VITE_BASE_URL;
function AdminRevenue() {
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchRevenue = async () => {
      const fedexResponse = await fetch(`${baseUrl}/api/fedexorder`);
      const uspsResponse = await fetch(`${baseUrl}/api/uspsorder`);
      const fedexData = await fedexResponse.json();
      const uspsData = await uspsResponse.json();

      const revenue = [...fedexData, ...uspsData].reduce(
        (acc, order) => acc + parseFloat(order.price || 0),
        0
      );
      setTotalRevenue(revenue);
    };

    fetchRevenue();
  }, []);

  return (
    <div>
      <TopBar title={"Total Revenue"}></TopBar>
    <Box className="h-screen">
      <Text fontSize="3xl" mb={4}>
        Total Revenue
      </Text>
      <Stat>
        <StatLabel>Total Revenue</StatLabel>
        <StatNumber>${totalRevenue.toFixed(2)}</StatNumber>
      </Stat>
    </Box>
    </div>
  );
}

export default AdminRevenue;
