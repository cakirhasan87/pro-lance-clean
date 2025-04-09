const fs = require('fs');
const path = require('path');

// Function to recursively find all HTML files
function findHtmlFiles(dir) {
    let results = [];
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            results = results.concat(findHtmlFiles(filePath));
        } else if (file.endsWith('.html')) {
            results.push(filePath);
        }
    }
    
    return results;
}

// Function to add chat widget to HTML file
function addChatWidget(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if chat widget is already added
    if (content.includes('@n8n/chat')) {
        console.log(`Chat widget already exists in ${filePath}`);
        return;
    }
    
    // Read chat template
    const chatTemplate = fs.readFileSync(path.join(__dirname, 'chat-template.html'), 'utf8');
    
    // Insert chat widget before </head>
    content = content.replace('</head>', `${chatTemplate}\n</head>`);
    
    // Write back to file
    fs.writeFileSync(filePath, content);
    console.log(`Added chat widget to ${filePath}`);
}

// Main function
function main() {
    const rootDir = path.join(__dirname, '..');
    const htmlFiles = findHtmlFiles(rootDir);
    
    console.log(`Found ${htmlFiles.length} HTML files`);
    
    for (const file of htmlFiles) {
        addChatWidget(file);
    }
    
    console.log('Finished adding chat widget to all HTML files');
}

main(); 