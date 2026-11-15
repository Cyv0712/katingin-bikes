import { Helmet } from 'react-helmet-async';
import { withDefaults } from './meta';

// Renders a metadata object from seo/meta.js into the document head.
const Seo = ({ meta }) => {
  const m = withDefaults(meta);
  return (
    <Helmet>
      <title>{m.title}</title>
      <meta name="description" content={m.description} />
      {m.keywords && <meta name="keywords" content={m.keywords} />}
      <link rel="canonical" href={m.canonical} />
      <meta property="og:title" content={m.ogTitle} />
      <meta property="og:description" content={m.ogDescription} />
      {m.ogImage && <meta property="og:image" content={m.ogImage} />}
      <meta property="og:url" content={m.canonical} />
      <meta property="og:type" content={m.ogType} />
      {m.jsonLd.map((data, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(data)}</script>
      ))}
    </Helmet>
  );
};

export default Seo;
