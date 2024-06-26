import type { OberonComponent } from "@oberoncms/core";
import Link from "next/link";

export const Welcome = {
  render: () => {
    return (
      <div className="flex w-full items-center justify-center">
        <div className="prose pt-10 dark:prose-invert">
          <h1>Welcome to OberonCMS</h1>
          <p>
            <Link href="/cms/edit">
              Click here to login with your admin email to start editing
            </Link>
          </p>
        </div>
      </div>
    );
  },
} satisfies OberonComponent;
