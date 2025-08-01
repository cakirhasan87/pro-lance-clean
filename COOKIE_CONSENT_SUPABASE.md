# Cookie Consent Supabase Integration

This document explains how the cookie consent system is integrated with Supabase to store cookie consent data.

## Overview

The cookie consent system now automatically saves all cookie consent decisions to Supabase, providing a comprehensive audit trail of user consent across all pages of the Pro-Lance website.

## Database Schema

The cookie consent data is stored in the `cookie_consent_logs` table with the following structure:

```sql
CREATE TABLE cookie_consent_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR, -- Anonymous user identifier
    session_id VARCHAR, -- Session identifier
    consent_status VARCHAR NOT NULL, -- 'accepted' or 'rejected'
    page_url VARCHAR NOT NULL, -- URL where consent was given
    user_agent TEXT, -- Browser user agent
    ip_address VARCHAR, -- IP address (if available)
    language VARCHAR, -- User's language preference
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

## Features

### 1. Anonymous User Tracking
- Each user gets a unique anonymous ID stored in localStorage
- Session IDs are generated for each browser session
- No personally identifiable information is collected

### 2. Comprehensive Data Collection
- **Consent Status**: Whether the user accepted or rejected cookies
- **Page URL**: The specific page where consent was given
- **User Agent**: Browser and device information
- **Language**: User's preferred language
- **Timestamp**: When the consent decision was made

### 3. Multi-language Support
- Turkish and English versions both save data to the same table
- Language preference is automatically detected and stored

### 4. Error Handling
- Failed database operations are logged to console
- Cookie functionality continues to work even if Supabase is unavailable

## Setup Instructions

### 1. Create the Database Table

Run the SQL script in your Supabase SQL Editor:

```sql
-- Execute the contents of cookie-consent-setup.sql
```

### 2. Verify Configuration

The Supabase client is configured in `js/supabase-client.js` with:
- Project URL: `https://drxstcmoroaupedsynhq.supabase.co`
- Anonymous key: (configured in the file)

### 3. Test the Integration

1. Open any page on the website
2. Accept or reject cookies
3. Check the browser console for success/error messages
4. Verify data appears in the Supabase dashboard

## Data Privacy

- **No PII**: No personally identifiable information is collected
- **Anonymous IDs**: User IDs are randomly generated and stored locally
- **Session-based**: Session IDs change with each browser session
- **GDPR Compliant**: Only stores necessary consent data

## Monitoring and Analytics

You can query the `cookie_consent_logs` table to:

- Track consent rates across different pages
- Monitor user language preferences
- Analyze browser/device usage patterns
- Generate compliance reports

### Example Queries

```sql
-- Get consent rate by status
SELECT consent_status, COUNT(*) as count
FROM cookie_consent_logs
GROUP BY consent_status;

-- Get consent rate by language
SELECT language, consent_status, COUNT(*) as count
FROM cookie_consent_logs
GROUP BY language, consent_status;

-- Get recent consent decisions
SELECT * FROM cookie_consent_logs
ORDER BY created_at DESC
LIMIT 10;
```

## Troubleshooting

### Common Issues

1. **Module Import Errors**: Ensure all HTML files use `type="module"` for cookie consent scripts
2. **CORS Errors**: Verify Supabase URL and API key are correct
3. **Database Errors**: Check that the `cookie_consent_logs` table exists and has proper RLS policies

### Debug Mode

Enable debug logging by checking the browser console for:
- "Cookie consent saved to Supabase successfully"
- "Error saving cookie consent to Supabase: [error details]"

## Files Modified

- `cookie-consent.js` - Turkish version with Supabase integration
- `en/cookie-consent.js` - English version with Supabase integration
- `js/supabase-client.js` - Supabase client configuration
- `cookie-consent-setup.sql` - Database schema setup
- All HTML files - Updated to use ES6 modules

## Security Considerations

- Row Level Security (RLS) is enabled on the table
- Only anonymous users can insert data
- Only authenticated users can view data
- API key is public (anon key) and safe for client-side use 