# n8n Chat Widget Integration for Pro-Lance

This document provides instructions for setting up and customizing the n8n Chat widget on the Pro-Lance website.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Embedding Options](#embedding-options)
5. [Customization](#customization)
6. [Troubleshooting](#troubleshooting)

## Prerequisites

- Access to an n8n instance with the Chat function enabled
- The ability to modify the Pro-Lance website files
- Basic knowledge of HTML, CSS, and JavaScript

## Installation

The n8n Chat widget has already been integrated into the Pro-Lance website. The implementation consists of the following files:

- `js/chat.js` - The main chat widget script
- `js/chat.min.js` - Minified version for production use
- `js/chat-config.js` - Configuration file
- CSS styles in `style.css`

## Configuration

To configure the chat widget, edit the `js/chat-config.js` file. The most important settings are:

```javascript
// Replace this URL with your actual n8n Chat API endpoint
chatUrl: 'https://pro-lance.app.n8n.cloud/webhook/23795385-dda6-498e-9d37-4d1b2d47ec93/chat'
```

You must update the `chatUrl` to point to your actual n8n instance's chat endpoint.

Other configuration options include:

- `title` - The title shown in the chat header
- `subtitle` - The subtitle shown in the chat header
- `primaryColor` - The primary color used for the chat widget (currently set to Pro-Lance green: #4CAF50)
- `position` - Position of the floating button ('left' or 'right')
- `initialMessage` - The first message shown when chat is opened
- `allowFileUpload` - Whether to allow file uploads in the chat
- `enableMarkdown` - Whether to enable Markdown formatting in messages

## Embedding Options

The n8n Chat widget can be used in two ways:

1. **Floating Button** (default) - A chat button appears in the corner of the page
2. **Embedded** - The chat is embedded directly in a specific container on the page

### Floating Button

This is the default behavior. The chat widget appears as a button in the corner of the page, which expands when clicked. This is configured in `js/chat-config.js` by setting:

```javascript
containerSelector: null
```

### Embedded Chat

The contact page includes an embedded chat widget. This is implemented by:

1. Creating a container with an ID:
   ```html
   <div id="embedded-chat" class="embedded-chat-container"></div>
   ```

2. In the config, setting:
   ```javascript
   containerSelector: '#embedded-chat'
   ```

## Customization

### Styling

The chat widget styling can be customized in `style.css`. Look for the section labeled "n8n Chat Widget Styles".

### Behavior

To customize behavior beyond the config options, you can modify the `initializeChatWidget` function in `js/chat.js`.

## Troubleshooting

If the chat widget doesn't appear:

1. Check the browser console for errors
2. Verify that the `chatUrl` in `js/chat-config.js` is correct
3. Ensure all scripts are properly loaded (check Network tab in browser dev tools)
4. Confirm that your n8n instance is running and accessible

For further assistance, please contact your n8n administrator or Pro-Lance website developer. 