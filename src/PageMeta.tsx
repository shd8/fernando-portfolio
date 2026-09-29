import React from "react";
import Head from "next/head";
import data from "../data.json";
import { siteUrl, title as defaultTitle, description as defaultDescription, ogImage } from "./seo";

const { name, profile } = data;

interface PageMetaProps {
  title?: string;
  description?: string;
  path?: string;
  type?: "profile" | "website" | "article";
  publishedTime?: string;
  jsonLd?: object;
  image?: string;
}

// Per-page title, description, canonical URL and social cards. Site-wide tags live in _document.
export default function PageMeta({ title = defaultTitle, description = defaultDescription, path = "/", type = "profile", publishedTime, jsonLd, image = ogImage }: PageMetaProps) {
  const url = `${siteUrl}${path}`;

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} key="description" />
      <link rel="canonical" href={url} key="canonical" />
      <meta property="og:type" content={type} key="og:type" />
      <meta property="og:title" content={title} key="og:title" />
      <meta property="og:description" content={description} key="og:description" />
      <meta property="og:url" content={url} key="og:url" />
      <meta property="og:image" content={image} key="og:image" />
      <meta property="og:image:width" content="1200" key="og:image:width" />
      <meta property="og:image:height" content="630" key="og:image:height" />
      <meta property="og:image:alt" content={image === ogImage ? `${name}, ${profile.jobTitle}` : title} key="og:image:alt" />
      {type === "profile" && <meta property="profile:first_name" content="Fernando" key="profile:first_name" />}
      {type === "profile" && <meta property="profile:last_name" content="Gómez Graciani" key="profile:last_name" />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} key="article:published_time" />}
      {publishedTime && <meta property="article:author" content={name} key="article:author" />}
      <meta name="twitter:title" content={title} key="twitter:title" />
      <meta name="twitter:description" content={description} key="twitter:description" />
      <meta name="twitter:image" content={image} key="twitter:image" />
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} key="page-jsonld" />}
    </Head>
  );
}
