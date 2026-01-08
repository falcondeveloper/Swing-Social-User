import { createTheme } from "@mui/material/styles";

const theme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: "#0b0b0b",
            paper: "#121212",
        },
    },
    typography: {
        fontFamily: "var(--font-inter), system-ui, sans-serif",

        h1: {
            fontFamily: "var(--font-playfair), serif",
            fontWeight: 700,
        },
        h2: {
            fontFamily: "var(--font-playfair), serif",
            fontWeight: 600,
        },
        h3: {
            fontFamily: "var(--font-playfair), serif",
            fontWeight: 600,
        },
        h4: {
            fontFamily: "var(--font-playfair), serif",
            fontWeight: 500,
        },
    },
});

export default theme;
