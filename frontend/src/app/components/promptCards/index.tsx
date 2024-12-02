"use client";

import React, { useState, useEffect } from 'react';
import { Avatar, VStack, Text, Box, Heading, HStack, IconButton, SkeletonText, Tooltip, Spacer } from '@chakra-ui/react';
import { FiThumbsUp, FiThumbsDown, FiCopy } from "react-icons/fi";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import { TfiWrite } from "react-icons/tfi";
import ReactMarkdown from "react-markdown";
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

type PromptCardsProps = {
  data: QueryContent[];
};

const TextReveal = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const words = text.split(' ');
    let currentWordIndex = 0;
    const lineRevealDelay = 50;

    const revealWordByWord = () => {
      if (currentWordIndex < words.length - 1) {
        setDisplayText((prevText) => prevText + words[currentWordIndex] + ' ');
        currentWordIndex++;
        setTimeout(revealWordByWord, lineRevealDelay);
      } else {
        setLoading(false);
      }
    };

    const timer = setTimeout(revealWordByWord, lineRevealDelay);
    return () => clearTimeout(timer);
  }, [text]);

  return (
    <>
      <ReactMarkdown >
        {displayText}
      </ReactMarkdown>
      {loading && <SkeletonText noOfLines={3} spacing="3" skeletonHeight="2" />}
    </>
  );
};

const PromptCards = ({ data }: PromptCardsProps) => {
  const [copied, setCopied] = useState(false);
  const [jsonData, setJsonData] = useState<QueryContent[]>([]);
  const apiEndpoint = 'http://127.0.0.1:5001/api/rating_prompts';

  useEffect(() => {
    setJsonData(data);
  }, [data]);

  

  //console.log(jsonData);
  const handleDownload = async(response: string) => {
    //await fetchData();

    const blob = new Blob([response], { type: 'text/plain' });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'response.txt';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

  }

  const updating_ratings = async () => {
    try {
      console.log(jsonData)
      await axios.post(apiEndpoint, { jsonData });
    } catch (error) {
      console.log(error)
    }
  }

  const handleGoodPromptClick = async (given_index: number) => {
    await fetchData();
    const updatedData = jsonData.map((item, index) => {
      //console.log(item);
      if (index === given_index) {
        return { id: item.id, prompt: item.prompt, response: item.response, date: item.date, bad_prompt: false, good_prompt: true, rewrite: item.rewrite };
      }
      console.log(item)
      return item;
    });
    //console.log(updatedData);
    setJsonData(updatedData);
    updating_ratings();
  };

  const handleBadPromptClick = async (given_index: number) => {
    await fetchData();
    const updatedData = jsonData.map((item, index) => {
      if (given_index === index) {
        return { id: item.id, prompt: item.prompt, response: item.response, date: item.date, bad_prompt: true, good_prompt: false, rewrite: item.rewrite };
      }
      
      return item;
    });
    //console.log(updatedData);
    setJsonData(updatedData);
    //console.log(jsonData);
    updating_ratings();
  };

   

  const handleCopyClick = async (response: string) => {
    try {
      
      await navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const fetchData = async () => {
    try {
      const response = await fetch('./data/queries.json');
      if (!response.ok) {
        throw new Error('Failed to load data');
      }
      const data = await response.json();
      setJsonData(data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  
  return (
    <>
      {jsonData.map((item, index) => (
        <VStack align='stretch' textAlign="left" key={index} bg="white" width="100%" borderRadius="20px" py="35px" px="30px">
          <VStack >
            <Box width="100%">
            <HStack alignItems="right">
              <Spacer />
              <Heading width="60%" size="sm" textAlign="left" margin="0" padding="0px">{item.prompt}</Heading> 
              <Avatar color="#474747" src='https://bit.ly/broken-link' /></HStack>
              
              <TextReveal text={item.response} />
            </Box>
            <HStack justifyContent="flex-end" width="100%">
              {!item.bad_prompt && (
                <Tooltip label="Good Response" placement="top">
                  <IconButton
                    onClick={() => handleGoodPromptClick(index)}
                    icon={item.good_prompt ? <FaThumbsUp /> : <FiThumbsUp />}
                    aria-label="Good Prompt"
                    colorScheme="white"
                    color="brand.icon"
                  />
                </Tooltip>
              )}
              {!item.good_prompt && (
                <Tooltip label="Bad Response" placement="top">
                  <IconButton
                    onClick={() => handleBadPromptClick(index)}
                    icon={item.bad_prompt ? <FaThumbsDown /> : <FiThumbsDown />}
                    aria-label="Bad Prompt"
                    colorScheme="white"
                    color="brand.icon"
                  />
                </Tooltip>
              )}
              <Tooltip label='Download Response' placement='top'>
                <IconButton icon={<TfiWrite />} aria-label="Rewrite Documentation" colorScheme="white" color="brand.icon" onClick={() => handleDownload(item.response)} />
              </Tooltip>
              <Tooltip label='Copy' placement='top'>
                <IconButton onClick={() => handleCopyClick(item.response)} icon={<FiCopy />} aria-label="Copy" colorScheme="white" color="brand.icon" />
              </Tooltip>
            </HStack>
          </VStack>
        </VStack>
      ))}
    </>
  );
};

export default PromptCards;
