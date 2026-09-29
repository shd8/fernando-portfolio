import React from "react";
import Link from "next/link";
import Image from "next/legacy/image";
import { Avatar, Box, Button, makeStyles, Paper, Typography } from "@material-ui/core";
import data from "../data.json";

const { name, profile, about } = data;

const useStyles = makeStyles((theme) => ({
  card: {
    display: "flex",
    gap: theme.spacing(3),
    alignItems: "center",
    marginTop: theme.spacing(8),
    padding: theme.spacing(3),
    [theme.breakpoints.down("xs")]: {
      flexDirection: "column",
      textAlign: "center",
    },
  },
  avatar: {
    width: theme.spacing(12),
    height: theme.spacing(12),
    flexShrink: 0,
  },
  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: theme.spacing(2),
    [theme.breakpoints.down("xs")]: {
      justifyContent: "center",
    },
  },
}));

// Shown under every post: who wrote it and how to reach him.
export default function AuthorCard() {
  const classes = useStyles();
  const linkedIn = profile.sameAs.find((url) => url.includes("linkedin.com"));

  return (
    <Paper className={classes.card} component="aside" aria-label="About the author">
      <Avatar className={classes.avatar}>
        <Image src={about.picture} alt={name} layout="fill" objectFit="cover" />
      </Avatar>
      <Box>
        <Typography variant="h6" component="p">
          {name}
        </Typography>
        <Typography color="textSecondary" gutterBottom>
          {profile.jobTitle} · React, TypeScript, Node.js, Python
        </Typography>
        <Typography>
          I build data-heavy web applications end to end, from the React UI through the API contract to the data model. I&apos;m open to remote Senior Full Stack and Frontend roles.
        </Typography>
        <Box className={classes.actions}>
          <Button variant="contained" color="primary" component={Link} href="/cv">
            View my CV
          </Button>
          {linkedIn && (
            <Button variant="outlined" href={linkedIn} target="_blank" rel="noopener">
              LinkedIn
            </Button>
          )}
          <Button variant="outlined" href={`mailto:${profile.email}`}>
            Email me
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
