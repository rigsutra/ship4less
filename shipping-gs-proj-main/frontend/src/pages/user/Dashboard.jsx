import React, { useEffect, useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Divider,
  VStack,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Box,
  Spinner,
  IconButton,
  Flex,
  HStack,
} from "@chakra-ui/react";
import { CircleDollarSign, ShoppingBag } from "lucide-react";
import { useTable, useSortBy, usePagination } from "react-table";
import { ViewIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import TopBar from "../../components/layout/TopBar";
import { useSelector } from "react-redux";

const baseUrl = import.meta.env.VITE_BASE_URL;

function Dashboard() {
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [fedexOrders, setFedexOrders] = useState([]);
  const [fedexInternationalOrders, setFedexInternationalOrders] = useState([]);
  const [uspsOrders, setUspsOrders] = useState([]);
  const [dhlOrders, setDhlOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [userName, setUser] = useState("");
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);

  // Load user data from sessionStorage
  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing stored user data", error);
      }
    }
  }, []);

  // Fetch orders from the server
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        const responses = await Promise.allSettled([
          fetch(`${baseUrl}/api/getAllOrdersdomestic`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${baseUrl}/api/getAllOrdersInternational`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(
            `${baseUrl}/api/uspsorders?page=1&limit=100&sort=${sortOrder}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          fetch(`${baseUrl}/api/dhlOrders?page=1&limit=100&sort=${sortOrder}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [fedexData, fedexInternationalData, uspsData, dhlData] =
          await Promise.all(
            responses.map((response) =>
              response.status === "fulfilled" ? response.value.json() : []
            )
          );

        setFedexOrders(fedexData || []);
        setFedexInternationalOrders(fedexInternationalData || []);
        if (uspsData && Array.isArray(uspsData.orders)) {
          setUspsOrders(uspsData.orders);
          const revenue = uspsData.orders.reduce(
            (acc, order) => acc + (parseFloat(order.total_price) || 0),
            0
          );
          setTotalRevenue(revenue);
        }
        setDhlOrders(dhlData?.dhlOrders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [sortOrder, token]);

  // Combine orders into a single array with a unified format
  const combinedOrders = useMemo(() => {
    const formatOrder = (order, type) => {
      if (!order) return {};
      return {
        ...order,
        orderType: type,
        price:
          parseFloat(order.price?.replace(/[^0-9.-]+/g, "")) ||
          order.total_price ||
          0,
        status: order.status || "Pending",
        createdAt: order.createdAt,
        orderId: order.orderId,
      };
    };

    return [
      ...fedexOrders.map((order) => formatOrder(order, "FedEx Domestic")),
      ...fedexInternationalOrders.map((order) =>
        formatOrder(order, "FedEx International")
      ),
      ...uspsOrders.map((order) => formatOrder(order, "UPS")),
      ...dhlOrders.map((order) => formatOrder(order, "DHL")),
    ];
  }, [fedexOrders, fedexInternationalOrders, uspsOrders, dhlOrders]);

  // Filter orders based on search input
  const filteredOrders = useMemo(() => {
    if (!searchInput.trim()) return combinedOrders;
    return combinedOrders.filter((order) =>
      Object.values(order)
        .join(" ")
        .toLowerCase()
        .includes(searchInput.toLowerCase())
    );
  }, [searchInput, combinedOrders]);

  // Navigate to order details based on order type
  const navigateToDetails = (row) => {
    const { orderType, orderId, _id } = row.original || {};
    if (!orderType || (!orderId && !_id)) return;

    let route;
    if (orderType === "UPS") {
      route = `/usps-order-details/${orderId}`;
    } else if (orderType === "DHL") {
      route = `/dhl-order-details/${_id}`;
    } else {
      route = `/fedex-order-details/${orderId}`;
    }
    navigate(route);
  };

  // Format date strings
  const formatDate = (dateString) => {
    try {
      return dateString
        ? new Date(dateString).toLocaleDateString()
        : "Invalid Date";
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Table columns configuration
  const columns = useMemo(
    () => [
      { Header: "#", accessor: (_, i) => i + 1 },
      { Header: "Order ID", accessor: "orderId" },
      {
        Header: "From",
        accessor: (row) =>
          row.fromAddress?.name || row.senderAddress?.name || "N/A",
      },
      {
        Header: "To",
        accessor: (row) =>
          row.toAddress?.name || row.receiverAddress?.name || "N/A",
      },
      { Header: "Type", accessor: "orderType" },
      { Header: "Amount", accessor: "price" },
      { Header: "Status", accessor: "status" },
      {
        Header: "Tracking",
        accessor: "tracking",
        Cell: ({ value }) =>
          value ? (
            <Button
              colorScheme="teal"
              size="sm"
              onClick={() => window.open(value, "_blank")}
            >
              Track Order
            </Button>
          ) : (
            <Text>No Tracking Available</Text>
          ),
      },
      {
        Header: "Date",
        accessor: "createdAt",
        Cell: ({ value }) => formatDate(value),
      },
      {
        Header: "Action",
        accessor: "action",
        Cell: ({ row }) => (
          <IconButton
            aria-label="View Details"
            icon={<ViewIcon />}
            colorScheme="teal"
            size="sm"
            onClick={() => navigateToDetails(row)}
          />
        ),
      },
    ],
    [navigate]
  );

  // React Table hooks
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    gotoPage,
    canPreviousPage,
    canNextPage,
    pageOptions,
    state: { pageIndex },
  } = useTable({ columns, data: filteredOrders }, useSortBy, usePagination);

  if (loading) {
    return (
      <Box p={4}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <div className="h-full">
      <TopBar title="Dashboard" />
      <div className="max-w-[100%] p-4 overflow-x-auto ">
        <div className="container mx-auto p-4 ">
          <Divider className="bg-gray-200 mb-7 mt-5" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <Card className="w-full">
              <CardHeader className="flex justify-between items-center">
                <Heading size="md">Total Order Value</Heading>
                <CircleDollarSign />
              </CardHeader>
              <CardBody>
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  <Text fontSize="lg">${totalRevenue.toFixed(2)}</Text>
                )}
              </CardBody>
            </Card>
            <Card className="w-full">
              <CardHeader className="flex justify-between items-center">
                <Heading size="md">Total Orders</Heading>
                <ShoppingBag />
              </CardHeader>
              <CardBody>
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  <Text fontSize="lg">{combinedOrders.length}</Text>
                )}
              </CardBody>
            </Card>
          </div>
          <VStack spacing={4} align="stretch" mt={6}>
            <HStack spacing={4}>
              <Input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search"
                className="w-full sm:w-auto"
              />
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full sm:w-auto"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </Select>
            </HStack>
            <div className="overflow-x-auto">
              <Table {...getTableProps()} className="table-auto w-full mt-6">
                <Thead>
                  {headerGroups.map((headerGroup) => (
                    <Tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <Th
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
                          className="px-4 py-2"
                        >
                          {column.render("Header")}
                        </Th>
                      ))}
                    </Tr>
                  ))}
                </Thead>
                <Tbody {...getTableBodyProps()}>
                  {page.map((row) => {
                    prepareRow(row);
                    return (
                      <Tr {...row.getRowProps()}>
                        {row.cells.map((cell) => (
                          <Td {...cell.getCellProps()} className="px-4 py-2">
                            {cell.render("Cell")}
                          </Td>
                        ))}
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </div>
            <Flex justify="space-between" align="center" mt={4}>
              <Button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
                First
              </Button>
              <Button
                onClick={() => gotoPage(pageIndex - 1)}
                disabled={!canPreviousPage}
              >
                Previous
              </Button>
              <Text>
                Page {pageIndex + 1} of {pageOptions.length}
              </Text>
              <Button
                onClick={() => gotoPage(pageIndex + 1)}
                disabled={!canNextPage}
              >
                Next
              </Button>
              <Button
                onClick={() => gotoPage(pageOptions.length - 1)}
                disabled={!canNextPage}
              >
                Last
              </Button>
            </Flex>
          </VStack>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
