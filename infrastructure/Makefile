.PHONY: build
build:
	npm run build
	cd ../ && npm run build:staging
	cd ../ && npm run build:production
	cd ../backend/onconnect/ && cp ../build.sh ./ && ./build.sh && rm -f build.sh
	cd ../backend/ondisconnect/ && cp ../build.sh ./ && ./build.sh && rm -f build.sh
	cd ../backend/sendmessage/ && cp ../build.sh ./ && ./build.sh && rm -f build.sh

.PHONY: deploy-prod
deploy-prod: build
	cdk deploy TheCardRoomInfrastructure
	#rm -rf ../backend/*/build/

.PHONY: deploy-staging
deploy-staging: build
	cdk deploy TheCardRoomInfrastructureStaging
	#rm -rf ../backend/*/build/

.PHONY: deploy-all
deploy-all: build
	cdk deploy TheCardRoomInfrastructure TheCardRoomInfrastructureStaging
