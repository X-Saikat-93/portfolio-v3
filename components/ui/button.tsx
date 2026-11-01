"use client";

import {
  cloneElement,
  forwardRef,
  isValidElement,
  type ButtonHTMLAttributes,
  type ComponentType,
  type ReactElement,
  type ReactNode,
} from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import {
  activeButtonClasses,
  buttonVariants,
  destructiveButtonClasses,
  expandHitAreaClasses,
  type ButtonVariantProps,
} from "~/components/ui/button-classes";
import { cn } from "~/lib/utils";

type ButtonIcon = ComponentType<{
  size?: number;
  strokeWidth?: number;
  className?: string;
}>;

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonVariantProps {
  /** When true, the given single React-element child becomes the rendered element (slot-style). */
  asChild?: boolean;
  loading?: boolean;
  leadingIcon?: ButtonIcon;
  trailingIcon?: ButtonIcon;
  /** Force the visual pressed/held state. Useful when the button drives an
   *  external open piece of UI (a popover, dropdown, etc.) so it reads as
   *  engaged while the menu is showing. */
  active?: boolean;
  /** Destructive tone: primary becomes a filled destructive pill; the other
   *  variants read destructive ink with a destructive-tinted hover. The focus
   *  ring stays neutral — signal color never marks focus. */
  destructive?: boolean;
  /** Restore the 44px minimum hit target with a pseudo-element when the
   *  visible pill is shorter (the .btn-cta::before recipe). Only for buttons
   *  with ≥16px vertical clearance — never in dense stacked rows. */
  expandHitArea?: boolean;
}



const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      leadingIcon: LeadingIcon,
      trailingIcon: TrailingIcon,
      active = false,
      destructive = false,
      expandHitArea = false,
      disabled,
      children,
      style,
      ...props
    },
    ref
  ) => {
    // asChild: the user's element becomes the root while the button's internal
    // structure (bg layer, content wrapper, spinner, icons) survives as its
    // children — the element's own children become the label. We clone the
    // element directly instead of routing through ButtonPrimitive's `render`:
    // Base UI would bolt button semantics (role="button", Space activation)
    // onto e.g. a link, diverging from the Radix flavour's plain-link output.
    const asChildElement =
      asChild && isValidElement(children)
        ? (children as ReactElement<{
            children?: ReactNode;
            className?: string;
            style?: React.CSSProperties;
            ref?: React.Ref<HTMLButtonElement>;
          }>)
        : null;
    const label = asChildElement ? asChildElement.props.children : children;
    const isIconOnly = size === "icon" || size === "icon-sm" || size === "icon-lg";
    const iconSize = size === "sm" ? 12 : size === "lg" ? 16 : 14;
    // Spinner tracks the compact content height so the loading glyph stays
    // proportionate once the button sizes to its padding + type.
    const spinnerSizeClass =
      size === "sm" || size === "icon-sm"
        ? "h-3 w-3"
        : size === "lg" || size === "icon-lg"
          ? "h-4 w-4"
          : "h-3.5 w-3.5";
    const internals = (
      <>
        <span className="relative inline-flex items-center justify-center gap-[inherit]">
          {loading ? (
            <>
              <span className="flex items-center justify-center gap-[inherit] opacity-0">
                {LeadingIcon && !isIconOnly && (
                  <LeadingIcon size={iconSize} strokeWidth={2} />
                )}
                {label}
                {TrailingIcon && !isIconOnly && (
                  <TrailingIcon size={iconSize} strokeWidth={2} />
                )}
              </span>
              <span className="absolute inset-0 flex items-center justify-center">
                <svg
                  className={spinnerSizeClass}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M 12 12 C 14 8.5 19 8.5 19 12 C 19 15.5 14 15.5 12 12 C 10 8.5 5 8.5 5 12 C 5 15.5 10 15.5 12 12 Z"
                    stroke="currentColor"
                    strokeWidth="1.125"
                    strokeLinecap="round"
                    pathLength="100"
                    style={{
                      strokeDasharray: "15 85",
                      animation: "spinner-move 2s linear infinite, spinner-dash 4s ease-in-out infinite",
                    }}
                  />
                </svg>
              </span>
            </>
          ) : isIconOnly ? (
            <span className="[&_svg]:stroke-[1.5]">
              {label}
            </span>
          ) : (
            <>
              {LeadingIcon && (
                <LeadingIcon
                  size={iconSize}
                  strokeWidth={1.5}
                />
              )}
              {/* text-box only applies to block containers, so the trim lives
                  on the label span (a blockified flex item), not the flex root.
                  Height comes from padding + type; this centers the
                  cap-to-baseline box optically. */}
              <span className="[text-box:trim-both_cap_alphabetic]">{label}</span>
              {TrailingIcon && (
                <TrailingIcon
                  size={iconSize}
                  strokeWidth={1.5}
                />
              )}
            </>
          )}
        </span>
      </>
    );

    const rootClassName = cn(
      buttonVariants({
        variant,
        size,
      }),
      active && activeButtonClasses[variant ?? "primary"],
      destructive && destructiveButtonClasses[variant ?? "primary"],
      expandHitArea && expandHitAreaClasses,
      className
    );

    if (asChildElement) {
      const childProps = asChildElement.props;
      return cloneElement(
        asChildElement,
        {
          ...props,
          ref,
          className: cn(rootClassName, childProps.className),
          style: { ...style, ...childProps.style },
        },
        internals
      );
    }

    return (
      <ButtonPrimitive
        // Base UI's `ButtonPrimitive` forwards to an HTMLButtonElement;
        // keep the public ref type narrow so consumers see the right type.
        ref={ref as React.Ref<HTMLButtonElement>}
        className={rootClassName}
        disabled={disabled || loading}
        style={style}
        {...props}
      >
        {internals}
      </ButtonPrimitive>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
export type { ButtonProps };
