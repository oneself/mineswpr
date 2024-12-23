#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting deployment process...${NC}"

# Check if git is initialized
if [ ! -d .git ]; then
    echo -e "${RED}Git repository not initialized.${NC}"
    echo -e "${YELLOW}Please run 'git init' first${NC}"
    exit 1
fi

# Check if GitHub remote exists
if ! git remote | grep -q 'origin'; then
    echo -e "${RED}GitHub remote not found.${NC}"
    echo -e "${YELLOW}Please add a remote with: git remote add origin <your-repo-url>${NC}"
    exit 1
fi

# Get GitHub username from remote URL
GITHUB_USERNAME=$(git remote get-url origin | sed -n 's/.*github.com[:\/]\([^\/]*\).*/\1/p')
if [ -z "$GITHUB_USERNAME" ]; then
    echo -e "${RED}Could not determine GitHub username from remote URL${NC}"
    exit 1
fi

# Update package.json homepage
echo -e "${GREEN}Updating package.json with GitHub username...${NC}"
sed -i "s/\${GITHUB_USERNAME}/$GITHUB_USERNAME/g" package.json

# Install dependencies if node_modules doesn't exist
if [ ! -d node_modules ]; then
    echo -e "${GREEN}Installing dependencies...${NC}"
    npm install
fi

# Ensure we're on main branch and it's up to date
echo -e "${GREEN}Checking git status...${NC}"
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ]; then
    echo -e "${YELLOW}Not on main/master branch. Checking out main...${NC}"
    git checkout main 2>/dev/null || git checkout master || {
        echo -e "${RED}Could not checkout main/master branch${NC}"
        exit 1
    }
fi

# Commit any pending changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}Uncommitted changes detected. Committing...${NC}"
    git add .
    git commit -m "Update before deployment"
fi

# Pull latest changes
echo -e "${GREEN}Pulling latest changes...${NC}"
git pull origin $(git branch --show-current) || {
    echo -e "${YELLOW}Could not pull. You might need to push your changes first.${NC}"
}

# Build and deploy
echo -e "${GREEN}Building and deploying...${NC}"
npm run build || {
    echo -e "${RED}Build failed${NC}"
    exit 1
}

# Create and switch to gh-pages branch
echo -e "${GREEN}Setting up gh-pages branch...${NC}"
if ! git show-ref --verify --quiet refs/heads/gh-pages; then
    git checkout --orphan gh-pages
    git rm -rf .
else
    git checkout gh-pages
    git pull origin gh-pages || true
    git rm -rf .
fi

# Copy build files
echo -e "${GREEN}Copying build files...${NC}"
cp -r build/* .
rm -rf build

# Add and commit files
echo -e "${GREEN}Committing changes...${NC}"
git add .
git commit -m "Deploy to GitHub Pages"

# Push to gh-pages
echo -e "${GREEN}Pushing to gh-pages...${NC}"
git push origin gh-pages

# Switch back to original branch
echo -e "${GREEN}Switching back to original branch...${NC}"
git checkout -

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "Your site should be available at: https://$GITHUB_USERNAME.github.io/mineswpr"
echo -e "Note: It might take a few minutes for the changes to be visible."
