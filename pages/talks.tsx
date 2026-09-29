import React from "react";
import { Card, CardContent, Link as MuiLink, makeStyles, Typography } from "@material-ui/core";
import data from "../data.json";
import ContentPage from "../src/ContentPage";
import PageMeta from "../src/PageMeta";
import { getPostSummaries } from "../src/posts";
import { siteUrl } from "../src/seo";

// Talks are listed in data.json → "talks": [{ title, event, date, location, description, url, videoUrl, slidesUrl }]
interface Talk {
  title: string;
  event: string;
  date: string;
  location?: string;
  description?: string;
  url?: string;
  videoUrl?: string;
  slidesUrl?: string;
}

const { name } = data;
const talks = data.talks as Talk[];

const useStyles = makeStyles((theme) => ({
  card: {
    marginTop: theme.spacing(3),
  },
  links: {
    display: "flex",
    gap: theme.spacing(2),
    marginTop: theme.spacing(1.5),
  },
}));

export async function getStaticProps() {
  if (talks.length === 0) return { notFound: true };
  return { props: { hasPosts: getPostSummaries().length > 0 }, revalidate: 3600 };
}

interface TalksProps {
  hasPosts: boolean;
  setTheme: React.ComponentProps<typeof ContentPage>["setTheme"];
}

export default function Talks({ hasPosts, setTheme }: TalksProps) {
  const classes = useStyles();
  const sorted = [...talks].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <ContentPage setTheme={setTheme} hasPosts={hasPosts}>
      <PageMeta
        title={`Talks — ${name}, Senior Full Stack Engineer`}
        description={`Conference talks and presentations by ${name} on React, TypeScript and web development.`}
        path="/talks"
        type="website"
        jsonLd={{
          "@context": "https://schema.org",
          "@graph": sorted.map((talk) => ({
            "@type": "Event",
            name: `${talk.title} — ${talk.event}`,
            startDate: talk.date,
            description: talk.description,
            url: talk.url,
            location: talk.location ? { "@type": "Place", name: talk.location } : { "@type": "VirtualLocation", url: talk.url },
            performer: { "@id": `${siteUrl}/#person` },
          })),
        }}
      />
      <Typography variant="h2" component="h1">
        Talks
      </Typography>
      {sorted.map((talk) => (
        <Card key={`${talk.event}-${talk.title}`} className={classes.card} component="article">
          <CardContent>
            <Typography color="textSecondary" variant="body2">
              {talk.event} · <time dateTime={talk.date}>{talk.date}</time>
              {talk.location && ` · ${talk.location}`}
            </Typography>
            <Typography variant="h5" component="h2">
              {talk.title}
            </Typography>
            {talk.description && <Typography>{talk.description}</Typography>}
            <div className={classes.links}>
              {[
                { href: talk.videoUrl, label: "Video" },
                { href: talk.slidesUrl, label: "Slides" },
                { href: talk.url, label: "Event page" },
              ]
                .filter(({ href }) => href)
                .map(({ href, label }) => (
                  <MuiLink key={label} href={href} target="_blank" rel="noopener">
                    {label}
                  </MuiLink>
                ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </ContentPage>
  );
}
