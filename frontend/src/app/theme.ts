import { extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
    fonts: {
        heading: `'Open Sans', sans-serif`, // Set "Open Sans" for headings
        body: `'Open Sans', sans-serif`,    // Set "Open Sans" for body text
      },
  colors: {
    brand: {
      background: '#ffffff',
      icon: '#474747',
      overlay: 'rgba(204, 204, 204, 0.80)',
      icon_background: 'rgba(0, 0, 0, 0.20)',
      medtext: '#2766c2',
      softtext: '#717171',
      button: '#13099a'
    },
  },
  styles: {
    global: {
      'html, body': {
        bg: 'brand.background',  
        color: 'brand.boldtext',  
        minHeight: '100vh',
        fontFamily: `'Open Sans', sans-serif`, 
      },
    },
  },
});

export default theme;