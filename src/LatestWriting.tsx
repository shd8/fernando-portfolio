import React from "react";
import Link from "next/link";
import { Button, Card, CardActionArea, CardContent, Grid, makeStyles, Typography } from "@material-ui/core";

interface PostSummary {
  slug: string;
  title: string;
  description: string;
  date: string;
}

const useStyles = makeStyles((theme) => ({
  cont: {
    paddingTop: theme.spacing(10),
    paddingBottom: theme.spacing(10),
  },
  card: {
    height: "100%",
  },
  cardActionArea: {
    height: "100%",
    display: "flex",
    alignItems: "flex-start",
  },
  all: {
    marginTop: theme.spacing(3),
  },
}));

// The newest posts on the home page, linking to the blog.
export default function LatestWriting({ posts }: { posts: PostSummary[] }) {
  const classes = useStyles();
  if (posts.length === 0) return null;

  return (
    <Grid container direction="column" alignItems="center" className={classes.cont} component="section" aria-labelledby="latest-writing">
      <Typography variant="h2" gutterBottom align="center" id="latest-writing">
        Latest writing
      </Typography>
      <Grid container spacing={2}>
        {posts.map((post) => (
          <Grid item xs={12} md={4} key={post.slug}>
            <Card className={classes.card} component="article">
              <CardActionArea component={Link} href={`/blog/${post.slug}`} className={classes.cardActionArea}>
                <CardContent>
                  <Typography color="textSecondary" variant="body2" component="time" dateTime={post.date}>
                    {post.date}
                  </Typography>
                  <Typography variant="h5" component="h3" gutterBottom>
                    {post.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {post.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Button component={Link} href="/blog" variant="outlined" className={classes.all}>
        All posts
      </Button>
    </Grid>
  );
}
