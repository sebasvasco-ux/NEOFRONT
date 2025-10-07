"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

type SwitchSize = 'sm' | 'md' | 'lg'

function Switch({
  className,
  size = 'md',
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & { size?: SwitchSize }) {
  const sizeMap: Record<SwitchSize, { root: string; thumb: string }> = {
    sm: { root: 'h-4 w-7', thumb: 'h-3 w-3' },
    md: { root: 'h-[1.15rem] w-8', thumb: 'h-4 w-4' },
    lg: { root: 'h-6 w-12', thumb: 'h-5 w-5' }
  }

  const { root: rootSizeClass, thumb: thumbSizeClass } = sizeMap[size]

  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        rootSizeClass,
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          `bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block ${thumbSizeClass} rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0`
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
