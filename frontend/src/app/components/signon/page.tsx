"use client";

import React, { useState, useEffect } from 'react';
import { Box, HStack, VStack, Textarea,Text,  Button } from "@chakra-ui/react";
import { motion } from "motion/react"

const Signon: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [query, setQuery] = useState<string>('');

    const signup_user = async () => {

    }

    return (
        <VStack width="100%">
            <motion.h1 style={{ fontSize: "75px", textAlign: "center", color: "#474747", fontWeight: "bold" }}>
                Sign up
            </motion.h1>
            <motion.div>
            <VStack gap={6}>
            <Textarea
                placeholder="Email"
                value={query}
                focusBorderColor="brand.icon"
                height="55px"
                width="400px"
                rows={2}
                borderRadius="10px"
                py="10px"
                px="50px"
                resize="none"
                bg="white"
                boxShadow="0px 0px 6px 3px rgba(0, 0, 0, 0.1)"
                fontSize="xl"
                sx={{'&::-webkit-scrollbar': {display: 'none',},}}
                disabled={loading}/>
            <Textarea
                placeholder="Create Password"
                value={query}
                focusBorderColor="brand.icon"
                height="55px"
                width="400px"
                rows={2}
                borderRadius="10px"
                py="10px"
                px="50px"
                resize="none"
                bg="white"
                boxShadow="0px 0px 6px 3px rgba(0, 0, 0, 0.1)"
                fontSize="xl"
                sx={{'&::-webkit-scrollbar': {display: 'none',},}}
                disabled={loading}
                        />
                        <Textarea
                placeholder="Confirm Password"
                value={query}
                focusBorderColor="brand.icon"
                height="55px"
                width="400px"
                rows={2}
                borderRadius="10px"
                py="10px"
                px="50px"
                resize="none"
                bg="white"
                boxShadow="0px 0px 6px 3px rgba(0, 0, 0, 0.1)"
                fontSize="xl"
                sx={{'&::-webkit-scrollbar': {display: 'none',},}}
                disabled={loading}
                        />
                <Button aria-label="Submit"
                            textColor="white"
                            fontSize="xl"
                            bg="brand.icon"
                            color="white"
                            height="55px"
                            width ="400px"
                            borderRadius="10px"
                            onClick={signup_user}>
                    signup
                </Button>
                <HStack>
                <Text>If you already have account</Text>
                <Button textColor="black"
                        bg="white"
                        padding="0"
                        >login</Button>
                </HStack>
                
               
                </VStack>
            
            </motion.div>
            
        </VStack>
    );
}

export default Signon;