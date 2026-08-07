import { cacheLife } from 'next/cache'
import Link from 'next/link'

import { FooterClock } from '~/components/footer-clock'
import { EmailCard, GitHubCard, type GitHubSnapshot } from '~/components/social-cards'
import { brailleText } from '~/lib/braille'
import { T } from '~/lib/i18n'
import { localePath, type Locale } from '~/lib/locale-route'

function Tree({
  zh,
  en,
  children,
}: {
  zh: string
  en: string
  children: React.ReactNode
}) {
  return (
    <div className="footer-tree">
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

// Swiss editorial footer, set as folder trees: each column is a directory
// listing with box-drawing connectors.
export function SiteFooter({
  github,
  locale = 'en',
}: {
  github: GitHubSnapshot
  locale?: Locale
}) {
  return (
    <footer className="mx-auto mt-24 w-full max-w-[37.5rem] px-6 pb-24 text-sm text-muted-foreground sm:pb-12">
      <div className="hairline-top grid grid-cols-2 gap-x-6 gap-y-8 pt-8 sm:grid-cols-3">
        <Tree zh="联系" en="contact">
          <li>
            <GitHubCard data={github} />
          </li>
          <li>
            <EmailCard address="ibx.saikat37@gmail.com" />
          </li>
        </Tree>
        <Tree zh="索引" en="index">
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
        <div className="footer-colophon col-span-2 sm:order-first sm:col-span-1">
          <div>
            <p>
              © <CopyrightYear /> Saikat Das
            </p>
            <p className="footer-braille" aria-hidden>
              {brailleText('saikat das')}
            </p>
          </div>
          <div className="flex flex-col gap-2.5">
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
      </div>
    </footer>
  )
}
