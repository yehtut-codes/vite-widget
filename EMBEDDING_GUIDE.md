# Widget Embedding Guide

This guide explains how to embed the MyWidget component on your website. The widget is a self-contained React component that can be easily integrated into any HTML page.

## Table of Contents

- [Quick Start](#quick-start)
- [Basic Embed](#basic-embed)
- [Advanced Configuration](#advanced-configuration)
- [Using HTML Data Attributes](#using-html-data-attributes)
- [Multiple Widget Instances](#multiple-widget-instances)
- [Troubleshooting](#troubleshooting)
- [API Reference](#api-reference)

## Quick Start

To embed the widget on your website, you need two files:
- `my-widget.iife.js` - The JavaScript bundle
- `my-widget.css` - The stylesheet

Download these files from the `dist/` folder and upload them to your web server.

## Basic Embed

### Step 1: Include the CSS and JavaScript files

Add these tags to your HTML `<head>` section:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website</title>
    
    <!-- Widget CSS -->
    <link rel="stylesheet" href="path/to/my-widget.css">
</head>
<body>
    <!-- Your website content -->
    
    <!-- Widget JavaScript -->
    <script src="path/to/my-widget.iife.js"></script>
</body>
</html>
```

### Step 2: Add the widget container

Create a `<div>` element with the ID `my-widget-container` where you want the widget to appear:

```html
<div id="my-widget-container"></div>
```

### Step 3: Initialize the widget

Add a script tag after the widget JavaScript to initialize the widget:

```html
<script>
    // Initialize the widget with default settings
    window.initMyWidget();
</script>
```

### Complete Basic Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Website with Widget</title>
    <link rel="stylesheet" href="assets/my-widget.css">
</head>
<body>
    <h1>Welcome to My Website</h1>
    
    <!-- Widget will appear here -->
    <div id="my-widget-container"></div>
    
    <script src="assets/my-widget.iife.js"></script>
    <script>
        window.initMyWidget();
    </script>
</body>
</html>
```

## Advanced Configuration

You can pass configuration options to customize the widget's appearance and behavior:

```html
<script>
    window.initMyWidget({
        theme: 'dark',
        apiKey: 'your-api-key-here'
    });
</script>
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `theme` | `string` | `'default'` | The visual theme of the widget |
| `apiKey` | `string` | `undefined` | API key for authenticated features |

### Theme Examples

```html
<!-- Dark theme -->
<script>
    window.initMyWidget({ theme: 'dark' });
</script>

<!-- Light theme -->
<script>
    window.initMyWidget({ theme: 'light' });
</script>

<!-- Custom theme with API key -->
<script>
    window.initMyWidget({ 
        theme: 'premium',
        apiKey: 'sk-1234567890abcdef'
    });
</script>
```

## Using HTML Data Attributes

For a more declarative approach, you can use HTML data attributes to configure the widget. This method is useful when you want to avoid writing JavaScript.

### Step 1: Add data attributes to the container

```html
<div id="my-widget-container" 
     data-theme="dark" 
     data-api-key="your-api-key">
</div>
```

### Step 2: Create an initialization script

Add this script to automatically read data attributes:

```html
<script>
    // Auto-initialize widget from data attributes
    function initWidgetFromData() {
        const container = document.getElementById('my-widget-container');
        if (container) {
            const config = {
                theme: container.dataset.theme,
                apiKey: container.dataset.apiKey
            };
            
            // Remove undefined values
            Object.keys(config).forEach(key => 
                config[key] === undefined && delete config[key]
            );
            
            window.initMyWidget(config);
        }
    }
    
    // Initialize when the page loads
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWidgetFromData);
    } else {
        initWidgetFromData();
    }
</script>
```

### Complete Data Attributes Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Widget with Data Attributes</title>
    <link rel="stylesheet" href="assets/my-widget.css">
</head>
<body>
    <h1>My Website</h1>
    
    <!-- Widget with configuration via data attributes -->
    <div id="my-widget-container" 
         data-theme="dark" 
         data-api-key="sk-1234567890abcdef">
    </div>
    
    <script src="assets/my-widget.iife.js"></script>
    <script>
        function initWidgetFromData() {
            const container = document.getElementById('my-widget-container');
            if (container) {
                const config = {
                    theme: container.dataset.theme,
                    apiKey: container.dataset.apiKey
                };
                
                Object.keys(config).forEach(key => 
                    config[key] === undefined && delete config[key]
                );
                
                window.initMyWidget(config);
            }
        }
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initWidgetFromData);
        } else {
            initWidgetFromData();
        }
    </script>
</body>
</html>
```

## Multiple Widget Instances

You can embed multiple widget instances on the same page by creating multiple containers and initializing them separately:

```html
<!-- First widget -->
<div id="my-widget-container"></div>

<!-- Second widget with different config -->
<div id="my-second-widget"></div>

<script>
    // Initialize first widget
    window.initMyWidget({ theme: 'light' });
    
    // Initialize second widget in a different container
    // Note: You'll need to modify the initMyWidget function to accept a container ID
    // or create the widget manually using the exposed components
</script>
```

## Troubleshooting

### Widget doesn't appear

1. **Check file paths**: Ensure the CSS and JS files are correctly linked
2. **Check container ID**: The container must have `id="my-widget-container"`
3. **Check browser console**: Look for JavaScript errors
4. **Check network tab**: Ensure files are loading successfully

### Styling issues

1. **CSS conflicts**: The widget uses CSS Modules to avoid conflicts, but global styles might still interfere
2. **Missing CSS**: Ensure the `my-widget.css` file is loaded
3. **Z-index issues**: The widget might be behind other elements

### JavaScript errors

1. **initMyWidget is not defined**: Ensure the JS file is loaded before calling the function
2. **Container not found**: Ensure the container element exists when the script runs
3. **Timing issues**: Use `DOMContentLoaded` event or place scripts at the end of the body

## API Reference

### Global Functions

#### `window.initMyWidget(config?)`

Initializes the widget in the element with ID `my-widget-container`.

**Parameters:**
- `config` (optional): Configuration object

**Returns:**
- React Root instance or `null` if container not found

**Example:**
```javascript
const widgetRoot = window.initMyWidget({
    theme: 'dark',
    apiKey: 'your-api-key'
});
```

### Configuration Object

```typescript
interface WidgetConfig {
    theme?: string;     // Widget theme
    apiKey?: string;    // API key for authenticated features
}
```

### Supported Data Attributes

| Attribute | Maps to | Example |
|-----------|---------|---------|
| `data-theme` | `config.theme` | `data-theme="dark"` |
| `data-api-key` | `config.apiKey` | `data-api-key="sk-123"` |

## Browser Support

The widget supports all modern browsers:
- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

For older browser support, you may need to include polyfills for:
- ES6 features
- React 18 features
- CSS Grid (if used in your layout)

## Security Considerations

1. **API Keys**: Never expose sensitive API keys in client-side code
2. **HTTPS**: Always serve the widget files over HTTPS in production
3. **CSP**: Ensure your Content Security Policy allows the widget scripts
4. **File Integrity**: Consider using SRI (Subresource Integrity) hashes for the widget files

## Performance Tips

1. **Lazy Loading**: Load the widget files only when needed
2. **CDN**: Host widget files on a CDN for better performance
3. **Preload**: Use `<link rel="preload">` for critical widget resources
4. **Async Loading**: Load the widget asynchronously if it's not above the fold

---

For additional support or questions, please refer to the project documentation or create an issue in the repository.