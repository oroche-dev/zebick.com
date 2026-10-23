import React from 'react';
import Breadcrumbs from './Breadcrumbs';

/**
 * Minimal page title — just an h1 (+ optional short description), no badge
 * pill, no border/background box, no stats row. Every page except the home
 * page still needs exactly one h1 for SEO; this is it, kept as plain as
 * possible so it doesn't read as its own "hero banner".
 * children render above the title (e.g. a back button).
 */
const PageIntro = ({ title, description, breadcrumbs, children, testid = 'page-intro' }) => (
  // No visible banner: title/description/breadcrumbs are sr-only (an h1 is
  // still required on every page for SEO, just not shown as its own block).
  // children (e.g. a back button) DOES render visibly — only present on a
  // couple of pages, which is why this wrapper keeps header-clearance
  // padding just for that case (see .page-intro in responsive.css); pages
  // without children get zero extra height, no banner-shaped gap left behind.
  // A <div>, not <section> — every bare `section` tag gets forced padding
  // from a site-wide mobile rule, which reintroduced exactly the empty
  // banner-shaped gap this component exists to remove.
  <div className={children ? 'page-intro' : undefined} data-testid={testid}>
    <div className="container" style={{ maxWidth: '720px' }}>
      {children}
      <div className="sr-only">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} inline />}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </div>
  </div>
);

export default PageIntro;
