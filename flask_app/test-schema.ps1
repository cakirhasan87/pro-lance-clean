$headers = @{
    'Content-Type' = 'application/json'
    'apikey' = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeHN0Y21vcm9hdXBlZHN5bmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTA2NDAsImV4cCI6MjA1ODM4NjY0MH0.9AjInAaxWnYesZ_UuDOKtJVfVNO_RetqMmvZsCql11k'
    'Authorization' = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeHN0Y21vcm9hdXBlZHN5bmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTA2NDAsImV4cCI6MjA1ODM4NjY0MH0.9AjInAaxWnYesZ_UuDOKtJVfVNO_RetqMmvZsCql11k'
}

Write-Host "Checking table schemas..."

# Query for all tables in all schemas
$body = @{
    "query" = "SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema') AND table_type = 'BASE TABLE'"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://drxstcmoroaupedsynhq.supabase.co/rest/v1/rpc/executequery" -Method Post -Headers $headers -Body $body -ErrorVariable RestError -ErrorAction SilentlyContinue

    Write-Host "Query Response:"
    $response | ConvertTo-Json
} catch {
    Write-Host "Error executing schema query: $_" -ForegroundColor Red
    Write-Host "Trying alternative approach..."
    
    # Try listing all tables directly
    $tablesResponse = Invoke-RestMethod -Uri "https://drxstcmoroaupedsynhq.supabase.co/rest/v1/" -Method Get -Headers $headers
    
    Write-Host "Tables in default schema:"
    $tablesResponse | ConvertTo-Json
} 