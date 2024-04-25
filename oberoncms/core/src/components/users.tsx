"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Fragment, startTransition, useOptimistic } from "react"

import { Button } from "@tohuhono/ui/button"
import { Input } from "@tohuhono/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tohuhono/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@tohuhono/ui/form"

import { useOberon } from "@/hooks/use-oberon"
import { AddUserSchema, OberonUser, roles } from "@/app/schema"

type OptimisticUser = OberonUser & { pending?: boolean }

const useOberonUsers = (users: OberonUser[]) => {
  const { addUser, changeRole, deleteUser } = useOberon()
  const [optimisticUsers, optimisticUserUpdate] =
    useOptimistic<OptimisticUser[]>(users)

  return {
    users: optimisticUsers,
    addUser: (user: Pick<OberonUser, "email" | "role">) => {
      startTransition(() => {
        optimisticUserUpdate([
          ...optimisticUsers,
          { ...user, id: user.email, pending: true },
        ])
      })
      return addUser(user)
    },
    deleteUser: async (id: OberonUser["id"]) => {
      startTransition(() =>
        optimisticUserUpdate(
          optimisticUsers.map((user) =>
            user.id === id ? { ...user, pending: true } : user,
          ),
        ),
      )
      return deleteUser({ id })
    },
    changeRole: async (id: OberonUser["id"], role: OberonUser["role"]) => {
      startTransition(() =>
        optimisticUserUpdate(
          optimisticUsers.map((user) =>
            user.id === id ? { ...user, role, pending: true } : user,
          ),
        ),
      )
      return changeRole({ id, role })
    },
  }
}

export function Users({ users: serverUsers }: { users: OberonUser[] }) {
  const { users, addUser, deleteUser, changeRole } = useOberonUsers(serverUsers)

  const form = useForm<z.infer<typeof AddUserSchema>>({
    resolver: zodResolver(AddUserSchema),
    defaultValues: {
      email: "",
      role: "user",
    },
  })

  return (
    <div className="mx-auto grid w-fit grid-cols-[auto_auto_auto] items-center justify gap-1 pt-3">
      {users.map(({ role, id, email, pending }) => {
        return (
          <Fragment key={id}>
            <div className="pr-6">{email}</div>
            <Select
              disabled={pending}
              onValueChange={(role: OberonUser["role"]) => changeRole(id, role)}
            >
              <SelectTrigger>
                <SelectValue placeholder={role} />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="destructive"
              size="sm"
              disabled={pending}
              onClick={() => deleteUser(id)}
            >
              Delete
            </Button>
          </Fragment>
        )
      })}

      <Form {...form}>
        <form
          className="contents"
          onSubmit={form.handleSubmit((data) => {
            addUser(data)
            form.reset()
          })}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={field.onChange}
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <Button type="submit">Add User</Button>
          <FormMessage>{form.formState.errors.email?.message}</FormMessage>
          <FormMessage>{form.formState.errors.role?.message}</FormMessage>
        </form>
      </Form>
    </div>
  )
}
