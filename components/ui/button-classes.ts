import { cva, type VariantProps } from 'class-variance-authority'

// Button styling, shared by the client <Button> and by server-rendered
// links that should look like buttons. Print corners, a hairline outline
// or an ink fill, and a press that sinks to --press-scale.
export const buttonVariants = cva(
  [
    'relative isolate inline-flex items-center justify-center rounded-[2px] text-[12px] cursor-pointer select-none no-underline',
    'transition-[background-color,color,box-shadow,scale] duration-[var(--dur-quick)] ease-[var(--ease-ink)]',
    'active:scale-[var(--press-scale)] active:duration-[var(--dur-instant)]',
    'disabled:opacity-50 disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:pointer-events-none',
  ],
  {
    variants: {
      variant: {
        primary: 'bg-foreground text-background hover:bg-[color-mix(in_oklab,var(--ink)_86%,var(--ground))]',
        secondary: 'bg-secondary text-foreground hover:bg-active',
        tertiary: 'text-foreground shadow-[inset_0_0_0_1px_var(--ink-faint)] hover:bg-hover',
        ghost: 'text-muted-foreground hover:bg-hover hover:text-foreground',
      },
      size: {
        sm: 'h-6 px-2 gap-1',
        md: 'h-7 px-2 gap-1.5',
        // the prominent-action tier: a 44px target, 14px medium label
        lg: 'h-11 px-4 gap-2 text-sm font-medium',
        'icon-sm': 'h-6 w-6 [&_svg]:h-3.5 [&_svg]:w-3.5',
        icon: 'h-7 w-7 [&_svg]:h-4 [&_svg]:w-4',
        'icon-lg': 'h-8 w-8 [&_svg]:h-5 [&_svg]:w-5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

export type ButtonVariantProps = VariantProps<typeof buttonVariants>

// Engaged state for a button that drives an open popover or menu.
export const activeButtonClasses: Record<string, string> = {
  primary: 'bg-[color-mix(in_oklab,var(--ink)_80%,var(--ground))]',
  secondary: 'bg-active',
  tertiary: 'bg-active',
  ghost: 'bg-active text-foreground',
}

// Destructive tone: filled primary on --danger; quieter variants read
// danger ink over a faint danger wash. Focus stays the shared ring.
export const destructiveButtonClasses: Record<string, string> = {
  primary: 'bg-destructive text-background hover:bg-[color-mix(in_oklab,var(--danger)_88%,var(--ground))]',
  secondary: 'bg-destructive/10 text-destructive hover:bg-destructive/15',
  tertiary: 'text-destructive shadow-[inset_0_0_0_1px_var(--danger)] hover:bg-destructive/10',
  ghost: 'text-destructive hover:bg-destructive/10 hover:text-destructive',
}

// Vertical-only hit-target extension to 44px for compact buttons.
export const expandHitAreaClasses =
  "before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-['']"
