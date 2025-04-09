// Direct API test without Supabase client
document.addEventListener('DOMContentLoaded', function() {
    console.log("Direct API test script loaded");
    
    const testButton = document.createElement('button');
    testButton.textContent = 'Test Direct API Call';
    testButton.style.position = 'fixed';
    testButton.style.bottom = '20px';
    testButton.style.right = '20px';
    testButton.style.zIndex = '9999';
    testButton.style.padding = '10px';
    testButton.style.backgroundColor = '#4CAF50';
    testButton.style.color = 'white';
    testButton.style.border = 'none';
    testButton.style.borderRadius = '4px';
    testButton.style.cursor = 'pointer';
    
    document.body.appendChild(testButton);
    
    testButton.addEventListener('click', async function() {
        console.log("Test button clicked");
        
        const testData = {
            name: 'API Test User',
            email: 'api-test@example.com',
            phone: '9876543210',
            subject: 'Direct API Test',
            message: 'Testing direct API call without Supabase client',
            created_at: new Date().toISOString(),
            status: 'unread'
        };
        
        console.log('Making direct API call with data:', testData);
        
        try {
            const response = await fetch('https://drxstcmoroaupedsynhq.supabase.co/rest/v1/contact_messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeHN0Y21vcm9hdXBlZHN5bmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTA2NDAsImV4cCI6MjA1ODM4NjY0MH0.9AjInAaxWnYesZ_UuDOKtJVfVNO_RetqMmvZsCql11k',
                    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyeHN0Y21vcm9hdXBlZHN5bmhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4MTA2NDAsImV4cCI6MjA1ODM4NjY0MH0.9AjInAaxWnYesZ_UuDOKtJVfVNO_RetqMmvZsCql11k',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(testData)
            });
            
            console.log('API Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error:', errorText);
                alert(`API Error: ${response.status} - ${errorText}`);
            } else {
                console.log('API Success!');
                alert('Direct API call successful! Check Supabase.');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert(`Fetch error: ${error.message}`);
        }
    });
}); 