"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { Button, buttonVariants } from "@tohuhono/ui/button"
import { LocalDate } from "@tohuhono/ui/date"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@tohuhono/ui/form"
import { Grid, GridHeading } from "@tohuhono/ui/grid"
import { Input } from "@tohuhono/ui/input"
import { Link } from "@tohuhono/ui/link"
import { Fragment, useOptimistic, useTransition } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { useOberonActions } from "../hooks/use-oberon"
import { AddPageSchema, type OberonPageMeta } from "../lib/dtd"

function copyKey(optimisticPages: OberonPageMeta[], key: OberonPageMeta["key"]) {
  let iterator = 0
  let newKey = `${key}_copy`

  while (optimisticPages.find((page) => page.key === newKey)) {
    newKey = `${key}_copy_${++iterator}`
  }

  return newKey
}

const useOberonPages = (pages: OberonPageMeta[]) => {
  const { deletePage, addPage, publishPageData, getPageData } = useOberonActions()
  const [optimisticPages, optimisticPageUpdate] = useOptimistic<OberonPageMeta[]>(pages)
  const [isPending, startTransition] = useTransition()

  return {
    pages: optimisticPages,
    isPending,
    addPage: (page: z.infer<typeof AddPageSchema>) => {
      startTransition(async () => {
        optimisticPageUpdate([
          ...optimisticPages,
          { ...page, updatedAt: new Date(), updatedBy: "", pending: true },
        ])
        await addPage(page)
      })
    },
    copyPage: (key: OberonPageMeta["key"]) => {
      startTransition(async () => {
        const newKey = copyKey(optimisticPages, key)
        optimisticPageUpdate([
          ...optimisticPages,
          { key: newKey, updatedAt: new Date(), updatedBy: "", pending: true },
        ])
        const data = await getPageData({ key })
        if (data) {
          await publishPageData({ key: newKey, data })
        } else {
          await addPage({ key: newKey })
        }
      })
    },
    deletePage: (key: OberonPageMeta["key"]) => {
      startTransition(async () => {
        optimisticPageUpdate(
          optimisticPages.map((page) => (page.key === key ? { ...page, pending: true } : page)),
        )
        await deletePage({ key })
      })
    },
  }
}

const parsePath = (key: string) => {
  if (!key) {
    return ""
  }

  return (key.charAt(0) === "/" ? key : "/" + key).replace(" ", "_")
}

export function Pages({ pages: serverPages }: { pages: OberonPageMeta[] }) {
  const { pages, isPending, deletePage, addPage, copyPage } = useOberonPages(serverPages)

  const form = useForm<z.infer<typeof AddPageSchema>>({
    resolver: zodResolver(AddPageSchema),
    defaultValues: {
      key: "",
    },
  })

  return (
    <Grid className="grid-cols-[1fr_auto_auto_auto_auto_auto]">
      <GridHeading>Path</GridHeading>
      <GridHeading>Updated</GridHeading>
      <GridHeading>By</GridHeading>
      <GridHeading className="col-span-3" />
      <Form {...form}>
        <form
          className="contents"
          onSubmit={form.handleSubmit((data) => {
            addPage(data)
            form.reset()
          })}
        >
          <FormField
            control={form.control}
            name="key"
            render={({ field }) => (
              <FormItem className="row-span-2">
                <FormControl>
                  <Input
                    aria-label="Page path"
                    placeholder=""
                    disabled={isPending}
                    {...field}
                    onChange={(e) => {
                      form.setValue("key", parsePath(e.currentTarget.value))
                    }}
                  />
                </FormControl>
                <FormMessage>{form.formState.errors.key?.message}</FormMessage>
              </FormItem>
            )}
          />
          <div className="col-span-2 row-span-2" />
          <Button type="submit" className="col-span-3 row-span-2" disabled={isPending}>
            Add Page
          </Button>
        </form>
      </Form>
      {pages.map(({ key: route, updatedBy, updatedAt, pending }) => (
        <Fragment key={route}>
          <Link
            className={buttonVariants({
              variant: "ghost",
              size: "link",
              className: "no-underline",
            })}
            href={route}
            prefetch={false}
          >
            {route}
          </Link>
          <div className="text-sm">
            <LocalDate date={updatedAt} />
          </div>
          <div aria-label={`${route} updated by`} className="text-sm">
            {updatedBy}
          </div>
          {pending ? (
            <Button size="sm" disabled>
              Edit
            </Button>
          ) : (
            <Link
              className={buttonVariants({
                size: "sm",
                className: "no-underline",
              })}
              href={`/cms/edit${route}`}
              prefetch={false}
            >
              Edit
            </Link>
          )}

          <Button
            aria-label={`Copy ${route}`}
            size="sm"
            onClick={() => copyPage(route)}
            disabled={pending}
          >
            Copy
          </Button>

          <Button
            aria-label={`Delete ${route}`}
            variant="destructive"
            size="sm"
            onClick={() => deletePage(route)}
            disabled={pending}
          >
            Delete
          </Button>
        </Fragment>
      ))}
    </Grid>
  )
}
