import React, { useCallback } from "react";
import Link from "next/link";
import { AppBar, Box, Button, IconButton, makeStyles, Toolbar, Typography, useScrollTrigger, useTheme } from "@material-ui/core";
import { Brightness4, Brightness7 } from "@material-ui/icons";
import data from "../data.json";
import { darkTheme, lightTheme } from "./theme";

const { name, talks } = data;

const useStyles = makeStyles((theme) => ({
  appBar: {
    boxShadow: "none",
  },
  name: {
    flexGrow: 1,
    color: "inherit",
    textDecoration: "none",
  },
  nav: {
    display: "flex",
    gap: theme.spacing(0.5),
  },
}));

interface SiteHeaderProps {
  setTheme: (updater: (theme: typeof darkTheme) => typeof darkTheme) => void;
  hasPosts?: boolean;
  transparentUntilScroll?: boolean;
}

export default function SiteHeader({ setTheme, hasPosts = false, transparentUntilScroll = false }: SiteHeaderProps) {
  const classes = useStyles();
  const theme = useTheme();
  const scrolled = useScrollTrigger({ disableHysteresis: true });

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current.palette.type === "dark" ? lightTheme : darkTheme));
  }, [setTheme]);

  const links = [
    hasPosts && { href: "/blog", label: "Blog" },
    talks.length > 0 && { href: "/talks", label: "Talks" },
    { href: "/cv", label: "CV" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <>
      <AppBar color={transparentUntilScroll && !scrolled ? "transparent" : "inherit"} className={classes.appBar} position="fixed">
        <Toolbar>
          <Typography variant="h6" component={Link} href="/" className={classes.name}>
            {name}
          </Typography>
          <Box component="nav" aria-label="Main" className={classes.nav}>
            {links.map(({ href, label }) => (
              <Button key={href} component={Link} href={href} color="inherit">
                {label}
              </Button>
            ))}
          </Box>
          <IconButton aria-label="Toggle dark mode" edge="end" color="inherit" onClick={toggleTheme}>
            {theme.palette.type === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </>
  );
}
