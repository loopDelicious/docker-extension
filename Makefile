IMAGE?=joycelin79/newman-extension

TAG?=latest

BUILDER=buildx-multi-arch

INFO_COLOR = \033[0;36m
NO_COLOR   = \033[m

build: ## Build service image to be deployed as a desktop extension
	docker build --tag=$(IMAGE):$(TAG) .

install: build-extension ## Install the extension
	docker extension install --force $(IMAGE):$(TAG)

update: build-extension ## Update the extension
	docker extension update --force $(IMAGE):$(TAG)

prepare-buildx: ## Create buildx builder for multi-arch build, if not exists
	docker buildx inspect $(BUILDER) || docker buildx create --name=$(BUILDER) --driver=docker-container --driver-opt=network=host

push: prepare-buildx ## Build & Upload extension image to hub. Do not push if tag already exists: make push-extension tag=0.1
	docker pull $(IMAGE):$(TAG) && echo "Failure: Tag already exists" || docker buildx build --push --builder=$(BUILDER) --platform=linux/amd64,linux/arm64 --build-arg TAG=$(TAG) --tag=$(IMAGE):$(TAG) .

help: ## Show this help
	@echo Please specify a build target. The choices are:
	@grep -E '^[0-9a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "$(INFO_COLOR)%-30s$(NO_COLOR) %s\n", $$1, $$2}'

.PHONY: build-extension push-extension help