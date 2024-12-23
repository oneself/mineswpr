# Colors for output
RED := \033[0;31m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

.PHONY: help setup install build deploy dev clean

# Default target when just running 'make'
help:
	@echo "Available commands:"
	@echo "  make setup     - First-time setup: install Firebase CLI and initialize project"
	@echo "  make install   - Install project dependencies"
	@echo "  make build     - Build the project"
	@echo "  make deploy    - Deploy to Firebase (includes build)"
	@echo "  make dev       - Start development server"
	@echo "  make clean     - Remove build and dependency directories"

# First-time setup
setup:
	@echo "${GREEN}Installing Firebase CLI...${NC}"
	npm install -g firebase-tools
	@echo "${GREEN}Logging into Firebase...${NC}"
	firebase login
	@echo "${YELLOW}Initializing Firebase project...${NC}"
	@echo "${YELLOW}Please select these options:${NC}"
	@echo "1. Select 'Hosting'"
	@echo "2. Select your project"
	@echo "3. Use 'build' as public directory"
	@echo "4. Configure as single-page app: Yes"
	@echo "5. Don't overwrite build/index.html: No"
	firebase init

# Install dependencies
install:
	@echo "${GREEN}Installing dependencies...${NC}"
	npm install

# Build the project
build:
	@echo "${GREEN}Building the project...${NC}"
	npm run build

# Deploy to Firebase (includes build)
deploy: build
	@echo "${GREEN}Deploying to Firebase...${NC}"
	firebase deploy --only hosting

# Start development server
dev:
	@echo "${GREEN}Starting development server...${NC}"
	npm start

# Clean build and dependencies
clean:
	@echo "${YELLOW}Cleaning build and dependency directories...${NC}"
	rm -rf build node_modules 