# Puck Rich Text Component

A rich text component with inline editor for use with
[Puck](https://puckeditor.com)

<p align="left">
  <a aria-label="Tohuhono" href="https://tohuhono.com">
    <img src="https://img.shields.io/badge/A%20Tohuhono%20Creation-000000.svg?style=for-the-badge&labelColor=000">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@tohuhono/puck-rich-text">
    <img alt="" src="https://img.shields.io/npm/v/@tohuhono/puck-rich-text.svg?style=for-the-badge&labelColor=000000">
  </a>
  <a aria-label="License" href="https://github.com//blob/main/LICENSE">
    <img alt="" src="https://img.shields.io/npm/l/@tohuhono/puck-rich-text.svg?style=for-the-badge&labelColor=000000">
  </a>
</p>

## Demo

Visit https://puck-rich-text.tohuhono.com to try the demo.

## Documentation

This is it! Visit https://puckeditor.com to view the full Puck documentation.

### Install

```sh
npm i @tohuhono/puck-rich-text --save
```

### Next.js 14

In your Puck config:

```jsx
// Puck.config.tsx
import type { Config } from "@puckeditor/core"
import { PuckRichText, PuckRichTextProps } from "@tohuhono/puck-rich-text"

export const config: Config<{
  PuckRichText: PuckRichTextProps
}> = {
  components: {
    PuckRichText
  }
}
```

### Next.js 13

To avoid nextjs import the incorrect render library you need to use the legacy
import

```jsx
// Puck.config.tsx
import type { Config } from "@puckeditor/core"
import { PuckRichText, PuckRichTextProps } from "@tohuhono/puck-rich-text/legacy"

export const config: Config<{
  PuckRichText: PuckRichTextProps
}> = {
  components: {
    PuckRichText
  }
}
```

## License

MIT © [Tohuhono ltd](https://tohuhono.com)
