import { Container, makeStyles, Box, styled } from "@material-ui/core";
import Spline from "../src/SafeSpline";
import React from "react";
import data from "../data.json";
import About from "../src/About";
import Experience from "../src/Experience";
import Landing from "../src/Landing";
import Projects from "../src/Projects";
import Skills from "../src/Skills";
import LatestWriting from "../src/LatestWriting";
import SiteHeader from "../src/SiteHeader";
import PageMeta from "../src/PageMeta";
import { getPostSummaries } from "../src/posts";
import PageLoader from "../src/PageLoader";
import { useSplinesStore } from "../src/stores/useSplinesStore";

const { projects } = data;

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

  const posts = getPostSummaries();

  return {
    props: {
      projects: fullRepoData,
      hasPosts: posts.length > 0,
      latestPosts: posts.slice(0, 3).map(({ slug, title, description, date }) => ({ slug, title, description, date })),
    },
    revalidate: 60,
  };
}

export default function Index({ projects, hasPosts, latestPosts, setTheme }) {
  const classes = useStyles();
  const { hasLoadingSplines, setIsIndexSplineLoading } = useSplinesStore();

  return (
    <div className={classes.root}>
      <PageMeta />
      {hasLoadingSplines && <PageLoader />}
      <SplineWrapper>
        <Spline onLoad={() => setIsIndexSplineLoading(false)} scene="https://prod.spline.design/arW6KRcyeihpTTzn/scene.splinecode" />
      </SplineWrapper>

      <SiteHeader setTheme={setTheme} hasPosts={hasPosts} transparentUntilScroll />
      <Container>
        <Landing />
        <Skills />
        <Projects data={projects} />
        <LatestWriting posts={latestPosts} />
        <Experience />
        <About />
      </Container>
    </div>
  );
}
