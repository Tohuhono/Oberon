import {
  lazy,
  Suspense,
  use,
  useEffect,
  type ComponentProps,
  type ComponentType,
  type PropsWithChildren,
  type ReactNode,
} from "react"

function Suspender({ children, ready }: PropsWithChildren<{ ready: Promise<void> }>) {
  use(ready)
  return children
}

export function dynamic<T extends ComponentType, TProps extends ComponentProps<T>>(
  loader: () => Promise<ComponentType<TProps>>,
  { ssr, fallback }: { ssr?: boolean; fallback?: ReactNode },
) {
  const Lazy = lazy(() => loader().then((c) => ({ default: c })))

  // oxlint-disable-next-line typescript/no-invalid-void-type valid void Promise resolver
  const ready = Promise.withResolvers<void>()

  if (ssr) {
    ready.resolve()
  }

  return function NoSSR(props: TProps) {
    useEffect(() => {
      ready.resolve()
    }, [])

    return (
      <Suspense fallback={fallback}>
        <Suspender ready={ready.promise}>
          <Lazy {...props} />
        </Suspender>
      </Suspense>
    )
  }
}
