"use client"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@tohuhono/ui/form"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Input } from "@tohuhono/ui/input"
import { Button } from "@tohuhono/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@tohuhono/ui/input-otp"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { cn } from "@tohuhono/utils"
import { useOberonActions } from "../hooks/use-oberon"

const LoginSchema = z.object({
  email: z.string().email(),
  token: z.string().max(6).optional(),
})

export function Login({
  callbackUrl,
  email,
  token,
}: {
  callbackUrl: string
  email: string
  token: string
}) {
  const { signIn } = useOberonActions()

  const router = useRouter()

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email,
      token,
    },
  })

  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(!!email)

  const debouncedSetSending = useDebouncedCallback(
    (loading: boolean) => setSending(loading),
    3000,
  )

  return (
    <div className="grid h-screen place-content-center gap-2">
      <Form {...form}>
        <form className="contents">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {form.formState.errors.email?.message ?? "Email adress"}
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          {!token && (
            <Button
              disabled={sending}
              className={"transition-colors duration-1000"}
              variant={sent ? "secondary" : "default"}
              onClick={form.handleSubmit(async ({ email }) => {
                setSending(true)
                try {
                  await signIn({
                    email: typeof email === "string" ? email : "",
                  })
                  setSent(true)
                } catch (error) {
                  setSending(false)
                  throw error
                }
                debouncedSetSending(false)
              })}
            >
              {sent ? "Resend" : "Send"} OTP Token
            </Button>
          )}

          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem
                className={cn(
                  "transition-opacity duration-1000",
                  sent ? "visible opacity-100" : "collapse opacity-0",
                )}
              >
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />

                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            className={cn(
              "transition-all duration-1000 ease-in-out pt-2",
              sent ? "visible opacity-100" : "collapse opacity-0",
            )}
            onClick={form.handleSubmit(async ({ email, token }) => {
              router.push(
                `/api/auth/callback/email?email=${email}&token=${token}&callbackUrl=${callbackUrl || "/cms/pages"}`,
              )
            })}
          >
            Sign in
          </Button>
        </form>
      </Form>
    </div>
  )
}
