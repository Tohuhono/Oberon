export * from "vitest"

type OberonStableTestTag = "ai" | "baseline" | "slow"
type OberonIssueTestTag = `issue-${number}`
type OberonBugTestTag = `bug-${number}`
type OberonFeatureTestTag = `feature-${string}`
type OberonTestTag =
  | OberonStableTestTag
  | OberonIssueTestTag
  | OberonBugTestTag
  | OberonFeatureTestTag

declare module "vitest" {
  interface TestTags {
    tags: OberonTestTag
  }
}
