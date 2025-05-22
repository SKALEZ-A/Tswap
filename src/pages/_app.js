import "@/styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { TonConnectUIProvider, THEME } from "@tonconnect/ui-react";
import { ToastContainer } from "react-toastify";


// Use a local manifest URL to avoid CORS issues
const manifestUrl = "/manifest.json";
export default function App({ Component, pageProps }) {
  return (
    <>
     <TonConnectUIProvider 
     manifestUrl={manifestUrl} 
     uiPreferences={{
      theme: 'DARK',
      actionsConfiguration: {
        // Hide modals when user closes them by clicking outside
        hideCloseButton: false,
      },
      colorsSet:{
        [THEME.DARK]: {
          connectButton:{
            background: '#e35b5b',
            foreground: 'white',
            border: 'none'
          },
          accent: '#e35b5b',
          positive: '#e35b5b',
          negative: '#ff4747',
          primary: '#ffffff',
          secondary: '#b0b0b0',
          tertiary: '#636e9d',
          background: {
            primary: '#0d0904',
            secondary: '#18131c',
            tertiary: '#23202a'
          }
        }
      }
     }}>
    <ChakraProvider>
    <Component {...pageProps} />
    <ToastContainer />
    </ChakraProvider>
    </TonConnectUIProvider>
    </>
  );
}
