import React, { useState, useEffect } from "react";
import {
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Select,
  Text,
  Divider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useTable, useSortBy, usePagination } from "react-table";
import { useNavigate } from "react-router-dom";
import TopBar from "../../components/layout/TopBar";
import { useSelector } from "react-redux";
const baseUrl = import.meta.env.VITE_BASE_URL;

function Addresses() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [editData, setEditData] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  console.log(token)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${baseUrl}/api/getaddresses`, {
          headers: {
            Authorization: `Bearer ${token}`, // JWT token
          },
        });
        const jsonData = await response.json();
        setData(jsonData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = React.useMemo(
    () => [
      {
        Header: "No",
        accessor: (_, rowIndex) => rowIndex + 1,
      },
      { Header: "Name", accessor: "name" },
      { Header: "Country", accessor: "country" },
      { Header: "Date", accessor: "date", isSortable: true },
      { Header: "Street2", accessor: "street2" },
      { Header: "City", accessor: "city" },
      { Header: "State", accessor: "state" },
      { Header: "Zip", accessor: "zip" },
      {
        Header: "Action",
        Cell: ({ row }) => (
          <HStack spacing={2}>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={() => handleEdit(row.original)}
            >
              Edit
            </Button>
            <Button
              colorScheme="red"
              size="sm"
              onClick={() => handleDelete(row.original?._id)}
            >
              Delete
            </Button>
          </HStack>
        ),
      },
    ],
    []
  );

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${baseUrl}/api/deleteaddress/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          // "Content-Type": "application/json", // Ensure the content type is set to JSON
        },
      });
      if (response.ok) {
        setData((prevData) => prevData.filter((address) => address?._id !== id));
        toast({
          title: "Address Deleted",
          description: "The address has been successfully deleted.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error("Failed to delete address.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleEdit = (address) => {
    setEditData(address);
    onOpen();
  };

  console.log(editData?._id)
  // console.log(_id)
  const handleSave = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/api/updateaddress/${editData?._id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Ensure the content type is set to JSON
          },
          body: JSON.stringify(editData),
        }
      );
  
      if (response.ok) {
        const updatedAddress = await response.json();
  
        setData((prevData) =>
          prevData.map((address) =>
            address?._id === updatedAddress?._id ? updatedAddress : address
          )
        );
  
        toast({
          title: "Address Updated",
          description: "The address has been successfully updated.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
  
        onClose();
      } else {
        const errorResponse = await response.json();
        throw new Error(errorResponse.message || "Failed to update address.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  

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
    setFilter,
    gotoPage,
    toggleSortBy,
  } = useTable({ columns, data }, useSortBy, usePagination);

  const createAddress = () => navigate("/CreateAddresses");

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    setFilter("name", value || undefined);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortOrder(value);
    toggleSortBy("no", value === "asc");
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="">
      <TopBar title={"Addresses"}></TopBar>
    <div className="px-8 py-2  h-screen">
      <div className="flex pt-10 pb-5 items-center justify-between">
        <p className="text-heading2-bold text-sm">Addresses History</p>
        <Button colorScheme="blue" onClick={createAddress}>
          + Create Address
        </Button>
      </div>
      <Divider className="bg-grey-200 mb-8" />
      <VStack spacing={4} align="stretch">
        <div className="flex items-center justify-between">
          <HStack spacing={2}>
            <Input
              placeholder="Search by name"
              value={searchInput}
              onChange={handleSearch}
              width="300px"
            />
            <Button onClick={() => setSearchInput("")}>Clear</Button>
          </HStack>
          <HStack spacing={2}>
            <Text>Sort by Date:</Text>
            <Select value={sortOrder} onChange={handleSortChange} width="190px">
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </Select>
          </HStack>
        </div>

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
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? " 🔽"
                          : " 🔼"
                        : ""}
                    </span>
                  </Th>
                ))}
              </Tr>
            ))}
          </Thead>
          <Tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <Tr {...row.getRowProps()} key={row.id}>
                  {row.cells.map((cell) => (
                    <Td {...cell.getCellProps()} key={cell.column.id}>
                      {cell.render("Cell")}
                    </Td>
                  ))}
                </Tr>
              );
            })}
          </Tbody>
        </Table>

        <HStack spacing={4}>
          <Button onClick={() => gotoPage(0)} isDisabled={!canPreviousPage}>
            {"<<"}
          </Button>
          <Button
            onClick={() => gotoPage(pageIndex - 1)}
            isDisabled={!canPreviousPage}
          >
            {"<"}
          </Button>
          <Text>
            Page{" "}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>
          </Text>
          <Button
            onClick={() => gotoPage(pageIndex + 1)}
            isDisabled={!canNextPage}
          >
            {">"}
          </Button>
          <Button
            onClick={() => gotoPage(pageOptions.length - 1)}
            isDisabled={!canNextPage}
          >
            {">>"}
          </Button>
        </HStack>

        <HStack spacing={2}>
          <Text>Rows per page:</Text>
          <Input
            type="number"
            value={pageSize || ""}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "" || Number(value) > 0) {
                setPageSize(value === "" ? 10 : Number(value));
              }
            }}
            width="60px"
          />
        </HStack>
      </VStack>

      {/* Edit Modal */}
      {editData && (
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Address</ModalHeader>
            <ModalBody>
              <VStack spacing={4}>
                <Input
                  placeholder="Name"
                  value={editData.name}
                  onChange={(e) =>
                    setEditData({ ...editData, name: e.target.value })
                  }
                />
                <Input
                  placeholder="Street"
                  value={editData.street}
                  onChange={(e) =>
                    setEditData({ ...editData, street: e.target.value })
                  }
                />
                <Input
                  placeholder="Street 2"
                  value={editData.street2}
                  onChange={(e) =>
                    setEditData({ ...editData, street2: e.target.value })
                  }
                />
                <Input
                  placeholder="City"
                  value={editData.city}
                  onChange={(e) =>
                    setEditData({ ...editData, city: e.target.value })
                  }
                />
                <Input
                  placeholder="State"
                  value={editData.state}
                  onChange={(e) =>
                    setEditData({ ...editData, state: e.target.value })
                  }
                />
                <Input
                  placeholder="Zip"
                  value={editData.zip}
                  onChange={(e) =>
                    setEditData({ ...editData, zip: e.target.value })
                  }
                />
                <Input
                  placeholder="Country"
                  value={editData.country}
                  onChange={(e) =>
                    setEditData({ ...editData, country: e.target.value })
                  }
                />
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleSave}>
                Update
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
    </div>
  );
}

export default Addresses;  