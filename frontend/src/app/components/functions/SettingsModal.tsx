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

// Define the props interface for TypeScript
interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Custimizable Settings Soon</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>
            
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

export default SettingsModal;
