// src/pages/AdminFAQs.jsx
import React, { useState, useEffect } from "react";
import { Box, Input, Button, VStack, Text, HStack } from "@chakra-ui/react";
import axios from "axios";
import TopBar from "../../components/layout/TopBar";
const baseUrl = import.meta.env.VITE_BASE_URL;
function AdminFAQs() {
  const [faqs, setFaqs] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState("");
  const [editingAnswer, setEditingAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch FAQs
  useEffect(() => {
    const fetchFAQs = async () => {
      // setLoading(true);
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

  // Create FAQ
  const handleCreateFAQ = async () => {
    if (!newQuestion || !newAnswer) return;

    try {
      const response = await axios.post(
        `${baseUrl}/api/createFaqs`,
        {
          question: newQuestion,
          answer: newAnswer,
        }
      );
      setFaqs([...faqs, response.data]);
      setNewQuestion("");
      setNewAnswer("");
    } catch (error) {
      console.error("There was an error creating the FAQ!", error);
    }
  };

  // Delete FAQ
  const handleDeleteFAQ = async (id) => {
    try {
      await axios.delete(`${baseUrl}/api/deleteFaq/${id}`);
      setFaqs(faqs.filter((faq) => faq._id !== id));
    } catch (error) {
      console.error("There was an error deleting the FAQ!", error);
    }
  };

  // Start Editing FAQ
  const startEditing = (id, question, answer) => {
    setEditingId(id);
    setEditingQuestion(question);
    setEditingAnswer(answer);
  };

  // Update FAQ
  const handleUpdateFAQ = async () => {
    if (!editingQuestion || !editingAnswer) return;

    try {
      const response = await axios.put(
        `${baseUrl}/api/updateFaq/${editingId}`,
        {
          question: editingQuestion,
          answer: editingAnswer,
        }
      );
      setFaqs(faqs.map((faq) => (faq._id === editingId ? response.data : faq)));
      setEditingId(null);
      setEditingQuestion("");
      setEditingAnswer("");
    } catch (error) {
      console.error("There was an error updating the FAQ!", error);
    }
  };

  return (
    <div>
      <TopBar title={"FAQ Managment"}></TopBar>
    <Box p={4} className="h-screen">
      <Text fontSize="2xl" mb={4}>
        FAQs Management
      </Text>

      {/* Add FAQ Section */}
      <VStack spacing={4} mb={6}>
        <Input
          placeholder="New Question"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
        />
        <Input
          placeholder="New Answer"
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
        />
        <Button
          colorScheme="blue"
          onClick={handleCreateFAQ}
          disabled={!newQuestion || !newAnswer}
        >
          Add FAQ
        </Button>
      </VStack>

      {/* FAQ List */}
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        faqs.map((faq) => (
          <Box key={faq._id} p={4} borderWidth="1px" borderRadius="md" mb={4}>
            {editingId === faq._id ? (
              // Editing Mode
              <VStack spacing={3}>
                <Input
                  placeholder="Edit Question"
                  value={editingQuestion}
                  onChange={(e) => setEditingQuestion(e.target.value)}
                />
                <Input
                  placeholder="Edit Answer"
                  value={editingAnswer}
                  onChange={(e) => setEditingAnswer(e.target.value)}
                />
                <Button colorScheme="green" onClick={handleUpdateFAQ}>
                  Save
                </Button>
                <Button colorScheme="red" onClick={() => setEditingId(null)}>
                  Cancel
                </Button>
              </VStack>
            ) : (
              // Display Mode
              <Box>
                <Text fontWeight="bold">{faq.question}</Text>
                <Text>{faq.answer}</Text>
                <HStack mt={4}>
                  <Button
                    colorScheme="yellow"
                    onClick={() =>
                      startEditing(faq._id, faq.question, faq.answer)
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    colorScheme="red"
                    onClick={() => handleDeleteFAQ(faq._id)}
                  >
                    Delete
                  </Button>
                </HStack>
              </Box>
            )}
          </Box>
        ))
      )}
    </Box>
    </div>
  );
}

export default AdminFAQs;
