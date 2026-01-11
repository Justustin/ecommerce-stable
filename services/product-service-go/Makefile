.PHONY: build run test clean dev deps

# Binary name
BINARY_NAME=product-service-go
MAIN_PATH=./cmd/api

# Go parameters
GOCMD=go
GOBUILD=$(GOCMD) build
GORUN=$(GOCMD) run
GOTEST=$(GOCMD) test
GOGET=$(GOCMD) get
GOMOD=$(GOCMD) mod

# Build the application
build:
	$(GOBUILD) -o bin/$(BINARY_NAME) $(MAIN_PATH)

# Run the application
run: build
	./bin/$(BINARY_NAME)

# Run in development mode with hot reload (requires air)
dev:
	air -c .air.toml

# Run without building
go-run:
	$(GORUN) $(MAIN_PATH)/main.go

# Run tests
test:
	$(GOTEST) -v ./...

# Run tests with coverage
test-coverage:
	$(GOTEST) -v -coverprofile=coverage.out ./...
	$(GOCMD) tool cover -html=coverage.out -o coverage.html

# Download dependencies
deps:
	$(GOMOD) download
	$(GOMOD) tidy

# Clean build artifacts
clean:
	rm -rf bin/
	rm -f coverage.out coverage.html

# Build for production (Linux)
build-linux:
	GOOS=linux GOARCH=amd64 $(GOBUILD) -o bin/$(BINARY_NAME)-linux $(MAIN_PATH)

# Build Docker image
docker-build:
	docker build -t lakoo/$(BINARY_NAME):latest .

# Run Docker container
docker-run:
	docker run -p 3002:3002 --env-file .env lakoo/$(BINARY_NAME):latest

# Format code
fmt:
	$(GOCMD) fmt ./...

# Lint code (requires golangci-lint)
lint:
	golangci-lint run ./...

# Generate mocks (requires mockgen)
mocks:
	mockgen -source=internal/repository/product_repository.go -destination=internal/mocks/product_repository_mock.go -package=mocks
