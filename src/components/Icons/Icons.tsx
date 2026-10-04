import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

// Line icons drawn on a 16px grid. They inherit colour from the surrounding text.
function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export function NoteIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 2.5h9a1 1 0 0 1 1 1V10l-3.5 3.5H3.5a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1Z" />
      <path d="M10 13.5V11a1 1 0 0 1 1-1h2.5" />
    </Icon>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 3v10M3 8h10" />
    </Icon>
  )
}

export function InfoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 7.25v3.75M8 5h.01" />
    </Icon>
  )
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4 4 8 8M12 4l-8 8" />
    </Icon>
  )
}

export function MoonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13.5 9.6A5.5 5.5 0 0 1 6.4 2.5a5.5 5.5 0 1 0 7.1 7.1Z" />
    </Icon>
  )
}

export function SunIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="8" cy="8" r="2.75" />
      <path d="M8 1.5v1.25M8 13.25v1.25M1.5 8h1.25M13.25 8h1.25M3.4 3.4l.9.9M11.7 11.7l.9.9M3.4 12.6l.9-.9M11.7 4.3l.9-.9" />
    </Icon>
  )
}

export function ChevronIcon({ direction, ...props }: IconProps & { direction: 'left' | 'right' }) {
  return (
    <Icon {...props}>
      <path d={direction === 'right' ? 'm6 3.5 4.5 4.5L6 12.5' : 'M10 3.5 5.5 8l4.5 4.5'} />
    </Icon>
  )
}

export function ArrowIcon({ direction, ...props }: IconProps & { direction: 'up' | 'down' }) {
  return (
    <Icon {...props}>
      <path d={direction === 'up' ? 'M8 13V3M4 7l4-4 4 4' : 'M8 3v10M4 9l4 4 4-4'} />
    </Icon>
  )
}

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M2.75 4.25h10.5M6.25 4.25V2.75h3.5v1.5M4.25 4.25l.6 9h6.3l.6-9M6.75 6.75v4M9.25 6.75v4" />
    </Icon>
  )
}

export function GripIcon(props: IconProps) {
  return (
    <Icon fill="currentColor" stroke="none" {...props}>
      <circle cx="5.5" cy="3.5" r="1.25" />
      <circle cx="10.5" cy="3.5" r="1.25" />
      <circle cx="5.5" cy="8" r="1.25" />
      <circle cx="10.5" cy="8" r="1.25" />
      <circle cx="5.5" cy="12.5" r="1.25" />
      <circle cx="10.5" cy="12.5" r="1.25" />
    </Icon>
  )
}

export function ResizeIcon(props: IconProps) {
  return (
    <Icon strokeWidth={1.5} {...props}>
      <path d="M13.5 6.5l-7 7M13.5 10.5l-3 3" />
    </Icon>
  )
}

export function CrosshairIcon(props: IconProps) {
  return (
    <Icon strokeWidth={1.1} {...props}>
      <path d="M8 1v14M1 8h14" />
    </Icon>
  )
}
