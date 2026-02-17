import { Render } from "@oberoncms/core/render";
import { getMetaData } from "@oberoncms/core";

import { config } from "@/oberon/config";
import { adapter } from "@/oberon/adapter";

export async function generateStaticParams() {
  return await adapter.getAllPaths();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path = [] } = await params;
  return getMetaData(adapter, path);
}

export default async function OberonRender({
  params,
}: {
  params: Promise<{ path?: string[] }>;
}) {
  const { path = [] } = await params;
  return <Render path={path} adapter={adapter} config={config} />;
}
