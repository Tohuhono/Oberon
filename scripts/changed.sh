#! /bin/bash
npx -y turbo build --dry-run=json --filter=...[$1]  --global-deps=.github/* | node -p 'JSON.parse(fs.readFileSync(0)).packages'
