$headers = @{
    'Content-Type' = 'application/json'
    'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeHN0Y21vcm9hdXBlZHN5bmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTA2NDAsImV4cCI6MjA1ODM4NjY0MH0.9AjInAaxWnYesZ_UuDOKtJVfVNO_RetqMmvZsCql11k'
    'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeHN0Y21vcm9hdXBlZHN5bmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTA2NDAsImV4cCI6MjA1ODM4NjY0MH0.9AjInAaxWnYesZ_UuDOKtJVfVNO_RetqMmvZsCql11k'
    'Prefer' = 'return=minimal'
}

$body = @{
    name = "Test User"
    email = "test@example.com"
    phone = "1234567890"
    subject = "Test Subject"
    message = "Test Message"
    created_at = (Get-Date).ToString("o")
    status = "unread"
} | ConvertTo-Json

Write-Host "Sending test data to Supabase..."
Write-Host "Body: $body"

$response = Invoke-RestMethod -Uri "https://drxstcmoroaupedsynhq.supabase.co/rest/v1/contact_messages" -Method Post -Headers $headers -Body $body -ErrorVariable RestError -ErrorAction SilentlyContinue

if ($RestError) {
    Write-Host "Error: $RestError" -ForegroundColor Red
} else {
    Write-Host "Success! Data sent to Supabase." -ForegroundColor Green
} 