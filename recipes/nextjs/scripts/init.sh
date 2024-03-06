#! /bin/bash

SCOPE=tohuhono
EMAIL_FROM=no-reply@tohuhono.com

if [[ "$OSTYPE" == "msys" ]] 
then
echo "vercel and turso require a unix shell (eg wsl2)"
exit 1
fi

npx vercel --yes -v > /dev/null 2>&1 &
NPM_PID=$!

if ! command -v turso &> /dev/null
then
curl -sSfL https://get.tur.so/install.sh | bash > /dev/null 2>&1 &
CURL_PID=$!
fi

PROJECT_NAME="${PWD##*/}"
DOMAIN="$PROJECT_NAME.tohuhono.com"
read -p "Master email: " MASTER_EMAIL

mv oberon.code-workspace $PROJECT_NAME.code-workspace

wait $CURL_PID
turso auth login

wait $NPM_PID
npx vercel project add $PROJECT_NAME --scope=$SCOPE
npx vercel link -p $PROJECT_NAME --scope=$SCOPE --yes

DEV_DB_NAME="$PROJECT_NAME-dev"
turso db create $DEV_DB_NAME
echo -n `turso db show $DEV_DB_NAME --url` | npx vercel env add TURSO_URL preview
echo -n `turso db tokens create $DEV_DB_NAME` | npx vercel env add TURSO_TOKEN preview

PROD_DB_NAME="$PROJECT_NAME-prod"
turso db create $PROD_DB_NAME
echo -n `turso db show $PROD_DB_NAME --url` | npx vercel env add TURSO_URL production
echo -n `turso db tokens create $PROD_DB_NAME` | npx vercel env add TURSO_TOKEN production

echo -n `openssl rand -hex 32` | npx vercel env add AUTH_SECRET development
echo -n `openssl rand -hex 32` | npx vercel env add AUTH_SECRET preview
echo -n `openssl rand -hex 32` | npx vercel env add AUTH_SECRET production

echo -n "$DOMAIN" | npx vercel env add DOMAIN production

echo -n "$MASTER_EMAIL" | npx vercel env add MASTER_EMAIL development
echo -n "$MASTER_EMAIL" | npx vercel env add MASTER_EMAIL preview
echo -n "$MASTER_EMAIL" | npx vercel env add MASTER_EMAIL production

echo -n "$EMAIL_FROM" | npx vercel env add EMAIL_FROM development
echo -n "$EMAIL_FROM" | npx vercel env add EMAIL_FROM preview
echo -n "$EMAIL_FROM" | npx vercel env add EMAIL_FROM production

echo "Initialisation complete - add project id to github repository secrets:"
echo "VERCEL_PROJECT_ID=$(sed -n "s/.*projectId.*\"\([^\"].*\)\".*/\1/p" .vercel/project.json)"
