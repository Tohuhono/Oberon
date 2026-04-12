import plugin from "tailwindcss/plugin"

const join = (...args: Array<string>) => args.filter(Boolean).join("-")

const sides: Record<string, Array<string>> = {
  "": [""],
  s: ["start-start", "end-start"],
  e: ["start-end", "end-end"],
  t: ["top-left", "top-right"],
  r: ["top-right", "bottom-right"],
  b: ["bottom-right", "bottom-left"],
  l: ["top-left", "bottom-left"],
  ss: ["start-start"],
  se: ["start-end"],
  ee: ["end-end"],
  es: ["end-start"],
  tl: ["top-left"],
  tr: ["top-right"],
  br: ["bottom-right"],
  bl: ["bottom-left"],
}

const cornerShapeStaticKeywords: Array<string> = [
  "round",
  "scoop",
  "bevel",
  "notch",
  "square",
  "squircle",
]

const myPlugin: ReturnType<typeof plugin> = plugin(({ addUtilities }) => {
  for (const [cornerShorthand, corners] of Object.entries(sides)) {
    const utilityPrefix = join("corner", cornerShorthand)
    for (const corner of corners) {
      // static keywords
      for (const keyword of cornerShapeStaticKeywords) {
        addUtilities({
          [`.${utilityPrefix}-${keyword}`]: {
            [join("corner", corner, "shape")]: keyword,
          },
        })
      }
    }
  }
})

export default myPlugin
