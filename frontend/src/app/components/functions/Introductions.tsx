import React, { useState, useEffect } from "react";
import { Box, VStack, Text } from "@chakra-ui/react";
import { motion } from "motion/react"

const Introductions = () => {
  const phrase = "Welcome back!";
  const phrase2 = "Please enter your query"
  const queries = ["What is PCAP glass touchscreen?", "Create an outline for a manual...", "Expand on the installation steps for...", "Find all the occurrences of..."];


  const letters = phrase.split("");

  const letter_variants = {
    hidden: { opacity: 0 },
    visible: (index: number) => ({
      opacity: 1,
      transition: { delay: index * 0.1 },
    }),
  };

  const example_variants = {
    hidden: { opacity: 0 },
    visible: (index: number) => ({
      opacity: 1,
      transition: { delay: index * .5 },
    }),
  };

  const handleModalClick = async (query: string) => {
    return
  }


  return (
    <VStack>
      <motion.h1 style={{ fontSize: "75px", textAlign: "center", color: "#474747", fontWeight: "bold" }}>
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            variants={letter_variants}
            initial="hidden"
            animate="visible"
            custom={index}
          >
            {letter}
          </motion.span>
        ))}
      </motion.h1>
      <Box flexWrap="wrap" display="flex" justifyContent="center" gap="20px">
        {queries.map((query, index) => (
          <motion.div
            key={index}
            layoutId={`modal-${index}`}
            style={{
              width: "300px",
              height: "100px",
              backgroundColor: "white",
              boxShadow: "0px 0px 6px 3px rgba(0, 0, 0, 0.1)",
              color: "#474747",
              display: "flex",
              flexDirection: "column", // Ensures items stack vertically
              justifyContent: "center", // Center the content vertically
              alignItems: "center", // Center the content horizontally
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
              border: "2px solid transparent",
              transition: "border-color 0.3s ease-in-out",
              position: "relative", // Necessary for the positioned circle
            }}
            variants={example_variants}
            initial="hidden"
            animate="visible"
            custom={index}
            whileHover={{ borderColor: "#474747" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleModalClick(query)}
          >
            {/* Circle with index */}
            <Box
              position="absolute"
              top="5px"
              left="5px"
              width="20px"
              height="20px"
              backgroundColor="#474747"
              color="white"
              borderRadius="50%"
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Text fontSize="10px" fontWeight="bold">
                {index + 1}
              </Text>
            </Box>

            {/* Main content */}
            <Text>{query}</Text>
          </motion.div>
        ))}
  </Box>


    </VStack>
  );
};

export default Introductions;
