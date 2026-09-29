import data from "../../data.json";
import { siteUrl, description, withYears } from "../../src/seo";
import { getPostSummaries } from "../../src/posts";

const { name, profile, about, skills, experience } = data;

const formatMonth = (date) => (date ? new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Present");

const skillName = (skill) => (typeof skill === "string" ? skill : skill.alt);

// https://llmstxt.org — a plain-text profile for LLMs and AI search engines.
export default function handler(req, res) {
  const posts = getPostSummaries();
  const body = `# ${name}

> ${description}

${withYears(about.description)}

## Quick facts

- Name: ${name} (also written ${profile.alternateNames.join(", ")})
- Role: ${profile.jobTitle}
- Currently: ${experience["Work Experience"][0].role} at ${profile.currentCompany}
- Location: ${profile.city}, Spain. Works remotely (CET/CEST timezone)
- Open to: remote Full Stack Engineer, Software Engineer, Senior Frontend Engineer and React/TypeScript roles
- Languages: ${profile.languages.join(", ")}
- Contact: ${profile.email}
- Portfolio: ${siteUrl}
- CV: ${siteUrl}/cv (PDF: ${siteUrl}/Fernando-Gomez-Graciani-CV.pdf)
${profile.sameAs.map((url) => `- ${new URL(url).hostname.replace("www.", "")}: ${url}`).join("\n")}

## Skills

${Object.entries(skills)
  .map(([group, list]) => `- ${group}: ${list.map(skillName).join(", ")}`)
  .join("\n")}

## Experience

${experience["Work Experience"]
  .map(
    ({ organization, role, startDate, endDate, city, country, highlights }) =>
      `- ${role}, ${organization} (${formatMonth(startDate)} – ${formatMonth(endDate)}, ${city ? `${city}, ${country}` : "Remote"})\n${highlights.map((h) => `  - ${h}`).join("\n")}`
  )
  .join("\n")}

${
  data.talks.length
    ? `## Talks\n\n${data.talks.map((talk) => `- "${talk.title}", ${talk.event} (${talk.date})${talk.url ? `: ${talk.url}` : ""}`).join("\n")}\n\n`
    : ""
}${posts.length ? `## Articles\n\n${posts.map((post) => `- [${post.title}](${siteUrl}/blog/${post.slug}) (${post.date}): ${post.description}`).join("\n")}\n\n` : ""}## Projects

${data.projects.repositories.map((repo) => `- ${repo}: https://github.com/shd8/${repo}`).join("\n")}
`;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=86400");
  res.send(body);
}
