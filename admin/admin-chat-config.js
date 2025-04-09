// Admin chat widget configuration
window.adminChatConfig = {
    webhookUrl: 'https://pro-lance.app.n8n.cloud/webhook/23795385-dda6-498e-9d37-4d1b2d47ec93/chat',
    title: 'Pro-Lance Support',
    subtitle: 'Ask us anything about our services',
    position: 'right',
    showInitialMessage: false,
    initialMessage: '',
    allowFileUpload: false,
    enableMarkdown: true,
    debug: false,
    customCSS: `
        :root {
            --chat--color-primary: #4CAF50;
            --chat--color-primary-shade-50: #43A047;
            --chat--color-primary-shade-100: #388E3C;
            --chat--color-secondary: #2196F3;
            --chat--color-secondary-shade-50: #1E88E5;
            --chat--color-secondary-shade-100: #1976D2;
            --chat--color-white: #ffffff;
            --chat--color-light: #f5f5f5;
            --chat--color-light-shade-50: #eeeeee;
            --chat--color-light-shade-100: #e0e0e0;
            --chat--color-medium: #9e9e9e;
            --chat--color-dark: #212121;
            --chat--color-disabled: #757575;
            --chat--color-typing: #424242;

            --chat--spacing: 1rem;
            --chat--border-radius: 0.5rem;
            --chat--transition-duration: 0.2s;

            --chat--window--width: 380px;
            --chat--window--height: 600px;

            --chat--header-height: auto;
            --chat--header--padding: var(--chat--spacing);
            --chat--header--background: var(--chat--color-primary);
            --chat--header--color: var(--chat--color-white);
            --chat--header--border-top: none;
            --chat--header--border-bottom: none;
            --chat--heading--font-size: 1.5em;
            --chat--subtitle--font-size: 0.9em;
            --chat--subtitle--line-height: 1.4;

            --chat--textarea--height: 50px;

            --chat--message--font-size: 0.95rem;
            --chat--message--padding: var(--chat--spacing);
            --chat--message--border-radius: var(--chat--border-radius);
            --chat--message-line-height: 1.5;
            --chat--message--bot--background: var(--chat--color-light);
            --chat--message--bot--color: var(--chat--color-dark);
            --chat--message--bot--border: none;
            --chat--message--user--background: var(--chat--color-primary);
            --chat--message--user--color: var(--chat--color-white);
            --chat--message--user--border: none;
            --chat--message--pre--background: rgba(0, 0, 0, 0.05);

            --chat--toggle--background: var(--chat--color-primary);
            --chat--toggle--hover--background: var(--chat--color-primary-shade-50);
            --chat--toggle--active--background: var(--chat--color-primary-shade-100);
            --chat--toggle--color: var(--chat--color-white);
            --chat--toggle--size: 60px;
        }

        /* Additional custom styles */
        .chat-widget {
            font-family: 'Roboto', sans-serif;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
        }

        .chat-widget__header {
            text-align: center;
            padding: 1.25rem;
        }

        .chat-widget__title {
            font-weight: 500;
            margin-bottom: 0.25rem;
        }

        .chat-widget__subtitle {
            opacity: 0.9;
            font-weight: 400;
        }

        .chat-widget__toggle {
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
            transition: transform 0.2s ease;
        }

        .chat-widget__toggle:hover {
            transform: scale(1.05);
        }

        .chat-widget__messages {
            padding: 1rem;
            background: var(--chat--color-white);
        }

        .chat-widget__input {
            border-top: 1px solid var(--chat--color-light-shade-50);
            padding: 1rem;
            background: var(--chat--color-white);
        }

        .chat-widget__textarea {
            border: 1px solid var(--chat--color-light-shade-50);
            border-radius: var(--chat--border-radius);
            padding: 0.75rem;
            resize: none;
            transition: border-color 0.2s ease;
        }

        .chat-widget__textarea:focus {
            border-color: var(--chat--color-primary);
            outline: none;
        }

        .chat-widget__send {
            background: var(--chat--color-primary);
            border-radius: var(--chat--border-radius);
            color: var(--chat--color-white);
            padding: 0.75rem 1.25rem;
            font-weight: 500;
            transition: all 0.2s ease;
        }

        .chat-widget__send:hover {
            background: var(--chat--color-primary-shade-50);
            transform: translateY(-1px);
        }

        .chat-widget__message {
            margin-bottom: 1rem;
            max-width: 85%;
        }

        .chat-widget__message--bot {
            margin-right: auto;
        }

        .chat-widget__message--user {
            margin-left: auto;
        }
    `
}; 