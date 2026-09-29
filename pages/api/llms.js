import data from "../../data.json";
import { siteUrl, description, withYears, languagesText } from "../../src/seo";
import { getPostSummaries } from "../../src/posts";

const { name, profile, experience } = data;

const formatMonth = (date) => (date ? new Date(date).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "Present");

// https://llmstxt.org — a plain-text profile for LLMs and AI search engines.
export default function handler(req, res) {
  const posts = getPostSummaries();
  const body = `# ${name}

> ${description}

${withYears(profile.summary)}

## Quick facts

- Name: ${name} (also written ${profile.alternateNames.join(", ")})
- Role: ${profile.jobTitle}
- Currently: ${experience["Work Experience"][0].role} at ${profile.currentCompany}
- Location: ${profile.city}, Spain. Works remotely (CET/CEST timezone)
- Open to: remote Senior Full Stack, Senior Frontend and Senior Software Engineer roles (React/TypeScript); relocation considered for a standout role
- Languages: ${languagesText}
- Contact: ${profile.email}
- Portfolio: ${siteUrl}
- CV: ${siteUrl}/cv (PDF: ${siteUrl}/Fernando-Gomez-Graciani-CV.pdf)
${profile.sameAs.map((url) => `- ${new URL(url).hostname.replace("www.", "")}: ${url}`).join("\n")}

## Skills

${profile.cvSkills.map(({ group, items }) => `- ${group}: ${items.join(", ")}`).join("\n")}

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
}${posts.length ? `## Articles\n\n${posts.map((post) => `- [${post.title}](${siteUrl}/blog/${post.slug}) (${post.date}): ${post.description}`).join("\n")}\n\n` : ""}## Education

${profile.education.map(({ program, institution, note }) => `- ${program}, ${institution}${note ? `. ${note}` : ""}`).join("\n")}

## Certifications

${profile.certifications.map((certification) => `- ${certification}`).join("\n")}

## Projects

${data.projects.repositories.map((repo) => `- ${repo}: https://github.com/shd8/${repo}`).join("\n")}
`;

  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=86400");
  res.send(body);
}
