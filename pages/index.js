import { AppBar, Container, IconButton, makeStyles, Toolbar, Typography, useScrollTrigger, useTheme, Box, styled } from "@material-ui/core";
import { Brightness4, Brightness7 } from "@material-ui/icons";
import Spline from "@splinetool/react-spline";
import { Analytics } from "@vercel/analytics/react";
import React, { useCallback } from "react";
import data from "../data.json";
import About from "../src/About";
import Experience from "../src/Experience";
import Landing from "../src/Landing";
import Projects from "../src/Projects";
import Skills from "../src/Skills";
import { darkTheme, lightTheme } from "../src/theme";
import PageLoader from "../src/PageLoader";
import { useSplinesStore } from "../src/stores/useSplinesStore";

const { name, projects } = data;

const SplineWrapper = styled(Box)(() => ({
  position: "absolute",
  height: "100%",
  left: "-35vw",
  top: "-25vh",
  width: "100%",
  zIndex: "-1",
}));

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  appBar: {
    boxShadow: "none",
  },
}));

export async function getStaticProps() {
  const baseURI = projects.baseURI;
  const repos = projects.repositories;

  const fullRepoData = await Promise.allSettled(
    repos.map(async (name) => {
      const repo = await fetch(baseURI + name).then((res) => res.json());
      const langs = await fetch(baseURI + name + "/languages").then((res) => res.json());
      return {
        ...repo,
        languages: Object.getOwnPropertyNames(langs),
      };
    })
  );

  return {
    props: {
      projects: fullRepoData,
    },
    revalidate: 60,
  };
}

export default function Index({ projects, setTheme }) {
  const classes = useStyles();
  const trigger = useScrollTrigger({ disableHysteresis: true });
  const theme = useTheme();
  const { hasLoadingSplines, setIsIndexSplineLoading } = useSplinesStore();

  const toggleTheme = useCallback(() => {
    setTheme((theme) => (theme.palette.type === "dark" ? lightTheme : darkTheme));
  }, [setTheme]);

  return (
    <div className={classes.root}>
      {hasLoadingSplines && <PageLoader />}
      <SplineWrapper>
        <Spline onLoad={() => setIsIndexSplineLoading(false)} scene="https://prod.spline.design/arW6KRcyeihpTTzn/scene.splinecode" />
      </SplineWrapper>

      <Analytics />
      <AppBar color={!trigger ? "transparent" : "inherit"} className={classes.appBar} position="fixed">
        <Toolbar>
          <Typography variant="h6" className={classes.root}>
            {name}
          </Typography>
          <IconButton aria-label="theme-toggle" edge="end" color="inherit" onClick={toggleTheme}>
            {theme.palette.type === "dark" ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Toolbar className={classes.toolbar} />
      <Container>
        <Landing />
        <Skills />
        <Projects data={projects} />
        <Experience />
        <About />
      </Container>
    </div>
  );
}
