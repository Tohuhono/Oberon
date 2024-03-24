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
echo "++ VERCEL_API_TOKEN"
TOKEN_FLAG=--token=$VERCEL_API_TOKEN
else
echo "-- VERCEL_API_TOKEN"
TOKEN_FLAG=
fi

if [[ -n $VERCEL_SCOPE ]]
then
echo "++ VERCEL_SCOPE"
SCOPE_FLAG=--scope=$VERCEL_SCOPE
else
echo "-- VERCEL_SCOPE"
SCOPE_FLAG=
fi

if [[ -n $VERCEL_ORG_ID ]]
then
echo "++ VERCEL_ORG_ID"
else
echo "-- VERCEL_ORG_ID"
fi

if [[ -n $VERCEL_PROJECT_ID ]]
then
echo "++ VERCEL_PROJECT_ID"
else
echo "-- VERCEL_PROJECT_ID"
TOKEN_FLAG=
fi


pnpx vercel pull --yes --environment=$VERCEL_ENVIRONMENT $SCOPE_FLAG $TOKEN_FLAG
pnpx vercel build $PROD_FLAG $SCOPE_FLAG $TOKEN_FLAG
pnpx vercel deploy --prebuilt $PROD_FLAG $SCOPE_FLAG $TOKEN_FLAG > .vercel/DEPLOY_LOG
