#! /bin/bash
npx -y turbo build --dry-run=json --filter=...[$1]  --global-deps=.github/* > changed.json
cat changed.json
node -pe 'JSON.stringify(JSON.parse(fs.readFileSync("./changed.json")).packages)'