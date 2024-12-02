// app/providers.tsx
'use client'

import { ChakraProvider } from '@chakra-ui/react'
import theme from './theme';


export function Providers({ children }: { children: React.ReactNode }) {
  return <ChakraProvider theme={theme}>
    <link
        href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap"
        rel="stylesheet"
      />{children}</ChakraProvider>
}