// Accessibility Testing Script for WCAG 2.1 Compliance
(function() {
    'use strict';
    
    console.log('🔍 Pro-Lance Accessibility Test Starting...');
    
    // Test results storage
    const testResults = {
        passed: 0,
        failed: 0,
        warnings: 0,
        issues: []
    };
    
    // Helper function to add test result
    function addResult(type, message, element = null) {
        testResults.issues.push({
            type: type,
            message: message,
            element: element
        });
        
        if (type === 'PASS') testResults.passed++;
        else if (type === 'FAIL') testResults.failed++;
        else if (type === 'WARNING') testResults.warnings++;
    }
    
    // Test 1: Check for skip links
    function testSkipLinks() {
        const skipLinks = document.querySelectorAll('.skip-link, [href^="#main"]');
        if (skipLinks.length > 0) {
            addResult('PASS', 'Skip to main content link found');
        } else {
            addResult('FAIL', 'No skip to main content link found');
        }
    }
    
    // Test 2: Check image alt text
    function testImageAltText() {
        const images = document.querySelectorAll('img');
        let hasAlt = 0;
        let missingAlt = 0;
        let emptyAlt = 0;
        
        images.forEach(img => {
            if (img.hasAttribute('alt')) {
                if (img.alt.trim() === '') {
                    emptyAlt++;
                    addResult('WARNING', 'Image has empty alt attribute', img);
                } else {
                    hasAlt++;
                }
            } else {
                missingAlt++;
                addResult('FAIL', 'Image missing alt attribute', img);
            }
        });
        
        addResult('PASS', `${hasAlt} images have proper alt text`);
        if (missingAlt > 0) {
            addResult('FAIL', `${missingAlt} images missing alt text`);
        }
        if (emptyAlt > 0) {
            addResult('WARNING', `${emptyAlt} images have empty alt text`);
        }
    }
    
    // Test 3: Check form labels
    function testFormLabels() {
        const inputs = document.querySelectorAll('input, textarea, select');
        let hasLabel = 0;
        let missingLabel = 0;
        
        inputs.forEach(input => {
            const id = input.getAttribute('id');
            const label = document.querySelector(`label[for="${id}"]`);
            const ariaLabel = input.getAttribute('aria-label');
            const ariaLabelledby = input.getAttribute('aria-labelledby');
            
            if (label || ariaLabel || ariaLabelledby) {
                hasLabel++;
            } else {
                missingLabel++;
                addResult('FAIL', 'Form input missing label', input);
            }
        });
        
        addResult('PASS', `${hasLabel} form inputs have proper labels`);
        if (missingLabel > 0) {
            addResult('FAIL', `${missingLabel} form inputs missing labels`);
        }
    }
    
    // Test 4: Check heading structure
    function testHeadingStructure() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let h1Count = 0;
        let previousLevel = 0;
        let structureIssues = 0;
        
        headings.forEach(heading => {
            const level = parseInt(heading.tagName.charAt(1));
            
            if (level === 1) h1Count++;
            
            if (level - previousLevel > 1) {
                structureIssues++;
                addResult('WARNING', 'Heading level skipped', heading);
            }
            
            previousLevel = level;
        });
        
        if (h1Count === 1) {
            addResult('PASS', 'Single H1 heading found');
        } else if (h1Count === 0) {
            addResult('FAIL', 'No H1 heading found');
        } else {
            addResult('WARNING', `${h1Count} H1 headings found (should be 1)`);
        }
        
        if (structureIssues === 0) {
            addResult('PASS', 'Proper heading structure');
        }
    }
    
    // Test 5: Check color contrast (basic test)
    function testColorContrast() {
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div');
        let contrastIssues = 0;
        
        // This is a basic test - in production, use a proper contrast checker
        textElements.forEach(element => {
            const style = window.getComputedStyle(element);
            const color = style.color;
            const backgroundColor = style.backgroundColor;
            
            // Check for common low contrast combinations
            if (color.includes('rgb(128, 128, 128)') && backgroundColor.includes('rgb(255, 255, 255)')) {
                contrastIssues++;
                addResult('WARNING', 'Potential low contrast text', element);
            }
        });
        
        if (contrastIssues === 0) {
            addResult('PASS', 'No obvious contrast issues found');
        }
    }
    
    // Test 6: Check keyboard navigation
    function testKeyboardNavigation() {
        const interactiveElements = document.querySelectorAll('a, button, input, textarea, select');
        let focusableElements = 0;
        let nonFocusableElements = 0;
        
        interactiveElements.forEach(element => {
            if (element.tabIndex >= 0 || element.tagName === 'A' || element.tagName === 'BUTTON' || 
                element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                focusableElements++;
            } else {
                nonFocusableElements++;
                addResult('WARNING', 'Interactive element may not be keyboard accessible', element);
            }
        });
        
        addResult('PASS', `${focusableElements} elements are keyboard accessible`);
        if (nonFocusableElements > 0) {
            addResult('WARNING', `${nonFocusableElements} elements may have keyboard accessibility issues`);
        }
    }
    
    // Test 7: Check ARIA attributes
    function testARIAAttributes() {
        const ariaElements = document.querySelectorAll('[aria-label], [aria-labelledby], [aria-describedby], [role]');
        let validAria = 0;
        let invalidAria = 0;
        
        ariaElements.forEach(element => {
            const role = element.getAttribute('role');
            const ariaLabel = element.getAttribute('aria-label');
            const ariaLabelledby = element.getAttribute('aria-labelledby');
            
            if (role && !['banner', 'navigation', 'main', 'complementary', 'contentinfo', 'button', 'link', 'group'].includes(role)) {
                invalidAria++;
                addResult('WARNING', 'Potentially invalid ARIA role', element);
            } else {
                validAria++;
            }
            
            if (ariaLabelledby && !document.getElementById(ariaLabelledby)) {
                invalidAria++;
                addResult('FAIL', 'ARIA labelledby references non-existent element', element);
            }
        });
        
        addResult('PASS', `${validAria} valid ARIA attributes found`);
        if (invalidAria > 0) {
            addResult('WARNING', `${invalidAria} potential ARIA issues found`);
        }
    }
    
    // Test 8: Check for semantic HTML
    function testSemanticHTML() {
        const semanticElements = document.querySelectorAll('main, nav, header, footer, section, article, aside');
        const nonSemanticElements = document.querySelectorAll('div, span');
        
        if (semanticElements.length > 0) {
            addResult('PASS', `${semanticElements.length} semantic HTML elements found`);
        } else {
            addResult('WARNING', 'No semantic HTML elements found');
        }
        
        // Check for excessive use of div/span
        if (nonSemanticElements.length > 50) {
            addResult('WARNING', 'High number of non-semantic elements - consider using semantic HTML');
        }
    }
    
    // Test 9: Check for language attributes
    function testLanguageAttributes() {
        const html = document.documentElement;
        const lang = html.getAttribute('lang');
        
        if (lang) {
            addResult('PASS', `Language attribute set to: ${lang}`);
        } else {
            addResult('FAIL', 'No language attribute found on HTML element');
        }
    }
    
    // Test 10: Check for title tags
    function testTitleTags() {
        const title = document.querySelector('title');
        if (title && title.textContent.trim().length > 0) {
            addResult('PASS', 'Page has a title');
        } else {
            addResult('FAIL', 'Page missing title or title is empty');
        }
    }
    
    // Run all tests
    function runAllTests() {
        console.log('🧪 Running accessibility tests...');
        
        testSkipLinks();
        testImageAltText();
        testFormLabels();
        testHeadingStructure();
        testColorContrast();
        testKeyboardNavigation();
        testARIAAttributes();
        testSemanticHTML();
        testLanguageAttributes();
        testTitleTags();
        
        // Display results
        displayResults();
    }
    
    // Display test results
    function displayResults() {
        console.log('\n📊 ACCESSIBILITY TEST RESULTS');
        console.log('==============================');
        console.log(`✅ Passed: ${testResults.passed}`);
        console.log(`❌ Failed: ${testResults.failed}`);
        console.log(`⚠️  Warnings: ${testResults.warnings}`);
        console.log('\n📋 DETAILED RESULTS:');
        
        testResults.issues.forEach(issue => {
            const icon = issue.type === 'PASS' ? '✅' : issue.type === 'FAIL' ? '❌' : '⚠️';
            console.log(`${icon} ${issue.type}: ${issue.message}`);
            if (issue.element) {
                console.log(`   Element: ${issue.element.tagName}${issue.element.className ? '.' + issue.element.className : ''}`);
            }
        });
        
        // Overall assessment
        const totalTests = testResults.passed + testResults.failed + testResults.warnings;
        const passRate = ((testResults.passed / totalTests) * 100).toFixed(1);
        
        console.log('\n🎯 OVERALL ASSESSMENT:');
        console.log(`Pass Rate: ${passRate}%`);
        
        if (passRate >= 90) {
            console.log('🌟 Excellent accessibility compliance!');
        } else if (passRate >= 80) {
            console.log('👍 Good accessibility compliance with room for improvement');
        } else if (passRate >= 70) {
            console.log('⚠️  Moderate accessibility issues need attention');
        } else {
            console.log('🚨 Significant accessibility issues require immediate attention');
        }
        
        console.log('\n💡 RECOMMENDATIONS:');
        if (testResults.failed > 0) {
            console.log('- Fix all FAILED issues first');
        }
        if (testResults.warnings > 0) {
            console.log('- Review WARNING issues for potential improvements');
        }
        console.log('- Test with screen readers (NVDA, VoiceOver, JAWS)');
        console.log('- Test keyboard-only navigation');
        console.log('- Use automated tools like axe-core or Lighthouse');
    }
    
    // Run tests when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runAllTests);
    } else {
        runAllTests();
    }
    
    // Make test function globally available
    window.runAccessibilityTests = runAllTests;
    
})();
