import { createMuiTheme } from "@material-ui/core";

export const lightTheme = createMuiTheme({
  palette: {
    type: "light",
    background: {
      paper: "#fff",
      default: "#fafafa",
    },
  },
});

export const darkTheme = createMuiTheme({
  palette: {
    type: "dark",
    background: {
      paper: "#303030",
      default: "#212121",
    },
  },
});
