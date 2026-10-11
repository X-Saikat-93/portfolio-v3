import { Funnel_Display, Funnel_Sans, Geist_Mono } from 'next/font/google'
import localFont from 'next/font/local'

import type { Locale } from '~/lib/locale-route'

// Funnel: one family in two optical cuts — Sans for reading, Display for headlines
const funnelSans = Funnel_Sans({
  subsets: ['latin'],
  variable: '--font-funnel',
  display: 'swap',
})

const funnelDisplay = Funnel_Display({
  subsets: ['latin'],
  variable: '--font-funnel-display',
  display: 'swap',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
})

const frexSansGB = localFont({
  src: [
    { path: './_fonts/FrexSansGB-Regular.woff2', weight: '400' },
    { path: './_fonts/FrexSansGB-Medium.woff2', weight: '500' },
    { path: './_fonts/FrexSansGB-SemiBold.woff2', weight: '600' },
  ],
  variable: '--font-frex-gb',
  display: 'swap',
  preload: false,
})

const latinFontVariables = [funnelSans.variable, funnelDisplay.variable, geistMono.variable].join(' ')

export function cjkFontVariableForLocale(locale: Locale) {
  return locale === 'zh' ? frexSansGB.variable : ''
}
export function fontVariablesForLocale(locale: Locale) {
  return [latinFontVariables, cjkFontVariableForLocale(locale)]
    .filter(Boolean)
    .join(' ')
}
