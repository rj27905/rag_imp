// components/UploadFileModal.tsx

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Text,
  VStack, 
} from "@chakra-ui/react";
import axios from 'axios'

// Define the props interface for TypeScript
interface UploadFileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UploadFileModal: React.FC<UploadFileModalProps> = ({ isOpen, onClose }) => {
  const [files, setFiles] = useState<File[]>([]);  // TypeScript File array


  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    console.log(file);
    formData.append('file', file, file.name);
    // for (let pair ofmformData.entries()) {
    //   console.log(`${pair[0]}: ${pair[1]}`);
    // }
    try {
      const response = await axios.post('http://127.0.0.1:5001/api/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });    
  
        console.log(response.data.message);
    } catch (error) {
        console.error('Error uploading file:', error);
    }
};
  const onDrop = (acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    files.forEach((element) => {
      handleFileUpload(element);
    })
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".png", ".jpg", ".gif"],
      "application/pdf": [".pdf"],
    },
    multiple: true,
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Upload Your File</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box
            {...getRootProps()}
            p={6}
            border="2px dashed"
            borderColor={isDragActive ? "brand.icon_background" : "gray.200"}
            borderRadius="md"
            textAlign="center"
            cursor="pointer"
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <VStack>
              <Text color="black">Drop the files here</Text>
              <Text color="black">Drop the files here</Text>
              </VStack>
              
            ) : (
              <Text>Drag and drop new documentation files here, or click to select files (pdfs) </Text>
            )}
          </Box>

          <Box mt={4}>
            {files.length > 0 && (
              <Box>
                <Text>Uploaded Files:</Text>
                {files.map((file, index) => (
                  <Text key={index}>{file.name}</Text>
                ))}
              </Box>
            )}
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button color="white" bg="brand.icon" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UploadFileModal;
