.PHONY: build
build:
	npm run build

.PHONY: deploy-prod
deploy-prod: build
	cdk deploy TheCardRoomInfrastructure
	#rm -rf ../backend/*/build/

.PHONY: deploy-staging
deploy-staging: build
	cdk deploy TheCardRoomInfrastructureStaging
	#rm -rf ../backend/*/build/
