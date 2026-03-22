import { motion, type Transition, type Variants } from 'framer-motion'
import type { ReactNode } from 'react'

export const PRESETS = {
  fadeUp: {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  fadeDown: {
    initial: { opacity: 0, y: -40 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  },
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -40 },
  },
  slideRight: {
    initial: { opacity: 0, x: -40 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 40 },
  },
} as const satisfies Record<string, Variants>

export type AnimationPreset = keyof typeof PRESETS

const DEFAULT_TYPE: AnimationPreset = 'fadeUp'
const DEFAULT_DURATION = 0.4
const DEFAULT_DELAY = 0

type MotionTag = 'div' | 'span' | 'section'

type Props = {
  children: ReactNode
  type?: AnimationPreset
  duration?: number
  delay?: number
  variants?: Variants
  transition?: Transition
  className?: string
  as?: MotionTag
}

export default function AnimationComponent({
  children,
  type = DEFAULT_TYPE,
  duration = DEFAULT_DURATION,
  delay = DEFAULT_DELAY,
  variants: customVariants,
  transition: customTransition,
  className,
  as = 'div',
  ...rest
}: Props) {
  const preset = PRESETS[type] ?? PRESETS[DEFAULT_TYPE]
  const variantsResolved = customVariants ?? preset
  const transitionResolved = customTransition ?? { duration, delay }

  const MotionTag =
    as === 'span'
      ? motion.span
      : as === 'section'
        ? motion.section
        : motion.div

  return (
    <MotionTag
      variants={variantsResolved}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transitionResolved}
      className={className}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}
