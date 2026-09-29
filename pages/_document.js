import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import { ServerStyleSheets } from '@material-ui/core/styles';
import data from '../data.json'
import { jsonLd } from '../src/seo'

const { name, profile } = data
const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION

export default class MyDocument extends Document {
  render() {
    return (
      <Html lang="en" style={{ overflowX: "hidden" }}>
        <Head>
          <meta charSet='utf-8' />
          <meta name="theme-color" content="black" />
          <meta name="keywords" content={[name, ...profile.alternateNames, profile.jobTitle, 'Full Stack Engineer', 'Software Engineer', 'Frontend Engineer', 'Remote', ...profile.keywords].join(', ')} />
          <meta name="author" content={name} />
          <meta name="robots" content="index, follow, max-image-preview:large" />
          {googleSiteVerification && <meta name="google-site-verification" content={googleSiteVerification} />}

          <meta property="og:site_name" content={name} />
          <meta property="og:locale" content="en_US" />
          <meta name="twitter:card" content="summary_large_image" />

          <link rel="alternate" type="text/plain" title="LLM-readable profile" href="/llms.txt" />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <link 
            rel="preload" 
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap" as="style"
          />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
          />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png"/>
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/>
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png"/>
          <link rel="manifest" href="/manifest.webmanifest"></link>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

// `getInitialProps` belongs to `_document` (instead of `_app`),
// it's compatible with server-side generation (SSG).
MyDocument.getInitialProps = async (ctx) => {
  // Resolution order
  //
  // On the server:
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. document.getInitialProps
  // 4. app.render
  // 5. page.render
  // 6. document.render
  //
  // On the server with error:
  // 1. document.getInitialProps
  // 2. app.render
  // 3. page.render
  // 4. document.render
  //
  // On the client
  // 1. app.getInitialProps
  // 2. page.getInitialProps
  // 3. app.render
  // 4. page.render

  // Render app and page and get the context of the page with collected side effects.
  const sheets = new ServerStyleSheets();
  const originalRenderPage = ctx.renderPage;

  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => sheets.collect(<App {...props} />),
    });

  const initialProps = await Document.getInitialProps(ctx);

  return {
    ...initialProps,
    // Styles fragment is rendered after the app and page rendering finish.
    styles: [...React.Children.toArray(initialProps.styles), sheets.getStyleElement()],
  };
};
