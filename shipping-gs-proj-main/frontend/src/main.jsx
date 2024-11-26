import React from "react";
import ReactDOM from "react-dom/client";
import App from './App.jsx'
import './index.css'
import { CssBaseline } from "@mui/material";
import { HelmetProvider } from "react-helmet-async";
import { Provider } from "react-redux";
import store from "./redux/store.js";
import { ChakraProvider } from "@chakra-ui/react"; // Import ChakraProvider
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { BrowserRouter } from "react-router-dom";

// Create your MUI theme
const theme = createTheme({
  typography: {
    fontWeightBold: 700, // Define a default value for fontWeightBold
  },
  // other theme properties...
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <ThemeProvider theme={theme}>
          <ChakraProvider>
            <BrowserRouter>
              {" "}
              {/* Wrap your entire app in BrowserRouter */}
              <div onContextMenu={(e) => e.preventDefault()}>
                <App />
              </div>
            </BrowserRouter>
          </ChakraProvider>
        </ThemeProvider>
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
);
