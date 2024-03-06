#! /bin/bash
set -e

if [[ "$OSTYPE" == "msys" ]] 
then
echo "vercel build requires unix shell (eg wsl2)"
exit 1
fi

if [[ -n $VERCEL_ENVIRONMENT ]]
then
ENV_FLAG=--environment=$VERCEL_ENVIRONMENT
else
ENV_FLAG=--environment=developement
fi

if [[ $VERCEL_ENVIRONMENT == "production" ]]
then
PROD_FLAG=--prod
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

npx vercel pull --yes --environment=$VERCEL_ENVIRONMENT $SCOPE_FLAG $TOKEN_FLAG
npx vercel build $PROD_FLAG $SCOPE_FLAG $TOKEN_FLAG
npx vercel deploy --prebuilt $PROD_FLAG $SCOPE_FLAG $TOKEN_FLAG > .vercel/DEPLOY_LOG
