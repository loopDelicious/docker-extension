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
# COPY client/src/file.hbs /tmp/file.hbs

FROM alpine
LABEL org.opencontainers.image.title="Newman" \
    org.opencontainers.image.description="Run your Postman collection from Docker Desktop" \
    org.opencontainers.image.vendor="Postman" \
    com.docker.desktop.extension.api.version=">= 0.0.1" \
    com.docker.desktop.extension.icon="https://voyager.postman.com/icon/icon-newman-docker-postman.svg" \
    com.docker.extension.screenshots='[{"alt":"Add Postman API key", "url":"https://i.imgur.com/xF9jECq.png"},{"alt":"Select Postman collection to run", "url":"https://i.imgur.com/Zm5CT5M.png"},{"alt":"View collection run results", "url":"https://user-images.githubusercontent.com/212269/186909437-107c65db-93b1-4a8c-8f32-bb1271b0dfa0.png"}]' \
    com.docker.extension.detailed-description="<h1>Newman</h1><p>The Postman extension uses Newman to run collections on Docker Desktop. View results of your API tests in a staging or production environment.</p>" \
    com.docker.extension.publisher-url="https://www.postman.com" \
    com.docker.extension.additional-urls='[{"title":"Privacy Policy","url":"https://www.postman.com/legal/privacy-policy"},{"title":"Terms of Service","url":"https://www.postman.com/legal/terms"}]' \
    com.docker.extension.changelog="<ul><li>Added metadata to provide more information about the extension.</li></ul>"

COPY docker-compose.yaml .
COPY metadata.json .
COPY icon-newman-docker.svg .
COPY --from=client-builder /ui/dist ui
