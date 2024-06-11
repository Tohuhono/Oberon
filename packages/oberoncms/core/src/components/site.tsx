"use client"

import { Fragment, useEffect, useRef, useState } from "react"

import { ColumnHeading, Table } from "@tohuhono/ui/table"
import { Button } from "@tohuhono/ui/button"
import { ScrollArea } from "@tohuhono/ui/scroll-area"
import { iterateStreamResponse } from "@tohuhono/utils"
import { useRouter } from "next/navigation"
import { useOberonActions } from "../hooks/use-oberon"
import {
  type MigrationResult,
  type OberonSiteConfig,
  type TransformResult,
} from "../lib/dtd"

function useMigration() {
  const { migrateData } = useOberonActions()

  const router = useRouter()

  const [results, setResults] = useState<TransformResult[]>()
  const [summary, setSummary] = useState<MigrationResult>()

  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollIntoView()
  }, [results, summary])

  return {
    summary,
    scrollRef,
    results,
    migrateData: async () => {
      try {
        const response = iterateStreamResponse(migrateData())

        let results: TransformResult[] = []
        setResults([])
        setSummary(undefined)

        for await (const result of response) {
          if (result.type === "transform") {
            results = [...results, result]
            setResults(results)
          }
          if (result.type === "summary") {
            setSummary(result)
          }

          router.refresh()
        }
      } catch (error) {
        console.error(error)
      }
    },
  }
}

export function Site({
  config: { plugins, version: coreVersion, pendingMigrations },
}: {
  config: OberonSiteConfig
}) {
  const { summary, scrollRef, migrateData, results } = useMigration()

  const migrateDisabled = !pendingMigrations || (results && !summary)

  return (
    <>
      <h2>Scheduled events</h2>
      <p className="text-muted-foreground">Scheduling not enabled</p>
      <h2>Pending Migrations</h2>
      <Table className="grid-cols-[1fr_auto]">
        {pendingMigrations ? (
          <div>{`Components: ${pendingMigrations.join(", ")}`}</div>
        ) : (
          <div className="text-green-800">No pending migrations</div>
        )}

        <Button onClick={migrateData} disabled={migrateDisabled}>
          Run migrations
        </Button>
      </Table>
      {results && (
        <div className="pt-2">
          <ScrollArea className="h-64 rounded-md border px-5">
            <Table className="grid-cols-[1fr_auto] gap-0 ">
              {results.map(({ key, status }) => (
                <Fragment key={key}>
                  <div>{key}</div>
                  {status === "success" ? (
                    <div className="text-green-800">{status}</div>
                  ) : (
                    <div className="text-red-700">{status}</div>
                  )}
                </Fragment>
              ))}
            </Table>
            <h4>
              {summary &&
                `Successfully migrated ${summary.success.length} of ${summary.total} pages with ${summary.error.length} errors`}
            </h4>
            <div ref={scrollRef} />
          </ScrollArea>
        </div>
      )}

      <h2>Installed Packages</h2>
      <Table className="grid-cols-[1fr_auto]">
        <ColumnHeading>Core</ColumnHeading>
        <ColumnHeading>Version</ColumnHeading>

        <div>@oberoncms/core</div>
        <div>{coreVersion}</div>
        <ColumnHeading className="col-span-2">Plugins</ColumnHeading>

        {plugins.map(({ name, disabled, version }) => (
          <Fragment key={name}>
            <div className={disabled ? "font-light" : ""}>
              {name} {disabled && " (disabled)"}
            </div>
            <div>{version}</div>
          </Fragment>
        ))}
      </Table>
    </>
  )
}
