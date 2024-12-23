#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ONE-TIME SETUP (uncomment and run these commands first time only):
#
# # Install Firebase CLI globally
# npm install -g firebase-tools
#
# # Login to Firebase
# firebase login
#
# # Initialize Firebase in your project (select these options):
# # - Select 'Hosting'
# # - Select your project
# # - Use 'build' as public directory
# # - Configure as single-page app: Yes
# # - Don't overwrite build/index.html: No
# firebase init
#
# # After initialization, you can delete these comments and use the script for regular deployments

echo -e "${GREEN}Starting deployment process...${NC}"

# Install dependencies if needed
if [ ! -d node_modules ]; then
    echo -e "${GREEN}Installing dependencies...${NC}"
    npm install
fi

# Build the project
echo -e "${GREEN}Building the project...${NC}"
npm run build || {
    echo -e "${RED}Build failed${NC}"
    exit 1
}

# Deploy to Firebase
echo -e "${GREEN}Deploying to Firebase...${NC}"
firebase deploy --only hosting || {
    echo -e "${RED}Deployment failed${NC}"
    exit 1
}

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "Your site should be available at the URL shown above."
