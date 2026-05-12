import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--light', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/Getting-Started/what-is-grblhal">
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

// This new section contains your markdown content converted to JSX
function HomepageContent() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <div className={clsx('col col--12')}>
            {/* The Heading has been converted to an H2 */}
            <Heading as="h2">The ultimate <a href="https://github.com/gnea/grbl" target="_blank" rel="noopener noreferrer">Grbl</a> port:</Heading>

            {/* The bullet points are now a UL/LI list */}
            <ul>
              <li>
                Available for many <a href="https://github.com/grblHAL/drivers" target="_blank" rel="noopener noreferrer">32 bit processors</a> and <a href="https://github.com/grblHAL/Controllers" target="_blank" rel="noopener noreferrer">controllers</a>.
              </li>
              <li>
                Hardware abstracted (HAL) architecture with processor specific drivers and <a href="https://github.com/grblHAL/core" target="_blank" rel="noopener noreferrer">shared core</a>.
              </li>
              <li>
                <a href="http://svn.io-engineering.com/grblHAL/html/hal_8h.html" target="_blank" rel="noopener noreferrer">Open</a> architecture supports <a href="https://github.com/dresco/STM32H7xx" target="_blank" rel="noopener noreferrer">3rd party drivers</a> and <a href="https://github.com/grblHAL/plugins" target="_blank" rel="noopener noreferrer">plugins</a>, including <a href="https://github.com/grblHAL/Templates" target="_blank" rel="noopener noreferrer">user defined</a> plugins.
              </li>
              <li>
                <a href="https://github.com/grblHAL/core#supported-g-codes" target="_blank" rel="noopener noreferrer">Extended GCode support</a>: <a href="https://github.com/grblHAL/core/wiki/Manual,-semi-automatic-and-automatic-tool-change" target="_blank" rel="noopener noreferrer">tool changes</a>, canned cycles, extra inputs and outputs, optional <a href="https://github.com/grblHAL/core/wiki/Expressions-and-flow-control" target="_blank" rel="noopener noreferrer">parameter and expression</a> handling, ...
              </li>
              <li>
                <a href="https://github.com/grblHAL/Plugin_networking/" target="_blank" rel="noopener noreferrer">Networking</a> (WiFi or ethernet) and <a href="https://github.com/grblHAL/Plugin_SD_card/" target="_blank" rel="noopener noreferrer">SD card</a> options available for some controllers. <a href="https://github.com/grblHAL/Plugin_WebUI" target="_blank" rel="noopener noreferrer">WebUI</a> options.
              </li>
              <li>
                <a href="https://svn.io-engineering.com:8443" target="_blank" rel="noopener noreferrer">Web Builder</a> available for the most popular processors, no need to install a toolchain for creating the firmware.
              </li>
              <li>
                Works with all mainstream GCode senders, some may require <a href="https://github.com/grblHAL/core/wiki/Compatibility-level" target="_blank" rel="noopener noreferrer">compatibility level</a> set to function properly.
              </li>
            </ul>

            {/* The final paragraph */}
            <p>
              <a href="https://github.com/grblHAL/core/wiki" target="_blank" rel="noopener noreferrer">Wiki</a>, general <a href="https://github.com/grblHAL/core/issues" target="_blank" rel="noopener noreferrer">issues</a>, <a href="https://github.com/grblHAL/core/discussions" target="_blank" rel="noopener noreferrer">discussions</a> and <a href="https://github.com/grblHAL/core/blob/master/changelog.md" target="_blank" rel="noopener noreferrer">changelog</a> are found in the <a href="https://github.com/grblHAL/core" target="_blank" rel="noopener noreferrer">core repository</a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}


export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="The official documentation for grblHAL, an advanced, high-performance G-code parser and CNC milling controller for various microcontrollers.">
      <HomepageHeader />
      <main>
        {/* The new content section is added here */}
        <HomepageContent />
      </main>
    </Layout>
  );
}
