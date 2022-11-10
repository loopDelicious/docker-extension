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
    org.opencontainers.image.description="Run your Postman collections from Docker Desktop." \
    org.opencontainers.image.vendor="Postman" \
    com.docker.desktop.extension.api.version=">= 0.0.1" \
    com.docker.desktop.extension.icon="https://voyager.postman.com/icon/icon-newman-docker-orange-postman.svg" \
    com.docker.extension.screenshots='[{"alt":"View collection run results", "url":"https://user-images.githubusercontent.com/17693714/200926587-cc817844-419d-4a39-abfa-e3b9b43881ea.png"}, {"alt":"Add Postman API key", "url":"https://user-images.githubusercontent.com/17693714/200926910-a0fdba8d-02b0-4025-b7d6-95eb556eefa7.png"},{"alt":"Select Postman collection to run", "url":"https://user-images.githubusercontent.com/17693714/200926775-35e8dc5a-6c44-45de-80a8-f80430c81066.png"}]' \
    com.docker.extension.detailed-description="<h1>Newman</h1><p>The Postman extension uses Newman to run collections on Docker Desktop. View results of your API tests in a staging or production environment.</p><h1>Known issues</h1><p>In some cases, depending on test collections and test results, some buttons (expand/collapse folder, copy/paste) might be inoperative.</p>" \
    com.docker.extension.publisher-url="https://www.postman.com" \
    com.docker.extension.additional-urls='[{"title":"GitHub Repository","url":"https://github.com/loopDelicious/docker-extension"}, {"title":"Feedback and issues","url":"https://github.com/loopDelicious/docker-extension/issues"}, {"title":"Privacy Policy","url":"https://www.postman.com/legal/privacy-policy"},{"title":"Terms of Service","url":"https://www.postman.com/legal/terms"}]' \
    com.docker.extension.changelog="<ul><li>Added metadata to provide more information about the extension.</li></ul>"

COPY docker-compose.yaml .
COPY metadata.json .
COPY icon-newman-docker.svg .
COPY postman-docker-color.svg .
COPY --from=client-builder /ui/dist ui
