# Setting Up Email Notifications for Contact Form

This guide explains how to properly set up email notifications for the contact form submissions.

## Prerequisites

You need:
1. An email account to send notifications from (Gmail recommended)
2. App password for the email account (for Gmail)

## Setting Up App Password (for Gmail)

If you're using Gmail, you'll need to set up an App Password:

1. Go to your Google Account settings: https://myaccount.google.com/
2. Select "Security" from the left menu
3. Under "Signing in to Google," select "2-Step Verification" (enable it if not already enabled)
4. At the bottom of the page, select "App passwords"
5. Generate a new app password for "Mail" and "Other (Custom name)" - name it "Pro-Lance Contact Form"
6. Copy the 16-character password that is generated

## Configuring Email Settings

Update your `.env` file with the following email settings:

```
# Email configuration
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USE_SSL=False
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-16-character-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com
```

Replace:
- `your-email@gmail.com` with your actual Gmail address
- `your-16-character-app-password` with the app password you generated

## Notification Recipients

The notification emails will be sent to:
- hasancakir@smartiasolutions.com
- incicakir@smartiasolutions.com

You can modify these recipients in the `config.py` file under the `NOTIFICATION_EMAILS` list.

## Testing Email Notifications

To test if email notifications are working:

1. Set up your `.env` file with proper email credentials
2. Restart the Flask application: `python app.py`
3. Fill out and submit the contact form
4. Check if the notification email is sent to the specified recipients
5. Check the console/terminal log for any error messages related to sending emails

## Troubleshooting

If emails are not being sent:

1. Check if the submission was saved to the database (a prerequisite for sending emails)
2. Verify your email credentials in the `.env` file
3. Make sure your Gmail account allows "Less secure app access" or that you're using an App Password
4. Check if there are any firewall restrictions blocking SMTP traffic on port 587
5. Look for error messages in the console/terminal log 