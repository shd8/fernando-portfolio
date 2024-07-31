import { Box } from "@material-ui/core";
import React from "react";
import SpinningDots from "./SpinningDots";

const PageLoader = () => {
  return (
    <Box display="flex" position="fixed" width="100vw" height="100vh" zIndex="9999" justifyContent="center" alignItems="center" bgcolor="black">
      <SpinningDots />
    </Box>
  );
};

export default PageLoader;
