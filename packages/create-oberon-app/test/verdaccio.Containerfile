FROM docker.io/library/node:24-bookworm

ARG PNPM_VERSION=10.27.0

RUN corepack enable
RUN corepack prepare pnpm@${PNPM_VERSION} --activate
RUN mkdir -p /opt/verdaccio /opt/coa /logs

RUN pnpm install --prefix /opt/verdaccio verdaccio@6

COPY verdaccio-entry.mjs /opt/verdaccio/verdaccio-entry.mjs

WORKDIR /opt/coa

CMD ["node", "/opt/verdaccio/verdaccio-entry.mjs"]
