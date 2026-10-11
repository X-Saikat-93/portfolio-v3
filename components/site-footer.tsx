import { cacheLife } from 'next/cache'
import Link from 'next/link'

import { FooterClock } from '~/components/footer-clock'
import { FooterStage } from '~/components/footer-stage'
import { FooterUtilities } from '~/components/footer-utilities'
import { EmailCard, GitHubCard, LinkedInCard, type GitHubSnapshot } from '~/components/social-cards'
import { brailleText } from '~/lib/braille'
import { T } from '~/lib/i18n'
import { localePath, type Locale } from '~/lib/locale-route'

function Tree({
  zh,
  en,
  className,
  children,
}: {
  zh: string
  en: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={className ? `footer-tree ${className}` : 'footer-tree'}>
      <h2 className="footer-label">
        <T zh={zh} en={en} />
      </h2>
      <ul>{children}</ul>
    </div>
  )
}

async function CopyrightYear() {
  'use cache'
  cacheLife({ stale: 86_400, revalidate: 86_400, expire: 86_400 })

  return new Date().getFullYear()
}

// Three bands: a maker's signature with local time, the directory trees,
// and the utilities line, closed by an oversized wordmark that dissolves
// into the page. FooterStage owns the entrance and the wordmark's light.
export function SiteFooter({
  github,
  locale = 'en',
}: {
  github: GitHubSnapshot
  locale?: Locale
}) {
  return (
    <footer className="site-footer mx-auto mt-24 w-full max-w-[37.5rem] text-sm text-muted-foreground">
      <FooterStage>
        <div className="footer-band footer-colophon" style={{ '--band': 0 } as React.CSSProperties}>
          <div className="footer-signature">
            <span className="footer-signature-mark" aria-hidden="true">
              SD
            </span>
            <div className="footer-signature-copy">
              <p className="footer-signature-name">Saikat Das</p>
              <p className="footer-copyright">
                © <CopyrightYear />
              </p>
            </div>
            <p className="footer-braille" aria-hidden="true">
              {brailleText('saikat das')}
            </p>
          </div>
          <div className="footer-whereabouts">
            <FooterClock />
            <div className="footer-geo" aria-hidden>
              <svg className="footer-geo-globe" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="9" />
                <ellipse cx="10" cy="10" rx="4" ry="9" />
                <path d="M1 10h18M1.9 6h16.2M1.9 14h16.2" />
              </svg>
              <span className="footer-geo-lines">
                <span>INDIA</span>
                <span>OPEN TO REMOTE</span>
              </span>
            </div>
          </div>
        </div>

        <div className="footer-band footer-directory" style={{ '--band': 1 } as React.CSSProperties}>
          <Tree zh="联系" en="contact">
            <li>
              <GitHubCard data={github} />
            </li>
            <li>
              <LinkedInCard />
            </li>
            <li>
              <EmailCard address="ibx.saikat37@gmail.com" />
            </li>
          </Tree>
          <Tree zh="索引" en="index" className="footer-tree-index">
            <li>
              <Link href={localePath(locale, '/')} className="footer-tree-link">
                <T zh="首页" en="Home" />
              </Link>
            </li>
            <li>
              <Link href={localePath(locale, '/projects')} className="footer-tree-link">
                <T zh="项目" en="Projects" />
              </Link>
            </li>
            <li>
              <Link href={localePath(locale, '/photos')} className="footer-tree-link">
                <T zh="照片" en="Photos" />
              </Link>
            </li>
            <li>
              <Link href={localePath(locale, '/books')} className="footer-tree-link">
                <T zh="书籍" en="Books" />
              </Link>
            </li>
            <li>
              <Link href={localePath(locale, '/music')} className="footer-tree-link">
                <T zh="音乐" en="Music" />
              </Link>
            </li>
            <li>
              <Link href={localePath(locale, '/blog')} className="footer-tree-link">
                <T zh="写作" en="Writing" />
              </Link>
            </li>
            <li>
              <Link href={localePath(locale, '/resume')} className="footer-tree-link">
                <T zh="简历" en="Resume" />
              </Link>
            </li>
            <li>
              <Link href={localePath(locale, '/now')} className="footer-tree-link">
                <T zh="现在" en="Now" />
              </Link>
            </li>
            <li>
              <Link href={localePath(locale, '/uses')} className="footer-tree-link">
                <T zh="工具" en="Uses" />
              </Link>
            </li>
            <li>
              <Link href={localePath(locale, '/contact')} className="footer-tree-link">
                <T zh="联系" en="Contact" />
              </Link>
            </li>
            <li>
              <a href="/en/feed.xml" className="footer-tree-link">
                RSS
              </a>
            </li>
          </Tree>
        </div>

        <div className="footer-band" style={{ '--band': 2 } as React.CSSProperties}>
          <FooterUtilities locale={locale} />
        </div>

        <p className="footer-wordmark" aria-hidden="true">
          {[...'Saikat'].map((letter, i) => (
            <span key={i} className="footer-wordmark-letter" style={{ '--i': i } as React.CSSProperties}>
              {letter}
            </span>
          ))}
        </p>
      </FooterStage>
    </footer>
  )
}
