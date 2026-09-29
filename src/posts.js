import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

// Blog posts live in content/blog/<slug>.md with front matter: title, description, date, tags, canonical (optional).
const POSTS_DIR = path.join(process.cwd(), "content", "blog");

const readPostFile = (file) => {
  const slug = file.replace(/\.md$/, "");
  const { data, content } = matter(fs.readFileSync(path.join(POSTS_DIR, file), "utf8"));
  return {
    slug,
    title: data.title,
    description: data.description,
    date: new Date(data.date).toISOString().slice(0, 10),
    tags: data.tags || [],
    draft: !!data.draft,
    content,
  };
};

export const getAllPosts = () => {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".md"))
    .map(readPostFile)
    .filter((post) => !post.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
};

export const getPost = (slug) => {
  const post = getAllPosts().find((p) => p.slug === slug);
  return post ? { ...post, html: String(marked.parse(post.content, { async: false })) } : null;
};

export const getPostSummaries = () => getAllPosts().map(({ content, ...summary }) => summary);
