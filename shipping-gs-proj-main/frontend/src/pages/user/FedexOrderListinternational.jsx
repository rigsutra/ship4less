import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Button,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Text,
  Divider,
  useToast,
  IconButton,
  Select,
  Box,
  Spinner,
} from "@chakra-ui/react";
import { useTable, useSortBy, usePagination } from "react-table";
import { ViewIcon, CopyIcon } from "@chakra-ui/icons";
import TopBar from "../../components/layout/TopBar";
import { useSelector } from "react-redux";

const baseUrl = import.meta.env.VITE_BASE_URL; // Ensure this is correctly set in your environment variables

function FedexOrderListInternational() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();
  const toast = useToast();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get(`${baseUrl}/api/getAllOrdersInternational`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setData(response.data);
        setLoading(false);
        console.log("Fedex International Orders:", response.data);
      } catch (error) {
        toast({
          title: "Failed to load orders",
          description: error.message || "An error occurred.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);
      }
    };
    fetchOrders();
  }, [toast]);

  const handleSearch = (e) => {
    setSearchInput(e.target.value);
  };

  const handleCreateOrder = (type) => {
    navigate(`/create-fedex-order?type=${type}`);
  };

  const handleDuplicateOrder = async (orderId) => {
    try {
      // Get token from localStorage
      const response = await axios.post(
        `${baseUrl}/api/duplicateOrderInternational/${orderId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.orderId) {
        toast({
          title: "Order Duplicated!",
          description: `New Order ID: ${response.data.orderId}`,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setLoading(true);
        const updatedResponse = await axios.get(
          `${baseUrl}/api/getAllOrdersInternational`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setData(updatedResponse.data);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error duplicating order:", error);
      toast({
        title: "Failed to Duplicate Order",
        description: error.response?.data?.message || "An error occurred.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const columns = useMemo(
    () => [
      { Header: "#", accessor: (_, i) => i + 1, disableSortBy: true },
      { Header: "Order ID", accessor: "orderId" },
      { Header: "Status", accessor: "status" },
      { Header: "Price (₹)", accessor: "price" },
      {
        Header: "Created At",
        accessor: "createdAt",
        Cell: ({ value }) => new Date(value).toLocaleDateString(),
      },
      {
        Header: "Actions",
        id: "actions",
        Cell: ({ row }) => (
          <HStack spacing={2}>
            <IconButton
              aria-label="View Details"
              icon={<ViewIcon />}
              colorScheme="teal"
              size="sm"
              onClick={() =>
                navigate(`/fedex-order-details/${row.original.orderId}`)
              }
            />
            <IconButton
              aria-label="Duplicate Order"
              icon={<CopyIcon />}
              colorScheme="purple"
              size="sm"
              onClick={() => handleDuplicateOrder(row.original.orderId)}
            />
          </HStack>
        ),
        disableSortBy: true,
      },
    ],
    [navigate]
  );

  const filteredOrders = useMemo(() => {
    if (!searchInput) return data;
    const lowercasedInput = searchInput.toLowerCase();
    return data.filter(
      (order) =>
        order.orderId.toLowerCase().includes(lowercasedInput) ||
        order.status.toLowerCase().includes(lowercasedInput)
    );
  }, [searchInput, data]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    state: { pageIndex, pageSize },
    setPageSize,
    gotoPage,
  } = useTable(
    {
      columns,
      data: filteredOrders,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useSortBy,
    usePagination
  );

  if (loading) {
    return (
      <Box p={4} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <div>
      <TopBar title={"FedEx International"} />
      <div className="px-8 py-2 h-full">
        <HStack justify="space-between" pt={10} pb={5}>
          <Text fontSize="2xl">FedEx International Orders</Text>
          <Button
            colorScheme="blue"
            onClick={() => handleCreateOrder("international")}
          >
            + Create Order
          </Button>
        </HStack>
        <Divider mb={8} />
        <VStack spacing={4} align="stretch">
          <HStack>
            <Input
              placeholder="Search by Order ID or Status"
              value={searchInput}
              onChange={handleSearch}
              width="300px"
            />
          </HStack>
          <Table {...getTableProps()} variant="simple">
            <Thead>
              {headerGroups.map((headerGroup) => (
                <Tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                  {headerGroup.headers.map((column) => (
                    <Th
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      key={column.id}
                    >
                      {column.render("Header")}
                      {column.canSort && (
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? " 🔽"
                              : " 🔼"
                            : " ↕️"}
                        </span>
                      )}
                    </Th>
                  ))}
                </Tr>
              ))}
            </Thead>
            <Tbody {...getTableBodyProps()}>
              {page.length === 0 ? (
                <Tr>
                  <Td colSpan={columns.length} textAlign="center">
                    No FedEx orders found.
                  </Td>
                </Tr>
              ) : (
                page.map((row) => {
                  prepareRow(row);
                  return (
                    <Tr {...row.getRowProps()} key={row.original.orderId}>
                      {row.cells.map((cell) => (
                        <Td {...cell.getCellProps()} key={cell.column.id}>
                          {cell.render("Cell")}
                        </Td>
                      ))}
                    </Tr>
                  );
                })
              )}
            </Tbody>
          </Table>
          <HStack justify="space-between" mt={4}>
            <HStack>
              <Button
                onClick={() => gotoPage(0)}
                disabled={!canPreviousPage}
                size="sm"
              >
                {"<<"}
              </Button>
              <Button
                onClick={() => gotoPage(pageIndex - 1)}
                disabled={!canPreviousPage}
                size="sm"
              >
                {"<"}
              </Button>
              <Button
                onClick={() => gotoPage(pageIndex + 1)}
                disabled={!canNextPage}
                size="sm"
              >
                {">"}
              </Button>
              <Button
                onClick={() => gotoPage(pageOptions.length - 1)}
                disabled={!canNextPage}
                size="sm"
              >
                {">>"}
              </Button>
              <Text>
                Page {pageIndex + 1} of {pageOptions.length}
              </Text>
            </HStack>
            <HStack spacing={2}>
              <Text>Rows per page:</Text>
              <Select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                width="80px"
                size="sm"
              >
                {[5, 10, 20, 30, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </Select>
            </HStack>
          </HStack>
        </VStack>
      </div>
    </div>
  );
}

export default FedexOrderListInternational;
