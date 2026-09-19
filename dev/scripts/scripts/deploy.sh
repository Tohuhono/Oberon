#! /bin/bash
set -e

export ENABLE_EXPERIMENTAL_COREPACK="1"
export NODE_OPTIONS="--experimental-require-module"

if [[ "$OSTYPE" == "msys" ]] 
then
echo "vercel build requires unix shell (eg wsl2)"
exit 1
fi

if [[ -n $VERCEL_ENVIRONMENT ]]
then
ENV_FLAG=--environment=$VERCEL_ENVIRONMENT
else
ENV_FLAG=--environment=development
fi

if [[ $VERCEL_ENVIRONMENT == "production" ]]
then
PROD_FLAG="--prod"
SKIP_FLAG="--skip-domain"
else
PROD_FLAG=
fi

if [[ -n $VERCEL_API_TOKEN ]]
then
TOKEN_FLAG=--token=$VERCEL_API_TOKEN
else
TOKEN_FLAG=
fi

if [[ -n $VERCEL_SCOPE ]]
then
SCOPE_FLAG=--scope=$VERCEL_SCOPE
else
SCOPE_FLAG=
fi

if [[ -n $DATABASE_BRANCH ]]
then

if ! pnpm exec neonctl branches get "$DATABASE_BRANCH" --project-id "$NEON_PROJECT_ID" > /dev/null 2>&1
then
  echo "Creating new branch: $DATABASE_BRANCH"
  pnpm exec neonctl branches create --name "$DATABASE_BRANCH" --project-id "$NEON_PROJECT_ID" > /dev/null
else
  echo "Branch $DATABASE_BRANCH already exists, fetching connection string..."
fi

DATABASE_URL="$(pnpm exec neonctl connection-string "$DATABASE_BRANCH" --project-id "$NEON_PROJECT_ID")"

fi

if [[ -n $DATABASE_URL ]]
then
DB_RUN_FLAG="--env DATABASE_URL=$DATABASE_URL"
export DATABASE_URL=$DATABASE_URL
else
DB_RUN_FLAG=
fi

pnpm exec vercel pull --yes --environment=$VERCEL_ENVIRONMENT $SCOPE_FLAG $TOKEN_FLAG
pnpm exec vercel build $PROD_FLAG $SCOPE_FLAG $TOKEN_FLAG
pnpm exec vercel deploy --archive=tgz --prebuilt $SKIP_FLAG $PROD_FLAG $SCOPE_FLAG $TOKEN_FLAG $DB_RUN_FLAG > .vercel/DEPLOY_LOG
