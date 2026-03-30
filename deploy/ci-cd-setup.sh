#!/bin/bash

# CI/CD Setup Script for ClearSpring V2
# This script helps configure GitHub Actions CI/CD pipeline

set -e

echo "🚀 ClearSpring V2 - CI/CD Setup Script"
echo "======================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if running in project directory
PROJECT_DIR="/root/.openclaw/workspace/projects/clearspring-v2"
if [ ! -d "$PROJECT_DIR/.github/workflows" ]; then
    print_error "Project directory not found. Please run this script from the project root."
    exit 1
fi

print_success "Project directory verified"

# Step 1: Verify workflow files exist
echo ""
echo "📋 Step 1: Verifying workflow files..."

WORKFLOWS=("deploy.yml" "staging.yml" "notify.yml")
for workflow in "${WORKFLOWS[@]}"; do
    if [ -f "$PROJECT_DIR/.github/workflows/$workflow" ]; then
        print_success "$workflow exists"
    else
        print_error "$workflow not found"
        exit 1
    fi
done

# Step 2: Guide user through GitHub Secrets setup
echo ""
echo "🔐 Step 2: GitHub Secrets Configuration"
echo "======================================="
echo ""
echo "Please configure the following secrets in your GitHub repository:"
echo "Repository Settings → Secrets and variables → Actions → New repository secret"
echo ""
echo "Required Secrets:"
echo "  1. SSH_PRIVATE_KEY - Your SSH private key for server access"
echo "  2. SERVER_HOST - Server IP address (101.96.192.63)"
echo "  3. SERVER_USER - Server username (root)"
echo "  4. FEISHU_WEBHOOK - Feishu webhook URL for deployment notifications"
echo ""

# Generate SSH key if not exists
SSH_KEY_PATH="$HOME/.ssh/github_actions"
if [ ! -f "$SSH_KEY_PATH" ]; then
    print_warning "SSH key not found at $SSH_KEY_PATH"
    echo "Would you like to generate a new SSH key pair? (y/n)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        ssh-keygen -t ed25519 -f "$SSH_KEY_PATH" -C "github-actions@clearspring"
        print_success "SSH key pair generated"
        echo ""
        echo "Next steps:"
        echo "  1. Add the public key ($SSH_KEY_PATH.pub) to your server's ~/.ssh/authorized_keys"
        echo "  2. Copy the private key content to GitHub Secrets as SSH_PRIVATE_KEY"
    fi
else
    print_success "SSH key found at $SSH_KEY_PATH"
fi

# Step 3: Verify Git configuration
echo ""
echo "📦 Step 3: Git Configuration"
echo "============================"

cd "$PROJECT_DIR"

if git rev-parse --git-dir > /dev/null 2>&1; then
    print_success "Git repository initialized"
    
    # Check current branch
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
    echo "  Current branch: $CURRENT_BRANCH"
    
    # Check for uncommitted changes
    if [ -n "$(git status --porcelain)" ]; then
        print_warning "Uncommitted changes detected"
        git status --short
    else
        print_success "Working tree clean"
    fi
else
    print_error "Not a git repository"
    echo "Run 'git init' to initialize"
fi

# Step 4: Test workflow syntax (if actionlint is available)
echo ""
echo "🔍 Step 4: Workflow Validation"
echo "=============================="

if command -v actionlint &> /dev/null; then
    actionlint "$PROJECT_DIR/.github/workflows/"
    print_success "Workflow files validated"
else
    print_warning "actionlint not installed. Install with: go install github.com/rhysd/actionlint/cmd/actionlint@latest"
    echo "Skipping workflow validation"
fi

# Summary
echo ""
echo "📊 Setup Summary"
echo "================"
echo ""
echo "Workflow Files Created:"
echo "  ✓ .github/workflows/deploy.yml    - Production deployment"
echo "  ✓ .github/workflows/staging.yml   - Staging deployment (PR)"
echo "  ✓ .github/workflows/notify.yml    - Deployment notifications"
echo ""
echo "Next Steps:"
echo "  1. Configure GitHub Secrets (see Step 2)"
echo "  2. Push changes to GitHub:"
echo "     git add .github/workflows/"
echo "     git commit -m 'feat(Phase 3): Add GitHub Actions CI/CD configuration'"
echo "     git push origin main"
echo ""
echo "  3. Monitor Actions tab on GitHub for deployment status"
echo ""
print_success "Setup script completed!"
