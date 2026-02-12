"use client"
import {
  Children,
  type ComponentProps,
  type ComponentPropsWithRef,
  cloneElement,
  createContext,
  isValidElement,
  useContext,
  useId,
} from "react"
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
} from "react-hook-form"

import { cn } from "@tohuhono/utils"
import { Label } from "./label"

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = createContext<FormFieldContextValue | undefined>(
  undefined,
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const useFormField = () => {
  const fieldContext = useContext(FormFieldContext)
  const itemContext = useContext(FormItemContext)

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }
  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>")
  }

  const { getFieldState, formState } = useFormContext()
  const fieldState = getFieldState(fieldContext.name, formState)

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = createContext<FormItemContextValue | undefined>(
  undefined,
)

const FormItem = ({ className, ...props }: ComponentPropsWithRef<"div">) => {
  const id = useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={className} {...props} />
    </FormItemContext.Provider>
  )
}

const FormLabel = ({ className, ...props }: ComponentProps<typeof Label>) => {
  const { error, formItemId } = useFormField()

  return (
    <Label
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

const FormControl = ({ children, ...props }: ComponentPropsWithRef<"div">) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  const only = Children.only(children)
  if (!isValidElement<Record<string, unknown>>(only)) {
    return null
  }

  return cloneElement(only, {
    ...props,
    id: formItemId,
    "aria-describedby": !error
      ? `${formDescriptionId}`
      : `${formDescriptionId} ${formMessageId}`,
    "aria-invalid": !!error,
  })
}

const FormDescription = ({
  className,
  ...props
}: ComponentPropsWithRef<"p">) => {
  const { formDescriptionId } = useFormField()

  return (
    <p
      id={formDescriptionId}
      className={cn("text-muted-foreground text-[0.8rem]", className)}
      {...props}
    />
  )
}

const FormMessage = ({
  className,
  children,
  ...props
}: ComponentPropsWithRef<"p">) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  return (
    <p
      id={formMessageId}
      className={cn("text-destructive text-[0.8rem] font-medium", className)}
      {...props}
    >
      {body}
    </p>
  )
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
