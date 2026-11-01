import Link from 'next/link'

import { RevealScope } from '~/components/reveal-scope'
import { publicPageMetadata } from '~/lib/public-page-metadata'

const copy = publicPageMetadata.terms.en
const EMAIL = 'ibx.saikat37@gmail.com'
export const TERMS_EFFECTIVE = '2026-11-01'

function TermsSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <>
      <h2 id={id}>{title}</h2>
      {children}
    </>
  )
}

// The terms set on the same sheet as the privacy notice. They describe this
// site as it is: a personal portfolio with writing, project records and a
// contact form, no accounts and no sales.
export function TermsPageView() {
  return (
    <article className="page">
      <header className="page-head">
        <h1 className="page-title">{copy.heading}</h1>
        <p className="page-lede">{copy.lede}</p>
        <p className="page-meta">
          <span className="page-meta-item">
            <span className="status-dot" aria-hidden="true" />
            Effective <time dateTime={TERMS_EFFECTIVE}>November 1, 2026</time>
          </span>
          <Link href="/en/privacy" className="ink-link">
            Privacy policy
          </Link>
        </p>
      </header>

      <div className="page-body legal-sheet paper paper-grain paper-edge">
        <RevealScope className="prose legal-text">
          <TermsSection id="terms-about" title="About these terms">
            <p>
              This website is the personal portfolio of Saikat Das. By using it you agree to these terms. If you do not
              agree, please do not use the site. The <Link href="/en/privacy">Privacy policy</Link> explains how
              information you send is handled and forms part of these terms.
            </p>
          </TermsSection>

          <TermsSection id="terms-use" title="Using the site">
            <p>You are welcome to read, link to, and share the pages here. When you use the site, please do not:</p>
            <ul>
              <li>attempt to break, overload, probe, or gain unauthorised access to the site, its admin area, or its services;</li>
              <li>send spam, malware, or unlawful, abusive, or misleading messages through the contact form;</li>
              <li>scrape or mirror the site in a way that burdens it, or republish its content as your own.</li>
            </ul>
            <p>Access may be limited or refused for anyone who does, and the contact form is rate limited.</p>
          </TermsSection>

          <TermsSection id="terms-content" title="Writing, images, and design">
            <p>
              Unless a page says otherwise, the writing, photographs, illustrations, and design of this site are
              © Saikat Das, all rights reserved. You may quote short excerpts with credit and a link back to the
              original page. Republishing whole articles or images needs written permission.
            </p>
            <p>
              Book covers, album artwork, logos, and other third-party material shown with a book, record, or project
              belong to their respective owners and appear only to identify that work. They are not covered by the
              notice above and are not offered for reuse. Fonts, software libraries, and services are used under
              their own licences, listed on the <Link href="/en/credits">Credits and licences</Link> page.
            </p>
            <p>
              Code samples inside articles are illustrations. You may adapt them in your own work; they come with no
              warranty, and you are responsible for testing them in your own systems.
            </p>
          </TermsSection>

          <TermsSection id="terms-projects" title="Projects and open source">
            <p>
              Project pages describe software I have built or worked on. Open-source projects linked from this site are
              governed by the licence in their own repositories, not by these terms. Products built for clients or
              employers belong to their owners; they are described here only to show the work.
            </p>
            <p>
              The source code of this website is published under the{' '}
              <a href="https://github.com/X-Saikat-93/portfolio-v3/blob/main/LICENSE">MIT License</a>. That licence
              covers the code only, not the writing, images, or other content it displays.
            </p>
          </TermsSection>
          <TermsSection id="terms-opinions" title="Opinions, not advice">
            <p>
              The articles are personal views written in good faith. They are not professional,
              legal, financial, or security advice, and they do not speak for any employer or client. Facts, prices,
              and products change; check current sources before you rely on anything here.
            </p>
          </TermsSection>

          <TermsSection id="terms-marks" title="Names, marks, and links">
            <p>
              Product names, logos, and trademarks mentioned on the site belong to their owners. Mentioning them does
              not imply endorsement or partnership. Links to other websites are provided for convenience; I am not
              responsible for their content or practices.
            </p>
          </TermsSection>

          <TermsSection id="terms-copyright" title="Copyright concerns">
            <p>
              If you believe something on this site uses your work or likeness without permission, write to{' '}
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a> with the page address, the material concerned, and your
              connection to it. Material is reviewed promptly and removed or corrected where the concern is valid.
            </p>
          </TermsSection>

          <TermsSection id="terms-warranty" title="No warranty and liability">
            <p>
              The site is provided as is and as available. I aim to keep it accurate and online but make no promise
              that it is complete, current, or free of errors or interruptions. To the extent the law allows, I am not
              liable for any loss arising from your use of the site or reliance on its content. Nothing in these terms
              limits liability that cannot be limited by law.
            </p>
          </TermsSection>

          <TermsSection id="terms-law" title="Governing law">
            <p>
              These terms are governed by the laws of India. Any dispute that cannot be settled by writing to me first
              will be handled by the competent courts in India, without affecting any rights you have under the law of
              the country where you live.
            </p>
          </TermsSection>

          <TermsSection id="terms-changes" title="Changes and contact">
            <p>
              These terms may be updated as the site changes; the effective date above changes with them. Questions
              about these terms, or requests to reuse content, go to <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.
            </p>
          </TermsSection>
        </RevealScope>
      </div>
    </article>
  )
}
