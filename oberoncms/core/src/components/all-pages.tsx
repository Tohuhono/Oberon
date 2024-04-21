"use client"

import Link from "next/link"
import { Fragment, startTransition, useOptimistic } from "react"
import { Button, buttonVariants } from "@oberon/ui/button"
import { Input } from "@oberon/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@oberon/ui/form"
import { useOberon } from "@/hooks/use-oberon"
import { PageSchema, type OberonPage } from "@/app/schema"

const useOberonPages = (pages: OberonPage[]) => {
  const { deletePage, addPage } = useOberon()
  const [optimisticPages, optimisticPageUpdate] =
    useOptimistic<OberonPage[]>(pages)

  return {
    pages: optimisticPages,
    addPage: (page: OberonPage) => {
      startTransition(() => {
        optimisticPageUpdate([...optimisticPages, { ...page, pending: true }])
      })
      return addPage(page)
    },
    deletePage: async (key: OberonPage["key"]) => {
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

export function AllPages({ pages: serverPages }: { pages: OberonPage[] }) {
  const { pages, deletePage, addPage } = useOberonPages(serverPages)

  const form = useForm<OberonPage>({
    resolver: zodResolver(PageSchema),
    defaultValues: {
      key: "",
    },
  })

  return (
    <div className="mx-auto grid w-fit grid-cols-[auto_auto_auto] items-center gap-1 pt-3">
      {pages.map(({ key: route, pending }) => (
        <Fragment key={route}>
          <Link className="pr-6" href={route} prefetch={false}>
            {route}
          </Link>

          {pending ? (
            <Button size="sm" disabled>
              Edit
            </Button>
          ) : (
            <Link
              className={buttonVariants({
                size: "sm",
                className: "no-underline dissabled",
              })}
              href={`/cms/edit/${route}`}
              target="_blank"
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

      <Form {...form}>
        <form
          className="contents "
          onSubmit={form.handleSubmit((data) => {
            addPage(data)
            form.reset()
          })}
        >
          <FormField
            control={form.control}
            name="key"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder=""
                    {...field}
                    onChange={(e) => {
                      form.setValue("key", parsePath(e.currentTarget.value))
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit" className="col-span-2">
            Add
          </Button>
          <FormMessage>{form.formState.errors.key?.message}</FormMessage>
        </form>
      </Form>
    </div>
  )
}
