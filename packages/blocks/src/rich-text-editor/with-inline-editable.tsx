import type { Config } from "@measured/puck"

export function withInlineEditable<TState, TConfig extends Config>(
  config: TConfig,
  {
    name,
    Editor,
    Render,
  }: {
    name: string
    Editor: (props: { id: string; state: TState }) => JSX.Element
    Render: (props: {
      id: string
      state: TState
    }) => JSX.Element | Promise<JSX.Element>
  },
) {
  return {
    ...config,
    components: {
      ...config.components,
      [name]: {
        fields: {
          state: {
            type: "custom",
            render: () => null,
          },
        },
        render: ({
          editMode,
          ...props
        }: {
          editMode?: boolean
          id: string
          state: TState
        }) => (editMode ? <Editor {...props} /> : <Render {...props} />),
      },
    },
  }
}
