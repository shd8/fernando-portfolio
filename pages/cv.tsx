import React from "react";
import { Box, Button, Container, Divider, Link as MuiLink, makeStyles, Paper, Typography } from "@material-ui/core";
import { GetApp } from "@material-ui/icons";
import data from "../data.json";
import SiteHeader from "../src/SiteHeader";
import PageMeta from "../src/PageMeta";
import { getPostSummaries } from "../src/posts";
import { siteUrl, withYears } from "../src/seo";

const CV_PDF_PATH = "/Fernando-Gomez-Graciani-CV.pdf";

const { name, profile, about, skills, experience } = data;

const formatMonth = (date: string) => (date ? new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Present");

const skillName = (skill: string | { alt: string }) => (typeof skill === "string" ? skill : skill.alt);

const SKILL_GROUP_LABELS: Record<string, string> = { "Languages known": "Languages", "And more tools and technologies": "Tools" };

// The bootcamp is listed under Education on the CV, so leave it out of Experience.
const jobs = experience["Work Experience"].filter(({ organization }) => !profile.education.some(({ institution }) => institution.startsWith(organization)));

const useStyles = makeStyles((theme) => ({
  page: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(8),
  },
  paper: {
    padding: theme.spacing(6),
    [theme.breakpoints.down("xs")]: {
      padding: theme.spacing(3),
    },
  },
  section: {
    marginTop: theme.spacing(4),
  },
  job: {
    marginTop: theme.spacing(2.5),
    breakInside: "avoid",
  },
  jobHeader: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: theme.spacing(1),
  },
  list: {
    margin: theme.spacing(1, 0, 0),
    paddingLeft: theme.spacing(2.5),
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: theme.spacing(2),
  },
  "@global": {
    "@media print": {
      "header, nav, .MuiToolbar-root, .cv-actions": { display: "none !important" },
      body: { background: "#fff !important", color: "#000 !important" },
      ".MuiPaper-root": { background: "#fff !important", color: "#000 !important", boxShadow: "none !important", padding: "0 !important" },
      ".MuiTypography-colorTextSecondary": { color: "#333 !important" },
      a: { color: "#000 !important" },
      "@page": { margin: "14mm" },
    },
  },
}));

const cvTitle = `${name} — CV | Senior Full Stack Software Engineer`;
const cvDescription = withYears(
  `CV of ${name}, Senior Full Stack Software Engineer with {years}+ years of experience in React, TypeScript, Next.js and Node.js. Based in Barcelona, Spain, open to remote roles.`
);

export async function getStaticProps() {
  return { props: { hasPosts: getPostSummaries().length > 0 } };
}

interface CVProps {
  setTheme: React.ComponentProps<typeof SiteHeader>["setTheme"];
  hasPosts: boolean;
}

export default function CV({ setTheme, hasPosts }: CVProps) {
  const classes = useStyles();
  const contact = [
    { label: profile.email, href: `mailto:${profile.email}` },
    { label: siteUrl.replace("https://", ""), href: siteUrl },
    ...profile.sameAs.map((url) => ({ label: url.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, ""), href: url })),
  ];

  return (
    <>
      <PageMeta
        title={cvTitle}
        description={cvDescription}
        path="/cv"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ProfilePage",
          url: `${siteUrl}/cv`,
          name: cvTitle,
          mainEntity: { "@id": `${siteUrl}/#person` },
        }}
      />
      <SiteHeader setTheme={setTheme} hasPosts={hasPosts} />
      <Container maxWidth="md" className={classes.page}>
        <Box className={`${classes.actions} cv-actions`}>
          <Button variant="contained" color="primary" startIcon={<GetApp />} href={CV_PDF_PATH} download>
            Download PDF
          </Button>
        </Box>

        <Paper className={classes.paper} component="article">
          <Typography variant="h3" component="h1">
            {name}
          </Typography>
          <Typography variant="h5" component="p">
            {profile.jobTitle}
          </Typography>
          <Typography color="textSecondary">
            {profile.city}, Spain · Remote (CET) · {profile.languages.join(", ")}
          </Typography>
          <Typography color="textSecondary">
            {contact.map(({ label, href }, i) => (
              <React.Fragment key={href}>
                {i > 0 && " · "}
                <MuiLink href={href} color="inherit">
                  {label}
                </MuiLink>
              </React.Fragment>
            ))}
          </Typography>

          <section className={classes.section}>
            <Typography variant="h5" component="h2" gutterBottom>
              Summary
            </Typography>
            <Divider />
            <Typography style={{ marginTop: 12 }}>{withYears(about.description)}</Typography>
          </section>

          <section className={classes.section}>
            <Typography variant="h5" component="h2" gutterBottom>
              Experience
            </Typography>
            <Divider />
            {jobs.map(({ organization, role, startDate, endDate, city, country, highlights }) => (
              <div className={classes.job} key={organization}>
                <div className={classes.jobHeader}>
                  <Typography variant="h6" component="h3">
                    {role} · {organization}
                  </Typography>
                  <Typography color="textSecondary">
                    {formatMonth(startDate)} – {formatMonth(endDate)} · {city ? `${city}, ${country}` : "Remote"}
                  </Typography>
                </div>
                <ul className={classes.list}>
                  {highlights.map((highlight) => (
                    <Typography component="li" key={highlight}>
                      {highlight}
                    </Typography>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <section className={classes.section}>
            <Typography variant="h5" component="h2" gutterBottom>
              Skills
            </Typography>
            <Divider />
            <ul className={classes.list}>
              {Object.entries(skills).map(([group, list]) => (
                <Typography component="li" key={group}>
                  <strong>{SKILL_GROUP_LABELS[group] ?? group}:</strong> {(list as (string | { alt: string })[]).map(skillName).join(", ")}
                </Typography>
              ))}
            </ul>
          </section>

          <section className={classes.section}>
            <Typography variant="h5" component="h2" gutterBottom>
              Education
            </Typography>
            <Divider />
            {profile.education.map(({ institution, program, startDate, endDate, city }) => (
              <div className={classes.job} key={institution}>
                <div className={classes.jobHeader}>
                  <Typography variant="h6" component="h3">
                    {program} · {institution}
                  </Typography>
                  <Typography color="textSecondary">
                    {formatMonth(startDate)} – {formatMonth(endDate)} · {city}
                  </Typography>
                </div>
              </div>
            ))}
          </section>
        </Paper>
      </Container>
    </>
  );
}
