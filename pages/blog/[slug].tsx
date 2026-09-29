import React from "react";
import { makeStyles, Typography } from "@material-ui/core";
import data from "../../data.json";
import ContentPage from "../../src/ContentPage";
import PageMeta from "../../src/PageMeta";
import { getPost, getPostSummaries } from "../../src/posts";
import { siteUrl } from "../../src/seo";

const { name } = data;

type Post = NonNullable<ReturnType<typeof getPost>>;

const useStyles = makeStyles((theme) => ({
  body: {
    ...theme.typography.body1,
    fontSize: "1.1rem",
    lineHeight: 1.75,
    "& h2, & h3": { marginTop: theme.spacing(5) },
    "& a": { color: theme.palette.primary.light },
    "& pre": { overflowX: "auto", padding: theme.spacing(2), borderRadius: theme.shape.borderRadius, background: theme.palette.type === "dark" ? "#111" : "#f4f4f4" },
    "& code": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.9em" },
    "& img": { maxWidth: "100%" },
  },
  byline: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(4),
  },
}));

export async function getStaticPaths() {
  return { paths: getPostSummaries().map(({ slug }) => ({ params: { slug } })), fallback: false };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const { content, ...post } = getPost(params.slug)!;
  return { props: { post, hasPosts: true } };
}

interface PostPageProps {
  post: Omit<Post, "content">;
  hasPosts: boolean;
  setTheme: React.ComponentProps<typeof ContentPage>["setTheme"];
}

export default function PostPage({ post, hasPosts, setTheme }: PostPageProps) {
  const classes = useStyles();
  const url = `${siteUrl}/blog/${post.slug}`;

  return (
    <ContentPage setTheme={setTheme} hasPosts={hasPosts}>
      <PageMeta
        title={`${post.title} — ${name}`}
        description={post.description}
        path={`/blog/${post.slug}`}
        type="article"
        publishedTime={post.date}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          url,
          mainEntityOfPage: url,
          keywords: post.tags.join(", "),
          author: { "@type": "Person", "@id": `${siteUrl}/#person`, name, url: siteUrl },
        }}
      />
      <article>
        <Typography variant="h3" component="h1">
          {post.title}
        </Typography>
        <Typography color="textSecondary" className={classes.byline}>
          By {name} · <time dateTime={post.date}>{post.date}</time>
        </Typography>
        <div className={classes.body} dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>
    </ContentPage>
  );
}
