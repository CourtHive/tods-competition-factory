import React from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

const features = [
  {
    title: 'Standards based',
    imageUrl: 'img/TODS.png',
    imageLink: 'https://itftennis.atlassian.net/wiki/spaces/TODS/overview',
    description: (
      <>
        The Competition Factory generates and consumes TODS documents and
        insures that all document mutations are valid.
      </>
    ),
  },
  {
    title: 'Proven in production',
    imageUrl: 'img/tmx.png',
    description: (
      <>
        Based on years of experience running thousands of events for national
        governing bodies, Competition Factory now powers the tournament
        management platform of the largest tennis federation in the world.
      </>
    ),
  },
  {
    title: 'Rigorously tested',
    imageUrl: 'img/jest.png',
    description: (
      <>
        Built following a Test Driven Development process utilizing Jest. With
        more than 200 test suites and ~650 total tests, quality control is
        assured.
      </>
    ),
  },
];

function handleOnClick(imageLink) {
  if (imageLink) window.open(imageLink, '_blank', 'noopener,noreferrer');
}

function Feature({ imageLink, imageUrl, title, description }) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div
      className={clsx('col col--4', styles.feature)}
      onClick={() => handleOnClick(imageLink)}
    >
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

export default function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Tournament Management Components"
    >
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              style={{ color: 'lightgreen' }}
              className={clsx(
                'button button--outline button--secondary button--lg',
                styles.getStarted
              )}
              to={useBaseUrl('docs/')}
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}
