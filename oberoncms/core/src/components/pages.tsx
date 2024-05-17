"use client"

import Link from "next/link"
import { Fragment, startTransition, useOptimistic } from "react"
import { Button, buttonVariants } from "@tohuhono/ui/button"
import { Input } from "@tohuhono/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@tohuhono/ui/form"
import { z } from "zod"
import { ColumnHeading, Table } from "@tohuhono/ui/table"
import { LocalDate } from "@tohuhono/ui/date"
import { useOberonActions } from "../hooks/use-oberon"
import { AddPageSchema, type OberonPageMeta } from "../app/schema"

const useOberonPages = (pages: OberonPageMeta[]) => {
  const { deletePage, addPage } = useOberonActions()
  const [optimisticPages, optimisticPageUpdate] =
    useOptimistic<OberonPageMeta[]>(pages)

  return {
    pages: optimisticPages,
    addPage: (page: z.infer<typeof AddPageSchema>) => {
      startTransition(() => {
        optimisticPageUpdate([
          ...optimisticPages,
          { ...page, updatedAt: new Date(), updatedBy: "", pending: true },
        ])
      })
      return addPage(page)
    },
    deletePage: async (key: OberonPageMeta["key"]) => {
      startTransition(() =>
        optimisticPageUpdate(
          optimisticPages.map((page) =>
            page.key === key ? { ...page, pending: true } : page,
          ),
        ),
      )
      return deletePage({ key })
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
  const { pages, deletePage, addPage } = useOberonPages(serverPages)

  const form = useForm<z.infer<typeof AddPageSchema>>({
    resolver: zodResolver(AddPageSchema),
    defaultValues: {
      key: "",
    },
  })

  return (
    <Table className="grid-cols-[1fr_auto_auto_auto_auto]">
      <ColumnHeading>Path</ColumnHeading>
      <ColumnHeading>Updated</ColumnHeading>
      <ColumnHeading>By</ColumnHeading>
      <ColumnHeading className="col-span-2" />
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
                    placeholder=""
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
          <Button type="submit" className="col-span-2 row-span-2">
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
          <div className="text-sm">{updatedBy}</div>
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
            variant="destructive"
            size="sm"
            onClick={() => deletePage(route)}
            disabled={pending}
          >
            Delete
          </Button>
        </Fragment>
      ))}
    </Table>
  )
}
