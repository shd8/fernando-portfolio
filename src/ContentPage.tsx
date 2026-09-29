import React, { ReactNode } from "react";
import { Container, makeStyles } from "@material-ui/core";
import SiteHeader from "./SiteHeader";

const useStyles = makeStyles((theme) => ({
  page: {
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(10),
  },
}));

interface ContentPageProps {
  setTheme: React.ComponentProps<typeof SiteHeader>["setTheme"];
  hasPosts: boolean;
  children: NonNullable<ReactNode>;
}

export default function ContentPage({ setTheme, hasPosts, children }: ContentPageProps) {
  const classes = useStyles();

  return (
    <>
      <SiteHeader setTheme={setTheme} hasPosts={hasPosts} />
      <Container maxWidth="md" className={classes.page} component="main">
        {children}
      </Container>
    </>
  );
}
