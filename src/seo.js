import data from "../data.json";

const { name, profile, experience } = data;

// Set NEXT_PUBLIC_SITE_URL once a custom domain is attached in Vercel.
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "https://fernando-gomez-graciani.vercel.app").replace(/\/$/, "");

const firstJobStart = experience["Work Experience"].map(({ startDate }) => new Date(startDate)).sort((a, b) => a - b)[0];

export const yearsOfExperience = Math.floor((Date.now() - firstJobStart) / (365.25 * 24 * 60 * 60 * 1000));

export const withYears = (text) => text.replace(/\{years\}/g, String(yearsOfExperience));

export const title = `${name} — Senior Full Stack Engineer (${profile.titleStack})`;

export const description = withYears(profile.metaDescription);

export const ogImage = `${siteUrl}/api/og`;

export const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": `${siteUrl}/#person`,
      name,
      alternateName: profile.alternateNames,
      givenName: "Fernando",
      familyName: "Gómez Graciani",
      jobTitle: profile.jobTitle,
      description,
      url: siteUrl,
      image: `${siteUrl}/FERNANDO.webp`,
      email: `mailto:${profile.email}`,
      address: { "@type": "PostalAddress", addressLocality: profile.city, addressCountry: profile.countryCode },
      worksFor: { "@type": "Organization", name: profile.currentCompany, url: profile.currentCompanyUrl },
      alumniOf: profile.alumniOf.map((org) => ({ "@type": "EducationalOrganization", name: org })),
      knowsAbout: profile.keywords,
      knowsLanguage: profile.languages,
      sameAs: profile.sameAs,
    },
    {
      "@type": "ProfilePage",
      "@id": `${siteUrl}/#profile`,
      url: siteUrl,
      name: title,
      description,
      inLanguage: "en",
      mainEntity: { "@id": `${siteUrl}/#person` },
    },
  ],
};
