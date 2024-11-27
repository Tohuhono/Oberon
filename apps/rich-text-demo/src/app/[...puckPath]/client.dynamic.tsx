"use client"

import dynamic from "next/dynamic"

const Client = dynamic(() => import("./client"), { ssr: false })

export const DynamicClient = Client
