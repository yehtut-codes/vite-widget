# S3 + CloudFront Deployment Guide

## iframe Embedding Support

Your widget now supports **easy iframe embedding** after deployment to S3 + CloudFront!

## 🚀 Quick Setup

### 1. Build the iframe-ready widget

```bash
npm run build:iframe
```

This creates:
- `dist/iframe.html` - Self-contained widget page
- `dist/my-widget.iife.js` - Widget JavaScript
- `dist/assets/my-widget.css` - Widget styles

### 2. Upload to S3

Upload these files to your S3 bucket:
```
your-bucket/
├── iframe.html
├── my-widget.iife.js
└── assets/
    └── my-widget.css
```

### 3. Configure S3 Bucket

**Bucket Policy for Public Access:**
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

**CORS Configuration:**
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "HEAD"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### 4. Setup CloudFront Distribution

**Origin Settings:**
- **Origin Domain**: `your-bucket.s3.amazonaws.com`
- **Origin Path**: `/` (empty)
- **Origin Access**: Public

**Cache Behavior:**
- **Path Pattern**: `*`
- **Cache Policy**: Managed-CachingOptimized
- **Origin Request Policy**: Managed-UserAgentRefererHeaders

**Custom Headers (Optional):**
```
X-Frame-Options: ALLOWALL
Content-Security-Policy: frame-ancestors *;
```

## 🎯 iframe Embedding

### Basic Embedding

```html
<!-- Simple iframe embed -->
<iframe 
    src="https://your-domain.cloudfront.net/iframe.html"
    width="400" 
    height="300"
    frameborder="0">
</iframe>
```

### Advanced Embedding with Configuration

```html
<!-- With theme and configuration -->
<iframe 
    src="https://your-domain.cloudfront.net/iframe.html?theme=dark&debug=true"
    width="400" 
    height="300"
    frameborder="0"
    id="my-widget-iframe">
</iframe>
```

### URL Parameters

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `theme` | `string` | Widget theme | `?theme=dark` |
| `apiKey` | `string` | API key | `?apiKey=sk-123` |
| `debug` | `boolean` | Debug mode | `?debug=true` |

### Responsive iframe

```html
<!-- Responsive iframe with JavaScript -->
<div style="position: relative; width: 100%; max-width: 400px;">
    <iframe 
        src="https://your-domain.cloudfront.net/iframe.html"
        style="width: 100%; height: 300px; border: none;"
        id="responsive-widget">
    </iframe>
</div>

<script>
// Listen for resize messages from widget
window.addEventListener('message', function(event) {
    if (event.data.type === 'widget-resize') {
        const iframe = document.getElementById('responsive-widget');
        iframe.style.height = event.data.data.height + 'px';
    }
});
</script>
```

## 🔧 Advanced iframe Communication

### Parent-Child Communication

The widget posts messages to the parent window:

```javascript
// In parent page - listen for widget events
window.addEventListener('message', function(event) {
    switch(event.data.type) {
        case 'widget-loaded':
            console.log('Widget loaded successfully', event.data.data);
            break;
        case 'widget-error':
            console.error('Widget error:', event.data.data.error);
            break;
        case 'widget-resize':
            // Auto-resize iframe
            const iframe = document.getElementById('my-widget-iframe');
            iframe.style.height = event.data.data.height + 'px';
            break;
    }
});
```

### Dynamic Configuration

```javascript
// Send configuration to widget after load
const iframe = document.getElementById('my-widget-iframe');
iframe.onload = function() {
    iframe.contentWindow.postMessage({
        type: 'update-config',
        data: { theme: 'premium', apiKey: 'new-key' }
    }, '*');
};
```

## 📦 CloudFront Optimization

### Cache Settings

**For HTML files** (`iframe.html`):
```
Cache-Control: public, max-age=300  # 5 minutes
```

**For JavaScript/CSS assets**:
```
Cache-Control: public, max-age=31536000  # 1 year
```

### Compression

Enable **Gzip compression** in CloudFront:
- **Compress objects automatically**: Yes
- **File types**: `text/html`, `text/css`, `application/javascript`

### Security Headers

```
X-Content-Type-Options: nosniff
X-Frame-Options: ALLOWALL
Referrer-Policy: strict-origin-when-cross-origin
```

## 🎨 Embedding Examples

### WordPress

```php
// In WordPress post/page
[iframe src="https://your-domain.cloudfront.net/iframe.html?theme=dark" width="400" height="300"]
```

### React Application

```jsx
function MyWidgetEmbed({ theme = 'default' }) {
    const [height, setHeight] = useState(300);
    
    useEffect(() => {
        const handleMessage = (event) => {
            if (event.data.type === 'widget-resize') {
                setHeight(event.data.data.height);
            }
        };
        
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);
    
    return (
        <iframe
            src={`https://your-domain.cloudfront.net/iframe.html?theme=${theme}`}
            width="100%"
            height={height}
            frameBorder="0"
            title="My Widget"
        />
    );
}
```

### Angular Component

```typescript
@Component({
    selector: 'app-widget',
    template: `
        <iframe 
            [src]="widgetUrl" 
            [style.height.px]="height"
            width="100%" 
            frameborder="0">
        </iframe>
    `
})
export class WidgetComponent {
    height = 300;
    widgetUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        'https://your-domain.cloudfront.net/iframe.html'
    );
    
    @HostListener('window:message', ['$event'])
    onMessage(event: MessageEvent) {
        if (event.data.type === 'widget-resize') {
            this.height = event.data.data.height;
        }
    }
}
```

## 🚀 Deployment Script

```bash
#!/bin/bash
# deploy.sh - Deploy widget to S3 + CloudFront

# Build the widget
npm run build:iframe

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name/ --delete --exclude "*.map"

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
    --distribution-id YOUR_DISTRIBUTION_ID \
    --paths "/*"

echo "✅ Widget deployed successfully!"
echo "🌐 iframe URL: https://your-domain.cloudfront.net/iframe.html"
```

## 📊 Performance Considerations

### Bundle Size
- **Current**: ~555KB (can be reduced to ~50KB with optimizations)
- **Gzipped**: ~167KB
- **Load time**: < 2 seconds on 3G

### CDN Benefits
- **Global distribution** via CloudFront
- **Edge caching** for faster loads
- **Automatic compression**
- **DDoS protection**

## 🔒 Security

### iframe Sandboxing

```html
<!-- Recommended security attributes -->
<iframe 
    src="https://your-domain.cloudfront.net/iframe.html"
    sandbox="allow-scripts allow-same-origin allow-forms"
    width="400" 
    height="300">
</iframe>
```

### Content Security Policy

```html
<!-- In parent page -->
<meta http-equiv="Content-Security-Policy" 
      content="frame-src https://your-domain.cloudfront.net;">
```

---

## ✅ Summary

Your widget is now **iframe-ready** and optimized for S3 + CloudFront deployment:

1. **One-line embedding**: `<iframe src="your-cloudfront-url/iframe.html">`
2. **Configuration via URL params**: `?theme=dark&apiKey=key`
3. **Auto-sizing**: Responsive height adjustment
4. **Error handling**: Graceful fallbacks and error states
5. **Production-ready**: Optimized for CDN delivery

The widget can now be embedded anywhere with a simple iframe tag!