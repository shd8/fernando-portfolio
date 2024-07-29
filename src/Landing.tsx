import React from "react";
import { Avatar, Fade, Grid, Hidden, makeStyles, Tooltip, Typography, useMediaQuery, useTheme, Zoom, styled, Box } from "@material-ui/core";
import ReactTyped from "react-typed";
import clsx from "clsx";
import Spline from "@splinetool/react-spline";
import Image from "next/legacy/image";
import * as icons from "simple-icons";
import data from "../data.json";
import { getDescendantProp } from "./util";
const { landing } = data;

const SplineWrapper = styled(Box)({
  position: "absolute",
  right: "-20%",
});

const professionalDetails = landing.professionalDetails.map(({ alt, icon, link, id }) => {
  const ic = getDescendantProp(icons, icon) || icons.get("Next.js");

  return {
    alt,
    id,
    backgroundColor: `#${ic?.hex || "#333"}`,
    icon: (
      <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" height="100%" width="100%" xmlnsXlink="http://www.w3.org/1999/xlink">
        <title>{alt}</title>
        <path d={ic?.path} fill="white" />
      </svg>
    ),
    link,
  };
});

interface IAnyObject {
  [key: string]: any;
}

let iobj: IAnyObject = {};

professionalDetails.forEach(({ id, alt, backgroundColor }) => {
  iobj[id] = { backgroundColor };
});

const useStyles: () => IAnyObject = makeStyles((theme) => ({
  cont: {
    minHeight: `calc(100vh - ${theme.spacing(4)}px)`,
    paddingBottom: theme.spacing(10),
  },
  subtitle: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(5),
  },
  avatar: {
    height: theme.spacing(8),
    width: theme.spacing(8),
    padding: theme.spacing(2),
  },
  ...iobj,
}));

export default function Landing() {
  const classes = useStyles();
  const theme = useTheme();
  const mdDown = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Grid container justify="center" alignItems="center" className={classes.cont}>
      <Grid item xs={12} lg={6}>
        <Typography variant={mdDown ? "h2" : "h1"}>{landing.title}</Typography>
        <Typography variant={mdDown ? "h5" : "h4"} component="h2" className={classes.subtitle}>
          <ReactTyped strings={landing.subtitles} typeSpeed={40} backSpeed={50} loop />
        </Typography>
        <Grid container direction="row" spacing={2}>
          {professionalDetails.map(({ alt, icon, link, id }, i) => (
            <Grid item key={i}>
              <a href={link} target="_blank" rel="noopener noreferrer">
                <Zoom in={true} style={{ transitionDelay: `${100 * i}ms` }}>
                  <Tooltip title={alt} placement="top">
                    <Avatar variant="rounded" className={clsx([classes.avatar, classes[id]])}>
                      {icon}
                    </Avatar>
                  </Tooltip>
                </Zoom>
              </a>
            </Grid>
          ))}
        </Grid>
      </Grid>

      <Hidden mdDown>
        <Fade in={true} style={{ transitionDelay: "100ms" }}>
          <>
            <Grid item lg={6}></Grid>
            <SplineWrapper>
              <Spline scene="https://prod.spline.design/MXlM9tgFBK6WdzPl/scene.splinecode" />
            </SplineWrapper>
            {/* <Image src="/landing.svg" alt="Landing" width="616" height="787" /> */}
          </>
        </Fade>
      </Hidden>
    </Grid>
  );
}
