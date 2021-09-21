.PHONY: install
install:
	npm install
	cd ./infrastructure && npm install
	cd ./backend/common && npm install
	cd ./backend/onconnect && npm install
	cd ./backend/ondisconnect && npm install
	cd ./backend/sendmessage && npm install
	cd ./backend/onplayerttl && npm install

.PHONY: start
start:
	npm start

.PHONY: build
build:
	# Build cdk infrastructure project...
	cd ./infrastructure && npm run build
	# Build frontend for staging...
	npm run build:staging
	# Build frontend for production...
	npm run build:production
	# Build onconnect lambda function...
	cd ./backend/onconnect/ && cp ../build.sh ./ && ./build.sh && rm -f build.sh
	# Build ondisconnect lambda function...
	cd ./backend/ondisconnect/ && cp ../build.sh ./ && ./build.sh && rm -f build.sh
	# Build sendmessage lambda function...
	cd ./backend/sendmessage/ && cp ../build.sh ./ && ./build.sh && rm -f build.sh
	# Build onplayerttl lambda function...
	cd ./backend/onplayerttl/ && cp ../build.sh ./ && ./build.sh && rm -f build.sh

.PHONY: deploy-prod
deploy-prod: build
	cd ./infrastructure && cdk deploy TheCardRoomInfrastructure
	#rm -rf ./backend/*/build/

.PHONY: deploy-staging
deploy-staging: build
	cd ./infrastructure && cdk deploy TheCardRoomInfrastructureStaging
	#rm -rf ./backend/*/build/

.PHONY: deploy-all
deploy-all: build
	cd ./infrastructure && cdk deploy TheCardRoomInfrastructure TheCardRoomInfrastructureStaging
