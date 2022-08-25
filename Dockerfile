FROM node:17.7-alpine3.14 AS client-builder
WORKDIR /ui

# cache packages in layer
COPY client/package.json /ui/package.json
COPY client/package-lock.json /ui/package-lock.json
RUN --mount=type=cache,target=/usr/src/app/.npm \
    npm set cache /usr/src/app/.npm && \
    npm ci

COPY client /ui
RUN npm run build
COPY client/src/file.hbs /tmp/file.hbs

FROM alpine
LABEL org.opencontainers.image.title="Newman" \
    org.opencontainers.image.description="Run your Postman collection from Docker Desktop" \
    org.opencontainers.image.vendor="Postman" \
    com.docker.desktop.extension.api.version=">= 0.2.0" \
    com.docker.desktop.extension.icon="https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png"

COPY docker-compose.yaml .
COPY metadata.json .
COPY postman.svg .
COPY --from=client-builder /ui/dist ui
