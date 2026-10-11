import { Fragment, type CSSProperties } from 'react'
import Link from 'next/link'

import { HomeIntroRotator } from '~/components/home-intro-rotator'
import {
  EmailCard,
  GitHubCard,
  type GitHubSnapshot,
} from '~/components/social-cards'
import { formatDate } from '~/lib/date'
import { nowBuilding, nowLastUpdated } from '~/lib/now'

// One quiet, dated line from the Now page, so the homepage reads as current.
function HomeNowLine() {
  const current = nowBuilding[0]
  if (!current) return null
  return (
    <Link
      href="/en/now"
      className="home-now-line intro-settle"
      style={{ '--settle': 3 } as CSSProperties}
    >
      <span className="home-now-lamp" aria-hidden />
      <span className="home-now-copy">
        Now building <span className="home-now-title">{current.title}</span>
      </span>
      <time dateTime={nowLastUpdated} className="home-now-date">
        Updated{' '}
        {formatDate(new Date(`${nowLastUpdated}T00:00:00Z`))}
      </time>
    </Link>
  )
}

const LEAD_WORDS = ['I', 'build', 'software', 'that', 'stays'] as const

const INTRO_PHRASES = [
  'calm on a bad network.',
  'honest about money.',
  'fast as the data grows.',
  'safe to ship on a Friday.',
] as const

function HomeContact({ github }: { github: GitHubSnapshot }) {
  return (
    <p className="home-intro-contact intro-settle" style={{ '--settle': 2 } as CSSProperties}>
      Code on <GitHubCard data={github} triggerClassName="home-contact-link" />, background on{' '}
      <a
        href="https://www.linkedin.com/in/saikat933/"
        target="_blank"
        rel="noreferrer"
        className="home-contact-link"
      >
        LinkedIn
      </a>
      , or write to{' '}
      <EmailCard
        address="ibx.saikat37@gmail.com"
        trigger="ibx.saikat37@gmail.com"
        triggerClassName="home-contact-link"
      />
    </p>
  )
}

// A kinetic statement: the lead rises out of word masks, then one quality
// at a time completes it (HomeIntroRotator). Screen readers get the whole
// sentence once instead of the moving parts.
export function HomeIntroduction({ github }: { github: GitHubSnapshot }) {
  const spoken = `I build software that stays ${INTRO_PHRASES.slice(0, -1)
    .map((phrase) => phrase.replace(/\.$/, ''))
    .join(', ')}, and ${INTRO_PHRASES.at(-1)}`

  return (
    <div className="home-introduction">
      <p className="home-intro-statement">
        <span className="sr-only">{spoken}</span>
        <span className="home-intro-lead" aria-hidden="true">
          {LEAD_WORDS.map((word, i) => (
            <Fragment key={word}>
              <span className="intro-mask">
                <span className="intro-mask-word" style={{ '--w': i } as CSSProperties}>
                  {word}
                </span>
              </span>{' '}
            </Fragment>
          ))}
        </span>
        <HomeIntroRotator phrases={INTRO_PHRASES} />
      </p>

      <p className="home-intro-body intro-settle" style={{ '--settle': 1 } as CSSProperties}>
        Product engineer across the full stack, from the interface people touch to the systems
        that keep it correct. Currently building marketplace and hiring platforms at Human
        Before Resource.
      </p>

      <HomeContact github={github} />
      <HomeNowLine />
    </div>
  )
}
