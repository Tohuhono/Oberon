#! /bin/bash
npx -y turbo@1 build --dry-run=json --filter=...[$1]  --global-deps=.github/* | node -p 'JSON.parse(fs.readFileSync("./changed.json")).packages'
