import ReactDOM from "react-dom/client";
import { App } from "./App";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { BrowserRouter as Router } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import "@fontsource-variable/manrope";
import "@fontsource-variable/oswald";
import "@fontsource/bebas-neue/latin-400.css";
import "./i18n";
import "./styles.css";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: { default: "#111211", paper: "#1b1c1a" },
    text: { primary: "#f5f5ed", secondary: "#a5a69f" },
    primary: {
      main: "#e8fa78",
    },
    secondary: {
      main: "#fff",
    },
  },
  typography: {
    fontFamily: '"Manrope Variable", sans-serif',
    button: { textTransform: "none", fontWeight: 700 },
  },
  shape: { borderRadius: 6 },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Router>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </Provider>
  </Router>,
);
