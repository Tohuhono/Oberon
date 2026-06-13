"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@tohuhono/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@tohuhono/ui/form"
import { Input } from "@tohuhono/ui/input"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@tohuhono/ui/input-otp"
import { toast } from "@tohuhono/ui/toast"
import { cn } from "@tohuhono/utils"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useDebouncedCallback } from "use-debounce"
import { z } from "zod"

import { useOberonActions, useOberonNavigation } from "../hooks/use-oberon"

const LoginSchema = z.object({
  email: z.email(),
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

  const navigation = useOberonNavigation()

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email,
      token,
    },
  })

  const [sending, setSending] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(!!email && !!token)

  const debouncedSetSending = useDebouncedCallback((loading: boolean) => setSending(loading), 3000)

  const sendOnCLick = form.handleSubmit(async ({ email }) => {
    setSending(true)
    try {
      await signIn({
        email: typeof email === "string" ? email : "",
      })
      form.resetField("token")
      setSent(true)
    } catch (error) {
      setSending(false)
      throw error
    }
    toast({
      title: `Token sent to ${email}`,
      description: "Please check your emails",
    })
    debouncedSetSending(false)
  })

  const tokenOnClick = form.handleSubmit(async ({ email, token }) => {
    setSubmitting(true)
    const response = await fetch("/cms/api/auth/sign-in/email-otp", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        email,
        otp: token || "",
      }),
    })
    if (response.ok) {
      navigation.navigate(callbackUrl || "/cms/pages")
    }
    if (!response.ok) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: "Please check your credentials and try again",
      })
    }
    form.resetField("token")
    setSubmitting(false)
  })

  return (
    <div className="grid h-screen place-content-center gap-3">
      <Form {...form}>
        <form className="contents">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{form.formState.errors.email?.message ?? "Email adress"}</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <FormItem className={cn(sent ? "visible animate-fade-in" : "hidden")}>
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
          {!sent && (
            <Button disabled={sending} variant="default" onClick={sendOnCLick}>
              Sign in
            </Button>
          )}

          <Button
            disabled={submitting}
            className={cn(
              "pt-2",
              sent ? "visible animate-fade-in" : "collapse",
              sending ? "transition-none" : "transition-opacity",
            )}
            onClick={tokenOnClick}
          >
            Complete Sign in
          </Button>

          <Button
            disabled={sending}
            className={cn(
              "animate-fade-in-half duration-1000",
              sent ? "visible" : "collapse",
              sending ? "transition-none" : "transition-opacity",
            )}
            variant="secondary"
            onClick={sendOnCLick}
          >
            Resend OTP Token
          </Button>
        </form>
      </Form>
    </div>
  )
}
