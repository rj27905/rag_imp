
"use client"

import { useState } from 'react';
import { Box, VStack } from '@chakra-ui/react';
import Sidebar from './components/sidebar';
import Home from './components/home/page';
import Signon from './components/signon/page';
import Login from './components/login/page';

function Page() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Box height="100vh" overflow="hidden">
     
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      
      <VStack
        ml = {isOpen ? "20%" : "0%"} 
    
        transition="margin-left 0.3s"
        alignItems="flex-start" 
        spacing={0} 
      >
     
        <Box
          p={4}
          bg="brand.background"
          transition="margin-left 0.3s"
          width = {isOpen ? "100%" : "100%"}
          textAlign="center" 
        >
          <Home />
        </Box>

      
      </VStack>
      
      {/*<Signon/>
      <Login/>*/}
    </Box>
  );
}

export default Page;