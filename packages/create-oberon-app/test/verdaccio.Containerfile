FROM docker.io/library/node:24-bookworm

ARG PNPM_VERSION=10.27.0

RUN corepack enable
RUN corepack prepare pnpm@${PNPM_VERSION} --activate
RUN mkdir -p /opt/verdaccio /opt/coa /logs

RUN pnpm install --prefix /opt/verdaccio verdaccio@6

COPY verdaccio-entry.mjs /opt/verdaccio/verdaccio-entry.mjs

WORKDIR /opt/coa

ENV CI=true
ENV PNPM_STORE_DIR=/pnpm/store
ENV npm_config_store_dir=/pnpm/store
ENV SQLITE_FILE=file:/opt/coa/nextjs/.oberon/oberon.db
ENV npm_config_registry=http://localhost:4873
ENV npm_config_replace_registry_host=never
ENV USE_DEVELOPMENT_DATABASE=true

CMD ["node", "/opt/verdaccio/verdaccio-entry.mjs"]
