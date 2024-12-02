"use client";

import React, { useState, useEffect } from 'react';
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box, Button, Heading, VStack, IconButton } from '@chakra-ui/react';
import { CloseIcon, HamburgerIcon, AddIcon, SettingsIcon  } from '@chakra-ui/icons';
import { MdOutlineFileUpload } from "react-icons/md";
import UploadFileModal from "../functions/UploadFileModal";
import SettingsModal from "../functions/SettingsModal";
import axios from 'axios'


type QueryContent = {
    id: number,
    prompt: string;
    response: string;
    date: string;
    good_prompt: boolean;
    bad_prompt: boolean;
    rewrite: boolean;
  };





type SidebarProps = {
    isOpen: boolean;
    toggleSidebar: () => void;
}

const Sidebar = ({  isOpen, toggleSidebar}: SidebarProps) => {
    const [isUploadOpen, setUploadIsOpen] = useState(false);
    const [isSettingsOpen, setSettingsIsOpen] = useState(false);
    const [todaysPrompts, setTodaysPrompts] = useState<QueryContent[]>([]);
    const [yesterdaysPrompts, setYesterdaysPrompts] = useState<QueryContent[]>([]);
    const [lastWeeksPrompts, setLastWeeksPrompts] = useState<QueryContent[]>([]);
    const onUploadOpen = () => setUploadIsOpen(true);
    const onSettingsOpen = () => setSettingsIsOpen(true);
    const onUploadClose = () => setUploadIsOpen(false);
    const onSettingsClose = () => setSettingsIsOpen(false);

    useEffect(() => {
        fetchData();
      }, []); 
      
        const fetchData = async () => {
          try {
        
            const response = await fetch('./data/queries.json');
            if (!response.ok) {
              throw new Error('Failed to load data');
            }
        
            const data: QueryContent[] = await response.json();
            
            const today = new Date()
            const present = new Date(today)
            const yesterday = new Date(today);
            const twodaysFromToday = new Date(today);
            const weekFromToday = new Date(today);
            
            //present.setDate(today.getDate() - 1);
            yesterday.setDate(today.getDate() - 1);
            twodaysFromToday.setDate(today.getDate() - 2);
            weekFromToday.setDate(today.getDate() - 7);
            
            
            
            const today_str = today.toISOString().slice(0, 10);
            console.log(today_str)
            const yesterday_str = yesterday.toISOString().slice(0, 10);
            console.log(yesterday_str)
            const twodaysFromToday_str = twodaysFromToday.toISOString().slice(0, 10);
            const weekFromToday_str = weekFromToday.toISOString().slice(0, 10);

            
            // filter the dates
            const todaysData = data.filter((item) => item.date.startsWith(today_str));
            const yesterdaysData = data.filter((item) => item.date.startsWith(yesterday_str));
            const lastWeeksData = data.filter((item) => item.date >= weekFromToday_str && item.date <= twodaysFromToday_str);
            // Set today's prompts
            setTodaysPrompts(todaysData);
            setYesterdaysPrompts(yesterdaysData);
            setLastWeeksPrompts(lastWeeksData);
            console.log(todaysData);
          } catch (error) {
            console.error('Error fetching data:', error);
          }
        };

        const newChat = async () => {
            try {
                const empty_list: QueryContent[] = [];
                await axios.post('http://127.0.0.1:5001/api/new_chat', { empty_list })
                //fetchData();
            } catch (error) {
                console.log(error)
            }
        }
  
    return (
        <>

            <Box as="nav" width={isOpen ? "20%" : "0"} bg="brand.overlay" color="white" p={isOpen ? 4 : 0} transition="width 0.3s, padding 0.3s" overflow="hidden" position="fixed" zIndex={1000} height="100vh">
                {isOpen && (
                    <IconButton icon={<CloseIcon />} onClick={toggleSidebar} aria-label="Close Sidebar" position="fixed" top="16px" left="10px"  color="white" bg="brand.icon" boxShadow="0px 4px 6px rgba(0, 0, 0, 0.1)" zIndex={1100} />
                )}
                {isOpen && (
                    <VStack align="start" h="100vh">
                        <VStack paddingTop="60px" width="100%" h="90vh">
                            <Button paddingTop="20px" paddingBottom="20px" leftIcon={<AddIcon />} onClick={newChat} aria-label="New Chat"  color="white" bg="brand.icon" width="100%" zIndex={1100} boxShadow="0px 4px 6px rgba(0, 0, 0, 0.1)" borderRadius="10px">
                                New Chat
                            </Button>
                            <Heading paddingTop="20px" fontSize='lg' color="brand.icon" >Chat History</Heading>
                            <Accordion defaultIndex={[0]} allowMultiple color="brand.icon" width="100%">
                                <AccordionItem>
                                    <h2>
                                    <AccordionButton>
                                        <Box as='span' flex='1' textAlign='left' fontSize="xl">
                                        Today
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                    </h2>
                                    <AccordionPanel pb={4}>
                                        <VStack textAlign="left">
                                        {todaysPrompts.map((item, index) => (
                                            <Button key={index} colorScheme="gray" variant="ghost" color="brand.icon" width="100%" fontSize="lg" justifyContent="flex-start">
                                                {(index+1) + ")  " + (item.prompt.length > 20 ? item.prompt.slice(0, 20) + "..." : item.prompt)}
                                            </Button>
                                        ))}
                                        </VStack>
                                    </AccordionPanel>
                                </AccordionItem>

                                <AccordionItem>
                                    <h2>
                                    <AccordionButton>
                                        <Box as='span' flex='1' textAlign='left' fontSize="xl">
                                        Yesterday
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                    </h2>
                                    <AccordionPanel pb={4}>
                                    <VStack textAlign="left">
                                    {yesterdaysPrompts.map((item, index) => (
                                            <Button key={index} colorScheme="gray" variant="ghost" color="brand.icon" width="100%" fontSize="lg" justifyContent="flex-start">
                                                {(index+1) + ")  " + (item.prompt.length > 20 ? item.prompt.slice(0, 20) + "..." : item.prompt)}
                                            </Button>
                                        ))}
                                        </VStack>
                                    </AccordionPanel>
                                </AccordionItem>
                                <AccordionItem>
                                    <h2>
                                    <AccordionButton>
                                        <Box as='span' flex='1' textAlign='left' fontSize="xl">
                                        Last week
                                        </Box>
                                        <AccordionIcon />
                                    </AccordionButton>
                                    </h2>
                                    <AccordionPanel pb={4}>
                                    <VStack textAlign='left'>
                                    {lastWeeksPrompts.map((item, index) => (
                                            <Button key={index} colorScheme="gray" variant="ghost" color="brand.icon" width="100%" fontSize="lg" justifyContent="flex-start">
                                                {(index+1) + ")  " + (item.prompt.length > 20 ? item.prompt.slice(0, 20) + "..." : item.prompt)}
                                            </Button>
                                        ))}
                                        </VStack>
                                    </AccordionPanel>
                                </AccordionItem>
                            </Accordion>
                        </VStack>
                    </VStack>
                )}
            </Box>

            {!isOpen && (
                <IconButton icon={<HamburgerIcon />} onClick={toggleSidebar} aria-label="Open Sidebar" position="fixed" top="16px" left="10px"  color="white" bg="brand.icon" boxShadow="0px 4px 6px rgba(0, 0, 0, 0.1)" zIndex={1100} />
            )}

            <Button leftIcon={<MdOutlineFileUpload />} onClick={onUploadOpen} aria-label="Add File"  color="white" bg="brand.icon" position="fixed" top="16px" right="60px" zIndex={1100} boxShadow="0px 4px 6px rgba(0, 0, 0, 0.1)" borderRadius="10px">
                Upload Files
            </Button>
            <IconButton icon={<SettingsIcon />} onClick={onSettingsOpen} aria-label="Settings" position="fixed" top="16px" right="10px"  color="white" bg="brand.icon" boxShadow="0px 4px 6px rgba(0, 0, 0, 0.1)" zIndex={1100} />
            <UploadFileModal isOpen={isUploadOpen} onClose={onUploadClose} />
            <SettingsModal isOpen={isSettingsOpen} onClose={onSettingsClose} />

        </>
    );
};

export default Sidebar;
