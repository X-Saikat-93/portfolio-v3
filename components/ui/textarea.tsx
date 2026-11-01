import * as React from 'react'

import { cn } from '~/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        'field-sizing-content min-h-20 w-full rounded-lg border border-border bg-transparent px-2.5 py-2 text-base text-foreground outline-none',
        'placeholder:text-muted-foreground',
        'transition-colors duration-150 motion-reduce:transition-none',
        'focus:border-foreground focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[color:var(--sun)]',
        'disabled:opacity-50 aria-invalid:border-destructive aria-invalid:focus:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
