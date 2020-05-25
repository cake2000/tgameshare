import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

const seoImageURL = 'https://i.imgur.com/2d9Ols7.jpg';
const getMetaTags = (
  { title, description, url, contentType, keywords }) => {
  return [
    { itemprop: 'description', content: description },
    { itemprop: 'image', content: seoImageURL },
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no' },
    { name: 'HandheldFriendly', content: true },
    { name: 'robots', content: 'index,follow,noodp' },
    { name: 'googlebot', content: 'index,follow' },
    { name: 'generator', content: 'program' },
    { name: 'subject', content: 'meteor' },
    { name: 'url', content: url },
    { name: 'description', content: description },
    { name: 'keywords', content: keywords },
    { name: 'pinterest', content: 'nopin', description: 'Sorry, you cant save from my website!' },
    { property: 'og:title', content: title },
    { property: 'og:type', content: contentType },
    { property: 'og:url', content: url },
    { property: 'og:image', content: seoImageURL },
    { property: 'og:description', content: description },
    { property: 'og:site_name', content: 'TGame' },
    { property: 'fb:app_id', content: '1704724152932316' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:site', content: '@tgame' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:creator', content: '@tgame' },
    { name: 'twitter:image:src', content: seoImageURL }
  ];
};

const seoURL = path => Meteor.absoluteUrl(path);
const SEO = (
  { schema, title, description, path, contentType, keywords }) => (
    <Helmet
      htmlAttributes={{
        lang: 'en',
        itemscope: undefined,
        itemtype: `http://schema.org/${schema}`,
      }}
      title={title}
      link={[
        { rel: 'canonical', href: seoURL(path) },
      ]}
      meta={getMetaTags({
        title,
        description,
        contentType,
        url: seoURL(path),
        keywords
      })}
    />
);

SEO.propTypes = {
  schema: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired,
  contentType: PropTypes.string.isRequired,
  keywords: PropTypes.string.isRequired
};

export default SEO;
