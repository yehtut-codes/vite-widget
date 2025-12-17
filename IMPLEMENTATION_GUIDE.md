# Div+Script Embeddable Widget - Implementation Guide

## Overview

This guide explains how to create and use a JavaScript-based embeddable widget using the **div+script** approach. This is the most common and straightforward method for embedding widgets on websites.

## What is a Div+Script Widget?

A div+script widget is a self-contained JavaScript component that can be embedded on any website using just two elements:
1. A `<div>` container where the widget will be rendered
2. A `<script>` tag that loads the widget's JavaScript code

This approach is used by popular services like:
- Google Analytics
- Disqus Comments
- Facebook Comments
- Twitter Widgets
- And many more!

## How It Works

The widget works through these steps:

1. **HTML Container**: You add a `<div>` with a specific ID to your HTML
2. **Load Script**: You load the widget's JavaScript file with a `<script>` tag
3. **Initialize**: The JavaScript finds the container and renders the widget inside it
4. **Interact**: Users can interact with the widget just like any other page element

## Quick Start

### Step 1: Download the Widget Files

You need two files from the `dist/` directory:
- `my-widget.iife.js` - The main widget JavaScript (192KB, 61KB gzipped)
- `assets/my-widget.css` - The widget styles (3KB, 1.12KB gzipped)

### Step 2: Host the Files

Upload these files to your web server or CDN. For example:
```
https://your-domain.com/widgets/my-widget.iife.js
https://your-domain.com/widgets/assets/my-widget.css
```

### Step 3: Embed on Your Website

Add this HTML code wherever you want the widget to appear:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    
    <!-- Load widget CSS -->
    <link rel="stylesheet" href="https://your-domain.com/widgets/assets/my-widget.css">
</head>
<body>
    <h1>Welcome to My Website</h1>
    
    <!-- Widget container -->
    <div id="my-widget-container"></div>
    
    <!-- Load widget JavaScript -->
    <script src="https://your-domain.com/widgets/my-widget.iife.js"></script>
    
    <!-- Initialize the widget -->
    <script>
        window.initMyWidget();
    </script>
</body>
</html>
```

That's it! Your widget is now live on your website.

## Configuration Options

You can customize the widget by passing a configuration object:

```html
<script>
    window.initMyWidget({
        theme: 'dark',           // 'light', 'dark', 'default', or 'premium'
        apiKey: 'your-api-key'   // Optional API key
    });
</script>
```

### Available Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `theme` | string | `'default'` | Visual theme: 'light', 'dark', 'default', 'premium' |
| `apiKey` | string | `undefined` | Your API key for authenticated features |
| `locale` | string | `undefined` | Language/locale code (e.g., 'en-US', 'es-ES') |

## Advanced Usage

### Multiple Widgets on Same Page

Currently, the widget looks for a single container with ID `my-widget-container`. For multiple widgets, you would need to extend the implementation.

### Dynamic Initialization

Initialize the widget after page load:

```html
<script>
    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        window.initMyWidget({
            theme: 'dark'
        });
    });
</script>
```

### Conditional Loading

Load the widget only when needed:

```html
<script>
    // Load widget on button click
    document.getElementById('show-widget-btn').addEventListener('click', function() {
        // Dynamically load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://your-domain.com/widgets/assets/my-widget.css';
        document.head.appendChild(link);
        
        // Dynamically load JS
        const script = document.createElement('script');
        script.src = 'https://your-domain.com/widgets/my-widget.iife.js';
        script.onload = function() {
            window.initMyWidget();
        };
        document.body.appendChild(script);
    });
</script>
```

### Error Handling

The widget includes built-in error handling with retry logic:

```html
<script>
    window.initMyWidget(
        {
            theme: 'dark'
        },
        {
            retries: 3,
            timeout: 5000,
            onError: function(error) {
                console.error('Widget failed to load:', error);
                // Show fallback content
                document.getElementById('my-widget-container').innerHTML = 
                    '<p>Widget could not be loaded. Please refresh the page.</p>';
            },
            onSuccess: function(instance) {
                console.log('Widget loaded successfully!', instance);
            }
        }
    );
</script>
```

## Widget API

Once initialized, the widget returns an instance with these methods:

```javascript
const widget = await window.initMyWidget();

// Update configuration
widget.update({ theme: 'light' });

// Destroy the widget
widget.destroy();

// Check widget health
const health = widget.getHealth();
console.log('Widget healthy:', health.isHealthy);
```

## Integration Examples

### WordPress

Add to your theme's `footer.php` or use a custom HTML block:

```html
<div id="my-widget-container"></div>
<script src="https://your-domain.com/widgets/my-widget.iife.js"></script>
<script>
    window.initMyWidget({ theme: 'light' });
</script>
```

### React

```jsx
import { useEffect, useRef } from 'react';

function MyPage() {
    const widgetRef = useRef(null);

    useEffect(() => {
        // Load widget script
        const script = document.createElement('script');
        script.src = 'https://your-domain.com/widgets/my-widget.iife.js';
        script.async = true;
        script.onload = () => {
            if (window.initMyWidget) {
                window.initMyWidget({ theme: 'dark' });
            }
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <div>
            <h1>My React App</h1>
            <div id="my-widget-container" ref={widgetRef}></div>
        </div>
    );
}
```

### Vue

```vue
<template>
    <div>
        <h1>My Vue App</h1>
        <div id="my-widget-container"></div>
    </div>
</template>

<script>
export default {
    mounted() {
        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://your-domain.com/widgets/assets/my-widget.css';
        document.head.appendChild(link);

        // Load JS
        const script = document.createElement('script');
        script.src = 'https://your-domain.com/widgets/my-widget.iife.js';
        script.onload = () => {
            window.initMyWidget({ theme: 'dark' });
        };
        document.body.appendChild(script);
    }
}
</script>
```

### Angular

```typescript
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
    selector: 'app-widget',
    template: '<div id="my-widget-container"></div>'
})
export class WidgetComponent implements OnInit, OnDestroy {
    private widgetInstance: any;

    ngOnInit() {
        this.loadWidget();
    }

    loadWidget() {
        const script = document.createElement('script');
        script.src = 'https://your-domain.com/widgets/my-widget.iife.js';
        script.onload = () => {
            this.widgetInstance = (window as any).initMyWidget({
                theme: 'dark'
            });
        };
        document.body.appendChild(script);
    }

    ngOnDestroy() {
        if (this.widgetInstance) {
            this.widgetInstance.destroy();
        }
    }
}
```

## Troubleshooting

### Widget Doesn't Appear

**Problem**: The container exists but nothing renders.

**Solutions**:
1. Check browser console for errors
2. Verify the script URL is correct and accessible
3. Ensure CSS file is loaded
4. Check that container ID is exactly `my-widget-container`
5. Make sure scripts load after the container element

### CSS Not Applied

**Problem**: Widget appears but looks unstyled.

**Solutions**:
1. Verify CSS file path is correct
2. Check for CSS conflicts with your site's styles
3. Ensure CSS file loads before or with the widget JS
4. Check browser DevTools Network tab for 404 errors

### JavaScript Errors

**Problem**: Console shows JavaScript errors.

**Solutions**:
1. Make sure you're using a modern browser
2. Check for conflicts with other scripts
3. Ensure the widget script loads completely
4. Try clearing browser cache

### Multiple Widgets Not Working

**Problem**: Only one widget appears when you need multiple.

**Solution**: The current implementation supports only one widget per page. You would need to modify `main-widget.tsx` to accept a container ID parameter.

## Performance Considerations

### File Size
- JavaScript: ~192KB (61KB gzipped)
- CSS: ~3KB (1.12KB gzipped)

### Loading Strategies

**1. Async Loading** (Recommended for below-the-fold widgets):
```html
<script async src="https://your-domain.com/widgets/my-widget.iife.js"></script>
```

**2. Defer Loading** (Load after HTML parsing):
```html
<script defer src="https://your-domain.com/widgets/my-widget.iife.js"></script>
```

**3. Lazy Loading** (Load only when visible):
```javascript
// Use Intersection Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            loadWidget();
            observer.disconnect();
        }
    });
});

observer.observe(document.getElementById('my-widget-container'));
```

### CDN Hosting

For best performance, host your widget files on a CDN:
- Cloudflare
- AWS CloudFront
- Google Cloud CDN
- Netlify
- Vercel

## Security Best Practices

1. **HTTPS Only**: Always serve widget files over HTTPS
2. **API Keys**: Never expose sensitive API keys in client-side code
3. **CSP Headers**: Add appropriate Content-Security-Policy headers
4. **Subresource Integrity**: Use SRI hashes for additional security

```html
<script 
    src="https://your-domain.com/widgets/my-widget.iife.js" 
    integrity="sha384-..." 
    crossorigin="anonymous">
</script>
```

## Browser Support

The widget supports all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## What's Inside the Widget?

This example widget includes:
- 🎯 Interactive counter functionality
- 🔢 Increment, decrement, and reset buttons
- 🎨 Multiple theme support
- 📊 Real-time status display
- ⚡ React 19 with React DOM
- 🎨 CSS Modules for scoped styling
- 🛡️ Error boundary for graceful error handling

## Building from Source

If you want to modify the widget:

```bash
# Install dependencies
npm install

# Build the widget
npm run build:widget

# Files will be in dist/
# - dist/my-widget.iife.js
# - dist/assets/my-widget.css
```

## Support and Documentation

For more examples and documentation:
- Check `minimal-example.html` for a minimal working example
- Check `div-script-demo.html` for a comprehensive demo
- See `EMBEDDING_GUIDE.md` for IIFE-based embedding
- See `embed-example.html` for iframe-based embedding

## Summary

The div+script approach is:
- ✅ Simple to implement
- ✅ Works on any website
- ✅ No server configuration needed
- ✅ Easy to customize
- ✅ Widely used and trusted
- ❌ Requires hosting widget files
- ❌ File size can impact page load

For a lighter alternative, consider the iframe approach (see `embed-example.html`).
