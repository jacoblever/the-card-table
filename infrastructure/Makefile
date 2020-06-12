.PHONY: build
build:
	# Build cdk infrastructure project...
	npm run build
	# Build frontend for staging...
	cd ../ && npm run build:staging
	# Build frontend for production...
	cd ../ && npm run build:production
	# Build onconnect lambda function...
	cd ../backend/onconnect/ && cp ../build.sh ./ && ./build.sh && rm -f build.sh
	# Build ondisconnect lambda function...
	cd ../backend/ondisconnect/ && cp ../build.sh ./ && ./build.sh && rm -f build.sh
	# Build sendmessage lambda function...
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
