import React from "react";
import { makeStyles, Typography } from "@material-ui/core";
import data from "../../data.json";
import ContentPage from "../../src/ContentPage";
import PageMeta from "../../src/PageMeta";
import AuthorCard from "../../src/AuthorCard";
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
    "& a": { color: theme.palette.type === "dark" ? theme.palette.primary.light : theme.palette.primary.main },
    "& pre": { overflowX: "auto", borderRadius: theme.shape.borderRadius, fontSize: "0.9rem", lineHeight: 1.6 },
    // Code blocks always use the github-dark highlight theme, in both site themes.
    "& pre code.hljs": { padding: theme.spacing(2) },
    "& code": { fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "0.9em" },
    "& :not(pre) > code": { padding: "0.1em 0.35em", borderRadius: 4, background: theme.palette.type === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)" },
    "& blockquote": { margin: theme.spacing(3, 0), paddingLeft: theme.spacing(2), borderLeft: `4px solid ${theme.palette.divider}`, color: theme.palette.text.secondary },
    "& table": { borderCollapse: "collapse", display: "block", overflowX: "auto" },
    "& th, & td": { border: `1px solid ${theme.palette.divider}`, padding: theme.spacing(1, 1.5), textAlign: "left" },
    "& img": { maxWidth: "100%" },
  },
  byline: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(4),
  },
}));

export async function getStaticPaths() {
  // "blocking" lets a scheduled post render on its publish date without a new deploy.
  return { paths: getPostSummaries().map(({ slug }) => ({ params: { slug } })), fallback: "blocking" };
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const found = getPost(params.slug);
  if (!found) return { notFound: true, revalidate: 3600 };
  const { content, ...post } = found;
  return { props: { post, hasPosts: true }, revalidate: 3600 };
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
        image={`${siteUrl}/api/og?title=${encodeURIComponent(post.title)}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.description,
          datePublished: post.date,
          url,
          mainEntityOfPage: url,
          keywords: post.tags.join(", "),
          image: `${siteUrl}/api/og?title=${encodeURIComponent(post.title)}`,
          author: { "@type": "Person", "@id": `${siteUrl}/#person`, name, url: siteUrl },
        }}
      />
      <article>
        <Typography variant="h3" component="h1">
          {post.title}
        </Typography>
        <Typography color="textSecondary" className={classes.byline}>
          By {name} · <time dateTime={post.date}>{post.date}</time> · {post.readingMinutes} min read
          {post.originalUrl && (
            <>
              {" · "}Originally published on{" "}
              <a href={post.originalUrl} target="_blank" rel="noopener" style={{ color: "inherit" }}>
                {new URL(post.originalUrl).hostname.replace("www.", "")}
              </a>
            </>
          )}
        </Typography>
        <div className={classes.body} dangerouslySetInnerHTML={{ __html: post.html }} />
      </article>
      <AuthorCard />
    </ContentPage>
  );
}
