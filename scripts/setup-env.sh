#!/bin/bash

# ==============================================================================
# Environment Setup Script for MedPharma Plus
# ==============================================================================
# This script helps you set up .env.local file with secure secrets
#
# Usage:
#   chmod +x scripts/setup-env.sh
#   ./scripts/setup-env.sh
# ==============================================================================

set -e

echo "╭──────────────────────────────────────────────────────────────────╮"
echo "│  MedPharma Plus - Environment Setup                             │"
echo "│  ქართული ინსტრუქცია: R2_SETUP.md                                │"
echo "╰──────────────────────────────────────────────────────────────────╯"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env.local already exists
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.local already exists!${NC}"
    echo ""
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}ℹ️  Keeping existing .env.local${NC}"
        exit 0
    fi
    echo -e "${YELLOW}Creating backup: .env.local.backup${NC}"
    cp .env.local .env.local.backup
fi

echo -e "${GREEN}✅ Creating .env.local file...${NC}"
echo ""

# Generate secure NEXTAUTH_SECRET
echo -e "${BLUE}🔐 Generating secure NEXTAUTH_SECRET...${NC}"
if command -v openssl &> /dev/null; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo -e "${GREEN}✅ Generated: ${NEXTAUTH_SECRET:0:20}...${NC}"
else
    echo -e "${YELLOW}⚠️  openssl not found. Using fallback method...${NC}"
    NEXTAUTH_SECRET=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32)
fi

# Start with template
cp .env.local.r2-template .env.local

# Replace NEXTAUTH_SECRET
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/your-secret-key-generate-with-openssl-rand-base64-32/$NEXTAUTH_SECRET/g" .env.local
else
    # Linux
    sed -i "s/your-secret-key-generate-with-openssl-rand-base64-32/$NEXTAUTH_SECRET/g" .env.local
fi

echo ""
echo -e "${GREEN}✅ .env.local created successfully!${NC}"
echo ""
echo "╭──────────────────────────────────────────────────────────────────╮"
echo "│  ⚠️  IMPORTANT: Complete R2 Configuration                        │"
echo "╰──────────────────────────────────────────────────────────────────╯"
echo ""
echo "You need to fill in your Cloudflare R2 credentials:"
echo ""
echo "  1. S3_ENDPOINT       - R2 endpoint URL"
echo "  2. S3_BUCKET         - R2 bucket name"
echo "  3. S3_ACCESS_KEY     - R2 access key ID"
echo "  4. S3_SECRET_KEY     - R2 secret access key"
echo "  5. S3_PUBLIC_URL     - R2 public URL (R2.dev or custom domain)"
echo ""
echo -e "${BLUE}📖 Full Setup Guide (ქართული):${NC}"
echo "   Quick Start (5 min): R2_QUICK_START.md"
echo "   Detailed Guide:      R2_SETUP.md"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "   1. nano .env.local"
echo "   2. Fill in R2 credentials (see R2_QUICK_START.md)"
echo "   3. pnpm dev"
echo ""
echo -e "${GREEN}✅ NEXTAUTH_SECRET is already configured!${NC}"
echo ""
