import React from "react";
import { Box, Button, Container, Divider, Link as MuiLink, makeStyles, Paper, Typography } from "@material-ui/core";
import { GetApp } from "@material-ui/icons";
import data from "../data.json";
import SiteHeader from "../src/SiteHeader";
import PageMeta from "../src/PageMeta";
import { getPostSummaries } from "../src/posts";
import { siteUrl, withYears, languagesText } from "../src/seo";

const CV_PDF_PATH = "/Fernando-Gomez-Graciani-CV.pdf";

const { name, profile, experience } = data;
const jobs = experience["Work Experience"];

const formatMonth = (date: string) => (date ? new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Present");

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
    "@media print": { marginTop: 5 },
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
      "@page": { size: "A4", margin: "12mm 16mm" },
      // Print type scale modelled on the LaTeX CV: 10pt body, compact headings, exactly 2 pages.
      ".cv-doc .MuiTypography-h3": { fontSize: "20pt !important", fontWeight: "500 !important" },
      ".cv-doc .MuiTypography-h5": { fontSize: "11.5pt !important", fontWeight: "600 !important", textTransform: "uppercase", letterSpacing: "0.04em" },
      ".cv-doc .MuiTypography-h6": { fontSize: "10pt !important", fontWeight: "600 !important" },
      ".cv-doc .MuiTypography-body1": { fontSize: "9.3pt !important", lineHeight: "1.35 !important" },
      ".cv-doc section": { marginTop: "9pt !important" },
      ".cv-doc .MuiDivider-root": { background: "#000 !important" },
      ".cv-doc ul": { marginTop: "2pt !important" },
    },
  },
}));

const cvTitle = `${name} — CV | Senior Full Stack Software Engineer`;
const cvDescription = withYears(
  `CV of ${name}, Senior Full Stack Software Engineer with {years}+ years of experience in React, TypeScript, Next.js and Node.js. Based in Barcelona, Spain, open to remote roles.`
);

export async function getStaticProps() {
  return { props: { hasPosts: getPostSummaries().length > 0 }, revalidate: 3600 };
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
    ...profile.sameAs.filter((url) => /linkedin\.com|github\.com/.test(url)).map((url) => ({ label: url.replace(/^https:\/\/(www\.)?/, "").replace(/\/$/, ""), href: url })),
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

        <Paper className={`${classes.paper} cv-doc`} component="article">
          <Typography variant="h3" component="h1">
            {name}
          </Typography>
          <Typography variant="h5" component="p">
            {profile.jobTitle}
          </Typography>
          <Typography color="textSecondary">
            {profile.city}, Spain (EU) · Remote, CET
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
            <Typography style={{ marginTop: 12 }}>{withYears(profile.summary)}</Typography>
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
              {profile.cvSkills.map(({ group, items }) => (
                <Typography component="li" key={group}>
                  <strong>{group}:</strong>{" "}
                  {items.map((item, i) => (
                    // Keep each skill on one line: a line break inside "Job-Based" reaches ATS as "JobBased".
                    <React.Fragment key={item}>
                      {i > 0 && " · "}
                      <span style={{ whiteSpace: "nowrap" }}>{item}</span>
                    </React.Fragment>
                  ))}
                </Typography>
              ))}
            </ul>
          </section>

          <section className={classes.section}>
            <Typography variant="h5" component="h2" gutterBottom>
              Education
            </Typography>
            <Divider />
            {profile.education.map(({ institution, program, endDate, city, note }) => (
              <div className={classes.job} key={institution}>
                <div className={classes.jobHeader}>
                  <Typography variant="h6" component="h3">
                    {program} · {institution}
                  </Typography>
                  <Typography color="textSecondary">{endDate ? `Graduated ${formatMonth(endDate)} · ${city}` : city}</Typography>
                </div>
                {note && <Typography>{note}</Typography>}
              </div>
            ))}
          </section>
          <section className={classes.section}>
            <Typography variant="h5" component="h2" gutterBottom>
              Certifications &amp; Languages
            </Typography>
            <Divider />
            <ul className={classes.list}>
              <Typography component="li">
                <strong>Certifications:</strong> {profile.certifications.join(" · ")}
              </Typography>
              <Typography component="li">
                <strong>Languages:</strong> {languagesText}
              </Typography>
            </ul>
          </section>
        </Paper>
      </Container>
    </>
  );
}
