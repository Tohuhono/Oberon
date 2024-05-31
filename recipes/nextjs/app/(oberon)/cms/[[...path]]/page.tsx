import { getMetaData } from "@oberoncms/core";
import { OberonProvider } from "@oberoncms/core/provider";
import { Client } from "./client";
import { actions } from "@/oberon/actions";

export async function generateMetadata({
  params: { path = [] },
}: {
  params: { path?: string[] };
}) {
  return await getMetaData(actions, path.slice(1), path[0]);
}

export default async function Oberon({
  params: { path = [] },
}: {
  params: { path?: string[] };
}) {
  return (
    <OberonProvider actions={actions} path={path}>
      <Client />
    </OberonProvider>
  );
}
