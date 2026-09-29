import React from "react";
import Link from "next/link";
import { Card, CardActionArea, CardContent, Chip, makeStyles, Typography } from "@material-ui/core";
import data from "../../data.json";
import ContentPage from "../../src/ContentPage";
import PageMeta from "../../src/PageMeta";
import { getPostSummaries } from "../../src/posts";
import { siteUrl } from "../../src/seo";

const { name } = data;

type PostSummary = ReturnType<typeof getPostSummaries>[number];

const useStyles = makeStyles((theme) => ({
  card: {
    marginTop: theme.spacing(3),
  },
  tags: {
    display: "flex",
    flexWrap: "wrap",
    gap: theme.spacing(1),
    marginTop: theme.spacing(1.5),
  },
}));

export async function getStaticProps() {
  const posts = getPostSummaries();
  if (posts.length === 0) return { notFound: true, revalidate: 3600 };
  return { props: { posts, hasPosts: true }, revalidate: 3600 };
}

interface BlogProps {
  posts: PostSummary[];
  hasPosts: boolean;
  setTheme: React.ComponentProps<typeof ContentPage>["setTheme"];
}

export default function Blog({ posts, hasPosts, setTheme }: BlogProps) {
  const classes = useStyles();
  const title = `Blog — ${name}, Senior Full Stack Engineer`;
  const description = `Articles by ${name} about React, TypeScript, Next.js, Node.js and building web applications.`;

  return (
    <ContentPage setTheme={setTheme} hasPosts={hasPosts}>
      <PageMeta
        title={title}
        description={description}
        path="/blog"
        type="website"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          url: `${siteUrl}/blog`,
          name: title,
          author: { "@id": `${siteUrl}/#person` },
          blogPost: posts.map((post) => ({ "@type": "BlogPosting", headline: post.title, url: `${siteUrl}/blog/${post.slug}`, datePublished: post.date })),
        }}
      />
      <Typography variant="h2" component="h1">
        Blog
      </Typography>
      <Typography color="textSecondary">Notes on React, TypeScript and full stack web development.</Typography>
      {posts.map((post) => (
        <Card key={post.slug} className={classes.card} component="article">
          <CardActionArea component={Link} href={`/blog/${post.slug}`}>
            <CardContent>
              <Typography color="textSecondary" variant="body2" component="time" dateTime={post.date}>
                {post.date}
              </Typography>
              <Typography variant="h5" component="h2">
                {post.title}
              </Typography>
              <Typography>{post.description}</Typography>
              <div className={classes.tags}>
                {post.tags.map((tag: string) => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </div>
            </CardContent>
          </CardActionArea>
        </Card>
      ))}
    </ContentPage>
  );
}
