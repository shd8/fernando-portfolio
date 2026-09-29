import { createMuiTheme, ThemeOptions } from "@material-ui/core";

// spacing={10} grids add -40px side margins, which overflow narrow screens and shift the whole page.
// Shrink the gutter below md in CSS so the server-rendered markup is already correct.
const overrides: ThemeOptions["overrides"] = {
  MuiCssBaseline: {
    "@global": {
      "@media (max-width: 959.95px)": {
        "body .MuiGrid-spacing-xs-10": {
          width: "calc(100% + 16px)",
          margin: -8,
        },
        "body .MuiGrid-spacing-xs-10 > .MuiGrid-item": {
          padding: 8,
        },
      },
    },
  },
};

export const lightTheme = createMuiTheme({
  palette: {
    type: "light",
    background: {
      paper: "#fff",
      default: "#fafafa",
    },
  },
  overrides,
});

export const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
    background: {
      paper: "#303030",
      default: "#212121",
    },
  },
  overrides,
});
