FROM docker.io/library/node:24-bookworm

ARG PNPM_VERSION=10.27.0

RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

RUN mkdir -p /opt/coa && npm install --prefix /opt/coa verdaccio@6

COPY verdaccio-container.mjs /opt/coa/verdaccio-container.mjs

WORKDIR /opt/coa

ENV CI=true
ENV PNPM_STORE_DIR=/pnpm/store
ENV npm_config_store_dir=/pnpm/store
ENV SQLITE_FILE=file:/opt/coa/scaffold/.oberon/oberon.db
ENV npm_config_registry=http://localhost:4873
ENV npm_config_replace_registry_host=never
ENV USE_DEVELOPMENT_DATABASE=true

CMD ["node", "/opt/coa/verdaccio-container.mjs"]
