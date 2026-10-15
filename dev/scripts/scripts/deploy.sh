#! /bin/bash
set -eo pipefail

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
  if [[ $VERCEL_ENVIRONMENT == "preview" ]]
  then
    EXISTING_BRANCH=$(neonctl branches list --project-id "$NEON_PROJECT_ID" --output json | jq -r --arg NAME "$DATABASE_BRANCH" '.[] | select(.name == $NAME)')

    if [[ -z "$EXISTING_BRANCH" ]]
    then
      echo "Creating new branch: $DATABASE_BRANCH"
      neonctl branches create --name "$DATABASE_BRANCH" --project-id "$NEON_PROJECT_ID" --output json > /dev/null
    else
      echo "Branch $DATABASE_BRANCH already exists, resetting"
      neonctl branches reset "$DATABASE_BRANCH" --project-id "$NEON_PROJECT_ID" --parent
    fi
  fi

  DATABASE_URL="$(neonctl connection-string "$DATABASE_BRANCH" --project-id "$NEON_PROJECT_ID")"
fi

if [[ -n $DATABASE_URL ]]
then
DB_RUN_FLAG="--env DATABASE_URL=$DATABASE_URL"
export DATABASE_URL=$DATABASE_URL
else
DB_RUN_FLAG=
fi

if [[ -n $BASE_URL ]]
then
BASE_URL_RUN_FLAG="--env BASE_URL=$BASE_URL"
else
BASE_URL_RUN_FLAG=
fi

pnpm exec vercel pull --yes --environment=$VERCEL_ENVIRONMENT $SCOPE_FLAG $TOKEN_FLAG
pnpm exec vercel build $PROD_FLAG $SCOPE_FLAG $TOKEN_FLAG
pnpm exec vercel deploy --archive=tgz --prebuilt $SKIP_FLAG $PROD_FLAG $SCOPE_FLAG $TOKEN_FLAG $DB_RUN_FLAG $BASE_URL_RUN_FLAG | tee .vercel/DEPLOY_LOG
