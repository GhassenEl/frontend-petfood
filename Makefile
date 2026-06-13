# PetfoodTN — raccourcis DevOps (make / mingw32-make sur Windows)

.PHONY: dev build test ci health docker-up docker-ml docker-prod docker-down

dev:
	npm run dev

build:
	npm run build

test:
	npm test

ci:
	npm run devops:ci

health:
	npm run devops:health

docker-up:
	npm run docker:up

docker-ml:
	npm run docker:ml:up

docker-prod:
	npm run docker:prod:up

docker-down:
	npm run docker:down
