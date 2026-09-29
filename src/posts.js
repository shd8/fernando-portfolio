import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { Marked } from "marked";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";

// Code blocks are highlighted at build time, so posts ship no highlighting JavaScript.
const marked = new Marked(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight: (code, lang) => hljs.highlight(code, { language: hljs.getLanguage(lang) ? lang : "plaintext" }).value,
  })
);

const WORDS_PER_MINUTE = 220;

// Blog posts live in content/blog/<slug>.md with front matter: title, description, date, tags,
// draft (optional), originalUrl (optional: where the post first appeared, e.g. a LinkedIn article).
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
    originalUrl: data.originalUrl || null,
    draft: !!data.draft,
    readingMinutes: Math.max(1, Math.round(content.split(/\s+/).length / WORDS_PER_MINUTE)),
    content,
  };
};

export const getAllPosts = () => {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".md"))
    .map(readPostFile)
    // Posts dated in the future stay hidden until that day (pages re-check hourly via ISR).
    .filter((post) => !post.draft && post.date <= new Date().toISOString().slice(0, 10))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
};

export const getPost = (slug) => {
  const post = getAllPosts().find((p) => p.slug === slug);
  return post ? { ...post, html: String(marked.parse(post.content, { async: false })) } : null;
};

export const getPostSummaries = () => getAllPosts().map(({ content, ...summary }) => summary);
