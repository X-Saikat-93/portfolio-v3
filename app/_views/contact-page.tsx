import { ContactForm } from '~/components/contact-form'
import { PixelCluster } from '~/components/pixel-cluster'

export function ContactPageView() {
  return (
    <div className="mx-auto w-full max-w-[37.5rem] px-6">
      <div className="flex items-start justify-between gap-4">
        <header className="max-w-[31rem]">
          <p className="page-eyebrow enter">Contact</p>
          <h1 className="contact-title enter mt-5 text-balance">
            A thoughtful message is a good place to start.
          </h1>
          <p
            className="page-introduction enter mt-4 text-balance"
            style={{ '--enter-delay': '70ms' } as React.CSSProperties}
          >
            Tell me what you are making, considering, or trying to untangle. The note lands in
            my private admin inbox.
          </p>
        </header>
        <PixelCluster variant={4} className="enter shrink-0" />
      </div>

      <div className="mt-10">
        <ContactForm />
      </div>

      <div className="contact-page-footer enter-swing">
        <span>Prefer a direct line?</span>
        <a href="mailto:ibx.saikat37@gmail.com">ibx.saikat37@gmail.com</a>
      </div>
    </div>
  )
}
