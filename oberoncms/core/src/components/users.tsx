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

import { ColumnHeading, Table } from "@tohuhono/ui/table"
import { AddUserSchema, OberonUser, roles } from "../app/schema"
import { useOberonActions } from "../hooks/use-oberon"

type OptimisticUser = OberonUser & { pending?: boolean }

const useOberonUsers = (users: OberonUser[]) => {
  const { addUser, changeRole, deleteUser } = useOberonActions()
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
    <Table className="grid-cols-[1fr_auto_auto]">
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
              <FormItem className="row-span-2">
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage>
                  {form.formState.errors.email?.message}
                </FormMessage>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="row-span-2">
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
                <FormMessage>{form.formState.errors.role?.message}</FormMessage>
              </FormItem>
            )}
          />
          <Button className="row-span-2 self-baseline" type="submit">
            Add User
          </Button>
        </form>
      </Form>
      <ColumnHeading>Email</ColumnHeading>
      <ColumnHeading>Role</ColumnHeading>
      <ColumnHeading></ColumnHeading>
      {users.map(({ role, id, email, pending }) => {
        return (
          <Fragment key={id}>
            <div className="pr-6">{email}</div>
            <Select
              disabled={pending}
              onValueChange={(role: OberonUser["role"]) => changeRole(id, role)}
            >
              <SelectTrigger className="h-6 text-xs">
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
    </Table>
  )
}
