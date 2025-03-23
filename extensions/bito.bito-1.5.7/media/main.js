(function() {
    let editor;
    let diffNavigator;
    let currentDiffRange = null;
    const controls = document.getElementById('controls');
    let originalUserContent;
    let isUndoOperation = false;
    let isMonacoLoaded = false;
    let pendingInitMessage = null;
    let lastKnownPosition = null;

     // Function to update the contents of the diff editor
     function updateContent(leftContent, rightContent, leftUri) {
         // Dispose of any existing models before creating new ones
         if (editor.getModel()) {
            const models = editor.getModel();
            if (models.original) {
                models.original.dispose();
            }
            if (models.modified) {
                models.modified.dispose();
            }
        }

        // Create a temporary model to detect language
        const tempModel = monaco.editor.createModel(leftContent, undefined, monaco.Uri.parse(leftUri));
        const language = tempModel.getLanguageId();
        tempModel.dispose(); // Clean up temporary model
        
        console.log('Detected language:', language);

        const originalModel = monaco.editor.createModel(leftContent, language);
        const modifiedModel = monaco.editor.createModel(rightContent, language);

        // Setting the models for the diff editor
        editor.setModel({
            original: originalModel,
            modified: modifiedModel
        });
        // Creating the diff navigator to allow stepping through changes
        diffNavigator = monaco.editor.createDiffNavigator(editor, {
            followsCaret: true,
            ignoreCharChanges: true
        });
        // Wait for editor to be fully rendered before updating diff range
        setTimeout(() => {
            updateCurrentDiffRange();
        }, 200);
        originalUserContent = editor.getModel().original.getValue();
    }

    // Main message handler
    const messageHandler = event => {
        console.log('[Webview] Received message type:', event.data?.type);
        const message = event.data;

        switch (message.type) {
            case 'init':
                if (!isMonacoLoaded) {
                    pendingInitMessage = message;
                    return;
                }
                updateContent(message.leftContent, message.rightContent, message.leftUri);
                break;

            case 'updateContent':
                if (!isMonacoLoaded) {
                    console.log('[Webview] Monaco not loaded yet, cannot update content');
                    return;
                }
                updateContent(message.leftContent, message.rightContent, message.leftUri);
                break;

            case 'triggerAccept':
                if (currentDiffRange) {
                    const payload = { 
                        type: 'acceptChunk', 
                        range: currentDiffRange,
                        position: lastKnownPosition
                    };
                    if (message.blockId) {
                        payload.blockId = message.blockId;
                    }
                    if (message?.source) {
                        payload.source = message.source;
                    }
                    vscode.postMessage(payload);
                }
                break;
            case 'triggerReject':
                if (currentDiffRange) {
                    const payload = { 
                        type: 'rejectChunk', 
                        range: currentDiffRange,
                        position: lastKnownPosition
                    };
                    if (message.blockId) {
                        payload.blockId = message.blockId;
                    }
                    if (message?.source) {
                        payload.source = message.source;
                    }
                    vscode.postMessage(payload);
                }
                break;
            case 'modalResponse':
                if (message.shouldReset) {
                    vscode.postMessage({
                        type: 'openOriginalFile',
                        position: message.position || lastKnownPosition
                    });
                }
                break;
            case 'updateCursorPosition':
                if (message.position) {
                    editor.getModifiedEditor().setPosition(message.position);
                    editor.getModifiedEditor().revealLineInCenter(message.position.lineNumber);
                }
                break;    
        }
    };
    window.addEventListener('message', messageHandler);

    require(['vs/editor/editor.main'], function() {
        console.log('[Webview] Monaco loaded successfully');
        isMonacoLoaded = true;

        // Create the diff editor
        try {
            editor = monaco.editor.createDiffEditor(document.getElementById('editor'), {
                automaticLayout: true,     
                renderSideBySide: false,
                enableScripts: true
            });
            // Define and apply custom theme
            monaco.editor.defineTheme('custom-theme', {
                base: 'vs-dark',
                inherit: true,
                rules: [],
                colors: {
                    'editor.background': getComputedStyle(document.documentElement)
                        .getPropertyValue('--vscode-editor-background') || '#1e1e1e',
                    'editorGutter.background': getComputedStyle(document.documentElement)
                        .getPropertyValue('--vscode-editor-background') || '#1e1e1e',
                }
            });
            monaco.editor.setTheme('custom-theme');

            editor.getModifiedEditor().onDidScrollChange(() => {
                if (currentDiffRange) {
                    updateControlsPosition(currentDiffRange.modifiedStartLineNumber);
                }
            });

            // Track cursor position in both editors
            editor.getOriginalEditor().onDidChangeCursorPosition((e) => {
                lastKnownPosition = {
                    lineNumber: e.position.lineNumber,
                    column: e.position.column
                };
            });

            editor.getModifiedEditor().onDidChangeCursorPosition((e) => {
                lastKnownPosition = {
                    lineNumber: e.position.lineNumber,
                    column: e.position.column
                };
            });

            editor.getModifiedEditor().onDidChangeModelContent((e) => {
                if (!currentDiffRange) {
                    updateCurrentDiffRange();
                }
                if (e.changes.length > 0 && !isUndoOperation) {
                    const modifiedContent = editor.getModel().modified.getValue();
                    const modifiedPosition = editor.getModifiedEditor().getPosition();
                    const lineMapping = mapModifiedToOriginalLines(originalUserContent, modifiedContent);
                    const originalLineNum = getOriginalLineFromModified(modifiedPosition.lineNumber, lineMapping);

                    isUndoOperation = true;
                    editor.getModel().modified.undo();
                    setTimeout(() => {
                        isUndoOperation = false;
                    }, 0);
                    
                    vscode.postMessage({ 
                        type: 'showTypingModal',
                        position: {
                            lineNumber: originalLineNum,
                            column: modifiedPosition.column
                        }
                    });
                }
            });

            // Set up button listeners
            document.getElementById('acceptChanges').addEventListener('click', () => {
                if (currentDiffRange) {
                    vscode.postMessage({ 
                        type: 'acceptChunk', 
                        range: currentDiffRange,
                        position: lastKnownPosition
                    });
                }
            });

            document.getElementById('rejectChanges').addEventListener('click', () => {
                if (currentDiffRange) {
                    vscode.postMessage({ 
                        type: 'rejectChunk', 
                        range: currentDiffRange,
                        position: lastKnownPosition
                    });
                }
            });


            editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyZ, () => {
                if (currentDiffRange) {
                    vscode.postMessage({ 
                        type: 'undoChange',
                        range: currentDiffRange,
                        position: lastKnownPosition
                    });
                }
            });

            // Notify VS Code that we're ready
            vscode.postMessage({ type: 'ready' });

            // Process any pending init message
            if (pendingInitMessage) {
                messageHandler({ data: pendingInitMessage });
                pendingInitMessage = null;
            }

        } catch (error) {
            console.error('[Webview] Error during editor initialization:', error);
        }
    });

    function mapModifiedToOriginalLines(originalContent, modifiedContent) {
        const dmp = new diff_match_patch();
        const diffs = dmp.diff_main(originalContent, modifiedContent);
        dmp.diff_cleanupSemantic(diffs);
    
        let originalLineNum = 0;  // Track line number in original content
        let modifiedLineNum = 0;  // Track line number in modified content
        const lineMapping = {};   // Mapping of modified line numbers to original line numbers
    
        diffs.forEach(([operation, text]) => {
            const lineCount = text.split('\n').length - 1;
    
            if (operation === 0) {
                // Equal content: map each line from modified to original
                for (let i = 0; i <= lineCount; i++) {
                    lineMapping[modifiedLineNum + i] = originalLineNum + i;
                }
                originalLineNum += lineCount;
                modifiedLineNum += lineCount;
            } else if (operation === 1) {
                // Inserted lines exist only in modified content, increment modifiedLineNum only
                modifiedLineNum += lineCount;
            } else if (operation === -1) {
                // Deleted lines exist only in original content, increment originalLineNum only
                originalLineNum += lineCount;
            }
        });
    
        return lineMapping;
    }
    

    function getOriginalLineFromModified(modifiedLineNum, lineMapping) {
        // First try the exact line number
        if (lineMapping[modifiedLineNum] !== undefined) {
            return lineMapping[modifiedLineNum];
        }

        // If exact line not found, look for nearest valid line
        let lowerLine = modifiedLineNum;
        let upperLine = modifiedLineNum;

        // Search both up and down until we find a valid mapping
        while (lowerLine > 0 || upperLine < Object.keys(lineMapping).length) {
            lowerLine--;
            upperLine++;

            // Check lower line
            if (lowerLine > 0 && lineMapping[lowerLine] !== undefined) {
                return lineMapping[lowerLine];
            }

            // Check upper line
            if (lineMapping[upperLine] !== undefined) {
                return lineMapping[upperLine];
            }
        }

        // If no valid mapping found, return the first line as fallback
        return 1;
    }

    // Function to update the current diff range and reposition controls
    function updateCurrentDiffRange() {
        const changes = editor.getLineChanges();
        if (!changes || changes.length === 0) {
            vscode.postMessage({ 
                type: 'noDifferencesRemaining',
                position: lastKnownPosition
            });
            return;
        }
        currentDiffRange = changes[0];
        // Finding the diff chunk corresponding to the current cursor position
        updateControlsPosition(currentDiffRange.modifiedStartLineNumber);
    }

    function updateControlsPosition(lineNumber) {    
        let isChangeOnTopLine = false
        const modifiedEditor = editor.getModifiedEditor();
        const originalEditor = editor.getOriginalEditor();
        const editorWidth = modifiedEditor.getLayoutInfo().width;
        const lineHeight = modifiedEditor.getOption(monaco.editor.EditorOption.lineHeight);
        const scrollTop = modifiedEditor.getScrollTop();
        const editorHeight = modifiedEditor.getLayoutInfo().height;
        // Adjust line number (for cramped lines at the top)
        let targetLineNumber = adjustTargetLineNumber(lineNumber, modifiedEditor, lineHeight);
        if(targetLineNumber <= 3){
            isChangeOnTopLine = true;
        }
        let modifiedLineTop = modifiedEditor.getTopForLineNumber(targetLineNumber);
        let originalLineTop = originalEditor.getTopForLineNumber(targetLineNumber);
    
        // Calculate control position relative to the editor container
        let controlsTop = Math.min(modifiedLineTop, originalLineTop) - scrollTop;
        if (controlsTop < 0 || controlsTop > editorHeight - lineHeight) {
            controls.style.display = 'none';
            return;
        } else {
            controls.style.display = 'flex';
        }
        // Position controls inside the scrolling container
        positionControls(controlsTop, editorWidth, isChangeOnTopLine);
    }
    
    // Adjusts line number if line 1 is too cramped
    function adjustTargetLineNumber(lineNumber, modifiedEditor, lineHeight) {
        if (lineNumber !== 1) return lineNumber;
    
        const line2Top = modifiedEditor.getTopForLineNumber(2);
        const line3Top = modifiedEditor.getTopForLineNumber(3);
    
        return (line3Top - line2Top >= lineHeight * 1.5) ? 2 : 3;
    }
    
    // Helper function to set control positions
    function positionControls(top, editorWidth, isChangeOnTopLine) {
        if(!isChangeOnTopLine){
            top = top - 40
        }
        controls.style.position = 'absolute';
        controls.style.top = `${top}px`;
        controls.style.left = `${editorWidth - controls.offsetWidth}px`;
    }
    
})();
