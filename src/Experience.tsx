import React from "react";
import { Avatar, Card, CardActionArea, CardHeader, Fade, Grid, Hidden, makeStyles, Typography, useMediaQuery, useTheme } from "@material-ui/core";
import Image from "next/legacy/image";
import { DateRange, LocationCity } from "@material-ui/icons";
import data from "../data.json";
import { useRef } from "react";
import useAnimate from "./useAnimate";

const experience = data.experience as {
  [key: string]: {
    organization: string;
    role: string;
    startDate: string;
    endDate: string;
    city: string;
    state: string;
    country: string;
    url: string;
    thumbnail: string;
  }[];
};

const useStyles = makeStyles((theme) => ({
  cont: {
    minHeight: `calc(100vh - ${theme.spacing(4)}px)`,
  },
  card: {
    height: "100%",
  },
  cardHeader: {
    paddingTop: 0,
  },
  cardActionArea: {
    height: "100%",
  },
  expObj: {
    marginBottom: theme.spacing(4),
  },
}));

const getHumanDiff = (startDate: string, endDate: string) => {
  let str = "";
  const start = new Date(startDate);
  const end = !!endDate ? new Date(endDate) : new Date();
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years > 0) {
    str += years + " year";
    if (years > 1) str += "s";
  }

  if (str.length > 0) str += ", ";

  if (months > 0) {
    str += months + " month";
    if (months > 1) str += "s";
  }

  return str;
};

const formatDate = (date: string) => {
  const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const fullDate = new Date(date);
  return `${month[fullDate.getMonth()]} ${fullDate.getFullYear()}`;
};

export default function Experience() {
  const classes = useStyles();
  const theme = useTheme();
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
  const align = mdDown ? "center" : "flex-end";
  const textAlign = mdDown ? "center" : "right";

  const animRef = useRef(null);
  const animate = useAnimate(animRef);

  return (
    <Grid innerRef={animRef} direction="row" container justify="center" alignItems="center" spacing={10} className={classes.cont}>
      <Grid item xs={12} lg={6}>
        <Typography variant="h2" gutterBottom align="center">
          Experience
        </Typography>
        <Hidden mdDown>
          <Fade in={animate} style={{ transitionDelay: "250ms" }}>
            <div>
              <Image alt="Experience" src="/experience.svg" width="575" height="480" />
            </div>
          </Fade>
        </Hidden>
      </Grid>
      <Grid container item xs={12} lg={6} direction="column" spacing={1} alignItems={align}>
        {Object.getOwnPropertyNames(experience).map((title, id) => (
          <Grid item key={id} className={classes.expObj}>
            <Typography variant="h4" align={textAlign} gutterBottom component="p">
              {title}
            </Typography>
            <Grid container item direction="row" spacing={1} justify="center">
              {experience[title].map(({ organization, role, startDate, endDate, city, state, country, url, thumbnail }, index) => (
                <Grid item sm xs={12} key={index}>
                  <Fade in={animate} style={{ transitionDelay: `${400 * index}ms` }}>
                    <Card className={classes.card}>
                      <CardActionArea className={classes.cardActionArea} href={url} target="_blank" rel="noopener noreferrer">
                        <CardHeader
                          avatar={
                            <Avatar variant="rounded">
                              <Image alt={`${organization} logo`} src={thumbnail} layout="fill" />
                            </Avatar>
                          }
                          title={organization}
                          subheader={role}
                        />
                        <CardHeader
                          avatar={<DateRange />}
                          title={getHumanDiff(startDate, endDate)}
                          subheader={startDate && endDate ? `${formatDate(startDate)} ~ ${formatDate(endDate)}` : `${formatDate(startDate)} ~ Present`}
                          className={classes.cardHeader}
                        />
                        <CardHeader
                          avatar={<LocationCity />}
                          subheader={city && state && country ? `${city}, ${state}, ${country}` : "Remote"}
                          className={classes.cardHeader}
                        />
                      </CardActionArea>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Grid>
        ))}
      </Grid>
      {/* <div ref={animRef}></div> */}
    </Grid>
  );
}
