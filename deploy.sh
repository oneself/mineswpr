#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment process...${NC}"

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${RED}Git repository not initialized.${NC}"
    echo -e "${GREEN}Initializing git repository...${NC}"
    git init
fi

# Check if GitHub remote exists
if ! git remote | grep -q 'origin'; then
    echo -e "${RED}GitHub remote not found.${NC}"
    echo -e "Please enter your GitHub username:"
    read GITHUB_USERNAME
    
    # Update package.json homepage
    sed -i "s/\${GITHUB_USERNAME}/$GITHUB_USERNAME/g" package.json
    
    echo -e "Setting up GitHub remote..."
    git remote add origin "https://github.com/$GITHUB_USERNAME/mineswpr.git"
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d node_modules ]; then
    echo -e "${GREEN}Installing dependencies...${NC}"
    npm install
fi

# Build and deploy
echo -e "${GREEN}Building and deploying...${NC}"
npm run deploy

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "Your site should be available at: https://$GITHUB_USERNAME.github.io/mineswpr"
echo -e "Note: It might take a few minutes for the changes to be visible." 