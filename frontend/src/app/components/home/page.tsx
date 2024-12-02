"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUpIcon } from '@chakra-ui/icons';
import { IoIosInformationCircle } from "react-icons/io";
import { Alert, AlertIcon, AlertDescription, AlertTitle, Box, VStack, SkeletonText, HStack, Textarea, Tabs, TabList, Tab, PopoverContent, PopoverBody, Popover, PopoverArrow, PopoverTrigger, PopoverHeader,PopoverCloseButton, IconButton, Text } from '@chakra-ui/react';
import PromptCards from '../promptCards';
import Introductions from '../functions/Introductions'

import axios from 'axios';

type QueryContent = {
    id: number,
    prompt: string;
    response: string;
    date: string;
    good_prompt: boolean;
    bad_prompt: boolean;
    rewrite: boolean;
  };

const Home: React.FC = () => {
    


    const importantInfo = " When using large language models (LLMs), be aware that they can unintentionally produce biased, incorrect, or inappropriate responses, sometimes even exposing sensitive information. Always have human oversight, especially for important decisions, and set up guidelines to filter harmful content. Also, keep in mind that these models can be costly to run and might need extra tuning for highly specific tasks."
    const [query, setQuery] = useState<string>('');
    const [prompts, setPrompts] = useState<QueryContent[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<string>('private');
    const [loading, setLoading] = useState<boolean>(false);

    const apiEndpoint = selectedTab === 'private' 
        ? 'http://127.0.0.1:5001/api/private_query'
        : 'http://127.0.0.1:5002/api/public_query';

    const handleTabChange = (tab: string) => {
        setSelectedTab(tab);
        setError(null);
    };
    
    
    const fetchData = async () => {
        try {
          const response = await fetch('./data/queries.json');
          if (!response.ok) {
            throw new Error('Failed to load data');
          }
      
          const data: QueryContent[] = await response.json();
          setPrompts(data);     
        } catch (error) {
          console.log(error);
        }
      };
      
      useEffect(() => {
        fetchData();
      }, []);

    const handleQuerySubmit = async () => {
        if (!query.trim()) {
            setError('Please enter a query.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await axios.post(apiEndpoint, { query });
            fetchData();
            setQuery('');
            
        } catch (err) {
            console.error("Error:", err);
            setError("Error connecting to the server.");
        } finally {
            setLoading(false);
        }
    };

    // Handle Enter key for submission
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleQuerySubmit();
        }
    };

    return (
        <VStack>
            <Box
                width="800px"
                height="80vh" // Set max height for scrollability
                overflowY="auto"
                sx={{'&::-webkit-scrollbar': {display: 'none',},}}
            >
               {(loading || prompts.length > 0) ? <PromptCards data={prompts} /> : <Introductions />}
               {loading && <SkeletonText noOfLines={3} spacing="3" skeletonHeight="2" />}
               
            </Box>

            <Box display="flex"
                flexDirection="column"
                justifyContent="flex-end" height="" overflowY="auto" alignItems="center">
            <Tabs variant='unstyled' width="800px" onChange={(index) => handleTabChange(index === 0 ? 'private' : 'public')}>
                <TabList justifyContent="center">
                    <Tab color={selectedTab === 'private' ? 'white' : 'gray.600'} bg={selectedTab === 'private' ? "brand.icon" : 'gray.100'} borderTopLeftRadius="10px">Private</Tab>
                    <Tab color={selectedTab === 'public' ? 'white' : 'gray.600'} bg={selectedTab === 'public' ? "brand.icon" : 'gray.100'} borderTopRightRadius="10px">Public</Tab>
                </TabList>
            </Tabs>
            
                <VStack width="800px">
                    <Box width="85%" position="relative">
                        <Textarea
                            placeholder="Type your message here..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyPress}
                            focusBorderColor="brand.icon"
                            height="55px"
                            rows={2}
                            borderRadius="20px"
                            py="10px"
                            px="50px"
                            resize="none"
                            bg="white"
                            boxShadow="0px 0px 6px 3px rgba(0, 0, 0, 0.1)"
                            fontSize="xl"
                            sx={{'&::-webkit-scrollbar': {display: 'none',},}}
                            disabled={loading}
                        />
                        <IconButton
                            aria-label="Submit"
                            icon={<ArrowUpIcon />}
                            bg="brand.icon"
                            color="white"
                            position="absolute"
                            top="8px"
                            right="10px"
                            borderRadius="50%"
                            zIndex="1"
                            onClick={handleQuerySubmit}
                        />
                    </Box>
                    {error && (
                    <Alert status='error' gap={5} width="100%">
                        <AlertIcon />
                        <AlertTitle>Connection Issue</AlertTitle>
                        <AlertDescription>Unable to connect to the model. Please try again</AlertDescription>
                    </Alert>
                )}
                </VStack>


            {/* Footer Info */}
            <HStack mt={3}>
                <Text textAlign="center" size="sm" color="gray">
                    Documentation Tool can make mistakes. Check important info.
                </Text>
             
                <Popover>
                <PopoverTrigger>
                    <IconButton 
                        aria-label="Info" 
                        icon={<IoIosInformationCircle />} 
                        bg="transparent" 
                        _hover={{ bg: "transparent", color: "brand.icon_background" }} 
                        color="brand.icon"
                        _active={{ bg: "transparent" }} 
                    />
                </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverHeader>Important Info</PopoverHeader>
        <PopoverBody>{importantInfo}</PopoverBody>
      </PopoverContent>
    </Popover>
   
            </HStack>
            </Box>
            </VStack>
    );
};

export default Home;


// "use client";

// import React, { useEffect, useState } from 'react';
// import { ArrowUpIcon } from '@chakra-ui/icons';
// import { IoIosInformationCircle } from "react-icons/io";
// import { Box, VStack, Flex, Text, HStack, Textarea, IconButton, Tabs, TabList, Tab } from '@chakra-ui/react';
// import PromptCards from '../promptCards/index'
// import axios from 'axios';

// type QueryContent = {
//     prompt: string;
//     response: string;
//     date: string;
//     good_prompt: boolean;
//     rewrite: boolean;
// };

// const options: Intl.DateTimeFormatOptions = {
//     year: 'numeric',
//     month: '2-digit',
//     day: '2-digit',
//     timeZone: 'America/Phoenix' 
// };

// const Home: React.FC = () => {

//     const [query, setQuery] = useState<string>('');
//     const [response, setResponse] = useState<string | null>(null);
//     const [error, setError] = useState<string | null>(null);

//     useEffect(() => {
//         fetchData();
//     }, []);

//     const handleQuerySubmit = async () => {
        

//         try {

//             const res = await axios.post('http://127.0.0.1:5000/api/query', {
//                 query: query
//             });

//             console.log("Submitted query:", query);
//             console.log("Response from backend:", res.data.message);
//             fetchData();

//             setResponse(res.data.message);
//             setQuery('');
//             setError(null);
//         } catch (err: any) {
//             console.error("Error fetching data:", err);
//             if (err.response) {
//                 setError(`Backend error: ${err.response.status} ${err.response.statusText}`);
//             } else if (err.request) {
//                 setError("No response from the backend.");
//             } else {
//                 setError("Error setting up request.");
//             }
//             setResponse(null);
//         }
//     };
//     const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//         if (e.key === 'Enter') {
//           e.preventDefault();  // Prevents default behavior (newline in Textarea)
//           handleQuerySubmit();  // Trigger the submit function
//         }
//       };

//     const [todaysPrompts, setTodaysPrompts] = useState<QueryContent[]>([]);

//     const fetchData = async () => {
//         try {

//             const response = await fetch('./data/queries.json');
//             if (!response.ok) {
//                 throw new Error('Failed to load data');
//             }
//             const data: QueryContent[] = await response.json();
//             const today = new Intl.DateTimeFormat('en-CA', options).format(new Date());  
//             const todaysData = data.filter((item) => item.date.startsWith(today));

//             setTodaysPrompts(todaysData);
//         } catch (error) {
//             console.error('Error fetching data:', error);
//         }
//     };

   

//     return (
//         <Flex direction="column" h="100vh" width="100%" alignItems="center" justifyContent="space-between" padding={5}>

//             <VStack spacing={4} width="800px" flex="1" overflowY="auto" py={10} sx={{
//         '&::-webkit-scrollbar': {
//             display: 'none',
//         },
//         '-ms-overflow-style': 'none',  // IE and Edge
//         'scrollbar-width': 'none',     // Firefox
//     }}>
//                 <PromptCards data={todaysPrompts} />
//             </VStack>

//             <Flex width="100%" justifyContent="center">
//                 <VStack>
//                     <Tabs>
//                         <TabList>
//                             <Tab color="brand.icon">Private</Tab>
//                             <Tab color="brand.icon">Public</Tab>
                           
//                         </TabList>
//                     </Tabs>
//                     <Box width="800px" position="relative">

//                         <Textarea placeholder="Message Documentation Tool" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyPress} focusBorderColor="brand.icon_background" height="auto" rows={1} borderRadius="20px" overflow="hidden" lineHeight="1.5" py="10px" px="50px" resize="none" flex="1" bg="white" boxShadow="0px 0px 6px 3px rgba(0, 0, 0, 0.1)" />
//                         <IconButton aria-label="Submit" icon={<ArrowUpIcon />} bg='brand.icon_background' color='brand.icon' position="absolute" top="3px" left="757px" borderRadius="20px" zIndex="1" onClick={handleQuerySubmit} />
//                     </Box>
//                 </VStack>
//             </Flex>
//             <HStack>
//                 <Text textAlign="center" size="sm" color="gray">
//                     Documentation Tool can make mistakes. Check important info.
//                 </Text>
//                 <IconButton aria-label="Info" icon={<IoIosInformationCircle />} bg="transparent" _hover={{ bg: "transparent" }} color='brand.icon_background' _active={{ bg: "transparent" }} />
//             </HStack>
//         </Flex>


//     );
// };

// export default Home;

