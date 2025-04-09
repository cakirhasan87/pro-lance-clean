# Supabase Setup for Pro-Lance Contact Form

This guide will help you set up Supabase to work with the Pro-Lance website's contact form.

## Step 1: Create a Supabase Account and Project

1. Go to [Supabase](https://supabase.com/) and sign up for an account if you don't have one.
2. Once logged in, create a new project.
3. Choose a name for your project (e.g., "pro-lance").
4. Set a secure database password (make sure to save it).
5. Choose a region closest to your target audience.
6. Click "Create new project" and wait for the project to be created.

## Step 2: Set Up the Database Table

1. In your Supabase dashboard, navigate to the "SQL Editor" section.
2. Create a new query, then paste the contents of the `supabase-setup.sql` file.
3. Run the query to create the `contact_messages` table and set up the necessary policies.

## Step 3: Get Your API Keys

1. In your Supabase dashboard, go to the "Settings" section (the gear icon) in the sidebar.
2. Click on "API" in the submenu.
3. Here you'll find your "Project URL" and "anon/public" key.
4. Copy these values, you'll need them in the next step.

## Step 4: Update the Supabase Client Configuration

1. Open the file `js/supabase-client.js`.
2. Replace the placeholder values with your actual Supabase URL and anon key:

```js
const supabaseUrl = 'https://drxstcmoroaupedsynhq.supabase.co' // Replace with your Project URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeHN0Y21vcm9hdXBlZHN5bmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTA2NDAsImV4cCI6MjA1ODM4NjY0MH0.9AjInAaxWnYesZ_UuDOKtJVfVNO_RetqMmvZsCql11k' // Replace with your anon/public key
```

## Step 5: Test the Contact Form

1. After completing the setup, test the contact form on both your Turkish and English pages.
2. Fill out the form and submit it.
3. Check your Supabase database to confirm that the messages are being stored correctly.

## Viewing Submitted Messages

To view the submitted messages:

1. Go to your Supabase dashboard.
2. Navigate to the "Table Editor" section.
3. Select the `contact_messages` table.
4. Here you can see all the submitted messages, sorted by date.

## Troubleshooting

If the form submission isn't working:

1. Open your browser's developer console (F12) to check for any JavaScript errors.
2. Verify that your Supabase URL and API key are correct.
3. Check the RLS (Row Level Security) policies in Supabase to ensure they're set up correctly.
4. Verify that the Supabase project is active and the database is online.

## Security Considerations

- The current setup allows anonymous users to submit contact forms.
- Only authenticated users can view or modify the submitted messages.
- Consider adding additional security measures like reCAPTCHA to prevent spam submissions. 