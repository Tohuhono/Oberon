"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Fragment, useState } from "react"

import { Button } from "@oberon/ui/button"
import { Input } from "@oberon/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@oberon/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@oberon/ui/form"

import { ServerActions, AddUserSchema, User, roles } from "@/app/schema"

export function Users({
  users: initialUsers,
  addUser,
  changeRole,
  deleteUser,
}: {
  users: User[]
  addUser: ServerActions["addUser"]
  changeRole: ServerActions["changeRole"]
  deleteUser: ServerActions["deleteUser"]
}) {
  const [users, setUsers] = useState(initialUsers)

  const form = useForm<z.infer<typeof AddUserSchema>>({
    resolver: zodResolver(AddUserSchema),
    defaultValues: {
      email: "",
      role: "admin",
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(async (data) => {
          const user = await addUser(data)
          if (user) {
            setUsers([...users, user])
          }
        })}
        className="space-y-8"
      >
        <div className="mx-auto grid w-fit grid-cols-[auto_auto_auto] items-center gap-1 pt-3">
          {users.map(({ role, id, email }) => {
            return (
              <Fragment key={id}>
                <div className="pr-6">{email}</div>
                <Select
                  onValueChange={(role: User["role"]) =>
                    changeRole({ id, role })
                  }
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
                  onClick={() => {
                    setUsers(users.filter((user) => user.id === id))
                    deleteUser({ id })
                  }}
                >
                  Delete
                </Button>
              </Fragment>
            )
          })}

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
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
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Add</Button>
        </div>
      </form>
    </Form>
  )
}
