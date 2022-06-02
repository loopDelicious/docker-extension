FROM node:17.7-alpine3.14 AS client-builder
WORKDIR /app/client

# cache packages in layer
COPY client/package.json /app/client/package.json
# COPY client/yarn.lock /app/client/yarn.lock
ARG TARGETARCH
RUN npm config set cache-folder /usr/local/share/.cache/npm-${TARGETARCH}
RUN --mount=type=cache,target=/usr/local/share/.cache/npm-${TARGETARCH}

# install
RUN npm install --production
# RUN npm install -g newman-reporter-html
COPY client /app/client
RUN --mount=type=cache,target=/usr/local/share/.cache/npm-${TARGETARCH} \
    npm run build

# FROM alpine
LABEL org.opencontainers.image.title="Docker disk usage" \
    org.opencontainers.image.description="A sample extension to show how to run docker commands from Desktop Extensions." \
    org.opencontainers.image.vendor="Docker Inc." \
    com.docker.desktop.extension.api.version=">= 0.2.0" \
    com.docker.desktop.extension.icon="https://www.docker.com/wp-content/uploads/2022/03/Moby-logo.png"

# COPY --from=client-builder /app/client/dist ui
WORKDIR /
RUN mkdir /ui && mv /app/client/dist/* /ui
COPY docker.svg .
COPY metadata.json .
COPY docker-compose.yaml .
CMD /service -socket /run/guest-services/extension-newman-extension.sock


# FROM golang:1.17-alpine AS builder
# ENV CGO_ENABLED=0
# RUN apk add --update make
# WORKDIR /backend
# COPY go.* .
# RUN --mount=type=cache,target=/go/pkg/mod \
#     --mount=type=cache,target=/root/.cache/go-build \
#     go mod download
# COPY . .
# RUN --mount=type=cache,target=/go/pkg/mod \
#     --mount=type=cache,target=/root/.cache/go-build \
#     make bin

# FROM node:14.17-alpine3.13 AS client-builder
# WORKDIR /ui
# # cache packages in layer
# COPY ui/package.json /ui/package.json
# COPY ui/package-lock.json /ui/package-lock.json
# RUN --mount=type=cache,target=/usr/src/app/.npm \
#     npm set cache /usr/src/app/.npm && \
#     npm ci
# # install
# COPY ui /ui
# RUN npm run build

# FROM alpine
# LABEL org.opencontainers.image.title="newman-extension" \
#     org.opencontainers.image.description="My awesome Docker Desktop extension" \
#     org.opencontainers.image.vendor="Docker Inc." \
#     com.docker.desktop.extension.api.version=">= 0.1.0"
# COPY --from=builder /backend/bin/service /

# COPY metadata.json .
# COPY docker.svg .
# COPY --from=client-builder /ui/build ui
