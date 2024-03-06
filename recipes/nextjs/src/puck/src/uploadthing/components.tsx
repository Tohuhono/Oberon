"use client"

import { generateUploadDropzone } from "@uploadthing/react"
import { OurFileRouter } from "@/puck/src/uploadthing/file-router"

export const UploadDropzone = generateUploadDropzone<OurFileRouter>()
