"use client"

import { cn } from "@tohuhono/utils"
import { ComponentProps } from "react"
import { DayPicker } from "react-day-picker"

import { buttonVariants } from "./button"

export type CalendarProps = ComponentProps<typeof DayPicker>

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      navLayout="around"
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "relative space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          `
            absolute left-1 top-0 size-7 bg-transparent p-0 opacity-50
            hover:opacity-100
          `,
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          `
            absolute right-1 top-0 size-7 bg-transparent p-0 opacity-50
            hover:opacity-100
          `,
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
        week: "flex w-full mt-2",
        day: cn(
          `
            relative size-8 p-0 text-center text-sm
            focus-within:relative focus-within:z-20
            aria-selected:bg-accent
            [&.day-outside]:aria-selected:bg-accent/50
          `,
          props.mode === "range"
            ? `
              first:aria-selected:rounded-l-md
              last:aria-selected:rounded-r-md
            `
            : "aria-selected:rounded-md",
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          `
            size-8 p-0 font-normal
            aria-selected:opacity-100
          `,
        ),
        range_start: "day-range-start rounded-l-md",
        range_end: "day-range-end rounded-r-md",
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground [&>button]:focus:bg-primary [&>button]:focus:text-primary-foreground",
        today: "[&>button]:bg-accent [&>button]:text-accent-foreground",
        outside:
          "day-outside text-muted-foreground opacity-50  aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground aria-selected:[&>button]:bg-accent aria-selected:[&>button]:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
              <path
                d="m15 18-6-6 6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
              <path
                d="m9 18 6-6-6-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ),
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
