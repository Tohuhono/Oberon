# @oberoncms/plugin-flydrive

A plugin that provides an Image component for [OberonCMS](https://github.com/Tohuhono/Oberon) it's pre-configured to using [flydrive](https://flydrive.dev/docs/introduction), a filesystem abstraction layer that allows you to easily interact with files systems of different cloud storage providers.

## Table of Contents

- [@oberoncms/plugin-flydrive](#oberoncmsplugin-flydrive)
  - [Table of Contents](#table-of-contents)
  - [Setup](#setup)
  - [prepare API](#prepare-api)
  - [Editor configuration](#editor-configuration)
  - [Want to discuss this plugin?](#want-to-discuss-this-plugin)

```bash
pnpm add @oberoncms/plugin-flydrive flydrive
```

## Setup

- install your favoriate flydrive drivers's requriments,
  according to the [flydrive documentation](https://flydrive.dev/docs/introduction)

for example using S3 driver:

```bash
npm i @aws-sdk/s3-request-presigner @aws-sdk/client-s3
```

- create a flydrive adapter, and generate your plugin!

```typescript
// adapter.ts
import "server-only"

import { initAdapter } from "@oberoncms/core/adapter"


import { S3Driver } from "flydrive/drivers/s3"

import { getCloudFlyDrivePlugin } from "@oberoncms/plugin-flydrive/plugin"

const s3Driver = new S3Driver({
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
  bucket: process.env.bucket,
  urlBuilder: {
    generateSignedURL() // mandatory
    generateURL() // mandatory
  },
})

// export router
export const { flyDrivePlugin, initFlyDriveRouter } = getCloudFlyDrivePlugin(s3Driver)

// add the plugin to the oberon adapter
export const adapter = initAdapter([
  flyDrivePlugin,
  // other plugins
])
```

## prepare API

```typescript
// api/flydrive/route.ts
import { initFlyDriveRouter } from "./adapter" // <where you placed your adapter.ts>

export const { GET, POST } = initFlyDriveRouter()
```

## Editor configuration

```typescript
// config.ts
import { Image } from "@oberoncms/plugin-flydrive"

export const editorConfig = {
  // other configurations
  components: {
    Image, // <- add the Image component

    // using arrayFields/ObjectFields in NestedField Props
    Nested: {
      fields: {
        // array of images
        images: {
          type: "array",
          arrayFields: {
             image: ImageNestedField,
            // another array fields
           },
        },

        // object with an image
        image: {
          type: "object",
          objectFields: {
             image: ImageNestedField ,
            // another object fields
          },
        },
      },
      render(props: {
        images?: OberonImage[]
        image?: { image?: OberonImage }
      }) {
        // props.images is an array of images
        // props.image is an object with an image
        return <></>
      },
    },
    // other components
  },
}
```

That's it! you can now use the Image component in your editor!

## Want to discuss this plugin?

contact me on Discord [@sudoahmed](https://discord.com/users/793772577595719701)
GitHub [@ahmedrowaihi](https://github.com/ahmedrowaihi)
