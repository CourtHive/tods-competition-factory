import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import React from 'react';
import clsx from 'clsx';

const features = [
  {
    title: 'Standards based',
    imageUrl: 'img/TODS.png',
    imageLink: 'https://itftennis.atlassian.net/wiki/spaces/TODS/overview',
    description: (
      <>
        The Competition Factory consumes, produces, and generates a JSON format co-developed with the International
        Tennis Federation (TODS) and extends it to support a wide range of competitions (CODES).
      </>
    ),
  },
  {
    title: 'Proven in production',
    imageUrl: 'img/tmx.png',
    imageLink: 'https://courthive.github.io/TMX/#/',
    description: (
      <>
        Based on years of experience running thousands of events for numerous governing bodies, Competition Factory now
        powers the tournament management platform of the USTA and the Intercollegiate Tennis Association.
      </>
    ),
  },
  {
    title: 'Rigorously tested',
    imageUrl: 'img/vitest-logo.svg',
    description: (
      <>
        Written in 100% TypeScript following a Test Driven Development process utilizing Vitest. Almost 600 test files
        and ~2700 total tests cover more than 96% of the code base.
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
    <div className={clsx('col col--4', styles.feature)} onClick={() => handleOnClick(imageLink)}>
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
    <Layout title={`${siteConfig.title}`} description="Tournament Management Components">
      <header className={clsx('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              style={{ color: 'lightgreen' }}
              className={clsx('button button--outline button--secondary button--lg', styles.getStarted)}
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
