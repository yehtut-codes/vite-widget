#!/bin/bash

# Widget Deployment Script for S3 + CloudFront
# Usage: ./deploy.sh [bucket-name] [cloudfront-distribution-id]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BUCKET_NAME=${1:-""}
DISTRIBUTION_ID=${2:-""}
REGION=${AWS_DEFAULT_REGION:-"us-east-1"}

# Functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_requirements() {
    log_info "Checking deployment requirements..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI is not installed. Please install it first:"
        echo "  https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html"
        exit 1
    fi
    
    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured. Run: aws configure"
        exit 1
    fi
    
    # Check if Node.js and npm are available
    if ! command -v npm &> /dev/null; then
        log_error "npm is not installed. Please install Node.js and npm."
        exit 1
    fi
    
    log_success "All requirements met!"
}

get_deployment_config() {
    if [ -z "$BUCKET_NAME" ]; then
        echo -n "Enter your S3 bucket name: "
        read BUCKET_NAME
    fi
    
    if [ -z "$DISTRIBUTION_ID" ]; then
        echo -n "Enter CloudFront Distribution ID (optional, press Enter to skip): "
        read DISTRIBUTION_ID
    fi
    
    log_info "Deployment Configuration:"
    echo "  📦 S3 Bucket: $BUCKET_NAME"
    echo "  🌐 CloudFront: ${DISTRIBUTION_ID:-"None (will use S3 static hosting)"}"
    echo "  🌍 Region: $REGION"
    echo ""
}

create_bucket_if_needed() {
    log_info "Checking if bucket exists..."
    
    if aws s3 ls "s3://$BUCKET_NAME" 2>&1 | grep -q 'NoSuchBucket'; then
        log_warning "Bucket $BUCKET_NAME does not exist. Creating it..."
        
        if [ "$REGION" == "us-east-1" ]; then
            aws s3 mb "s3://$BUCKET_NAME"
        else
            aws s3 mb "s3://$BUCKET_NAME" --region "$REGION"
        fi
        
        log_success "Bucket created successfully!"
    else
        log_success "Bucket exists!"
    fi
}

setup_bucket_policy() {
    log_info "Setting up bucket for public access..."
    
    # Create bucket policy for public read access
    cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

    # Apply bucket policy
    aws s3api put-bucket-policy --bucket "$BUCKET_NAME" --policy file://bucket-policy.json
    
    # Configure CORS for iframe embedding
    cat > cors-config.json << EOF
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "HEAD"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": []
        }
    ]
}
EOF

    aws s3api put-bucket-cors --bucket "$BUCKET_NAME" --cors-configuration file://cors-config.json
    
    # Enable static website hosting
    aws s3 website "s3://$BUCKET_NAME" --index-document iframe.html --error-document iframe.html
    
    # Clean up temp files
    rm bucket-policy.json cors-config.json
    
    log_success "Bucket configured for public access and iframe embedding!"
}

build_widget() {
    log_info "Building production widget..."
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        log_info "Installing dependencies..."
        npm install
    fi
    
    # Build the iframe-ready widget
    npm run build:iframe
    
    log_success "Widget built successfully!"
}

deploy_to_s3() {
    log_info "Deploying to S3..."
    
    # Upload files with appropriate cache headers
    aws s3 cp dist/iframe.html "s3://$BUCKET_NAME/" \
        --content-type "text/html" \
        --cache-control "public, max-age=300" \
        --metadata-directive REPLACE
    
    aws s3 cp dist/my-widget.iife.js "s3://$BUCKET_NAME/" \
        --content-type "application/javascript" \
        --cache-control "public, max-age=31536000" \
        --metadata-directive REPLACE
    
    aws s3 sync dist/assets/ "s3://$BUCKET_NAME/assets/" \
        --cache-control "public, max-age=31536000" \
        --delete
    
    log_success "Files uploaded to S3!"
}

invalidate_cloudfront() {
    if [ -n "$DISTRIBUTION_ID" ]; then
        log_info "Invalidating CloudFront cache..."
        
        INVALIDATION_ID=$(aws cloudfront create-invalidation \
            --distribution-id "$DISTRIBUTION_ID" \
            --paths "/*" \
            --query 'Invalidation.Id' \
            --output text)
        
        log_success "CloudFront invalidation created (ID: $INVALIDATION_ID)"
        log_info "Cache invalidation may take 5-15 minutes to complete."
    fi
}

get_deployment_urls() {
    log_success "🚀 Deployment completed successfully!"
    echo ""
    echo "📋 Deployment Summary:"
    echo "===================="
    
    # S3 Website URL
    S3_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
    echo "🌐 S3 Website URL: $S3_URL"
    
    # CloudFront URL (if configured)
    if [ -n "$DISTRIBUTION_ID" ]; then
        CLOUDFRONT_DOMAIN=$(aws cloudfront get-distribution \
            --id "$DISTRIBUTION_ID" \
            --query 'Distribution.DomainName' \
            --output text 2>/dev/null || echo "Unable to fetch")
        
        if [ "$CLOUDFRONT_DOMAIN" != "Unable to fetch" ]; then
            echo "⚡ CloudFront URL: https://$CLOUDFRONT_DOMAIN"
            EMBED_URL="https://$CLOUDFRONT_DOMAIN/iframe.html"
        else
            EMBED_URL="$S3_URL/iframe.html"
        fi
    else
        EMBED_URL="$S3_URL/iframe.html"
    fi
    
    echo ""
    echo "🎯 iframe Embed Code:"
    echo "===================="
    echo '<iframe'
    echo "    src=\"$EMBED_URL\""
    echo '    width="400"'
    echo '    height="300"'
    echo '    frameborder="0">'
    echo '</iframe>'
    echo ""
    
    echo "🎨 With Configuration:"
    echo "====================="
    echo '<iframe'
    echo "    src=\"$EMBED_URL?theme=dark&debug=true\""
    echo '    width="400"'
    echo '    height="300"'
    echo '    frameborder="0">'
    echo '</iframe>'
    echo ""
    
    echo "📊 Bundle Information:"
    echo "====================="
    echo "📦 JavaScript: $(du -h dist/my-widget.iife.js | cut -f1)"
    echo "🎨 CSS: $(du -h dist/assets/my-widget.css | cut -f1)"
    echo "📄 HTML: $(du -h dist/iframe.html | cut -f1)"
    echo ""
    
    log_info "Your widget is now live and ready for iframe embedding!"
}

# Main deployment flow
main() {
    echo "🚀 Widget Deployment Script"
    echo "=========================="
    echo ""
    
    check_requirements
    get_deployment_config
    create_bucket_if_needed
    setup_bucket_policy
    build_widget
    deploy_to_s3
    invalidate_cloudfront
    get_deployment_urls
}

# Run main function
main "$@"