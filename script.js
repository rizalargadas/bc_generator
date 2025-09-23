document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('csvFile');
    const fileInfo = document.getElementById('fileInfo');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const topicsTable = document.getElementById('topics-tbody');
    const noDataMessage = document.getElementById('no-data-message');
    const processingTable = document.getElementById('processing-tbody');
    const noProcessingData = document.getElementById('no-processing-data');
    const processingCount = document.getElementById('processing-count');
    const processingSelectionCount = document.getElementById('processing-selection-count');
    const selectAllProcessingBtn = document.getElementById('select-all-processing-btn');
    const deselectAllProcessingBtn = document.getElementById('deselect-all-processing-btn');
    const cancelSelectedBtn = document.getElementById('cancel-selected-btn');
    const selectAllProcessingCheckbox = document.getElementById('select-all-processing-checkbox');
    const cancelModal = document.getElementById('cancel-modal');
    const bringBackBtn = document.getElementById('bring-back-btn');
    const deletePermanentlyBtn = document.getElementById('delete-permanently-btn');
    const cancelModalBtn = document.getElementById('cancel-modal-btn');
    const openaiApiKeyInput = document.getElementById('openai-api-key');
    const saveApiKeyBtn = document.getElementById('save-api-key');
    const testApiKeyBtn = document.getElementById('test-api-key');
    const apiStatus = document.getElementById('api-status');
    const elevenlabsApiKeyInput = document.getElementById('elevenlabs-api-key');
    const saveElevenlabsKeyBtn = document.getElementById('save-elevenlabs-key');
    const elevenlabsVoiceIdInput = document.getElementById('elevenlabs-voice-id');
    const saveVoiceIdBtn = document.getElementById('save-voice-id');
    const elevenlabsStatus = document.getElementById('elevenlabs-status');
    const lateApiKeyInput = document.getElementById('late-api-key');
    const saveLateKeyBtn = document.getElementById('save-late-key');
    const testLateKeyBtn = document.getElementById('test-late-key');
    const lateStatus = document.getElementById('late-status');
    const leonardoApiKeyInput = document.getElementById('leonardo-api-key');
    const saveLeonardoKeyBtn = document.getElementById('save-leonardo-key');
    const leonardoModelSelect = document.getElementById('leonardo-model-select');
    const leonardoAlchemyToggle = document.getElementById('leonardo-alchemy-toggle');
    const testPromptInput = document.getElementById('test-prompt-input');
    const testGenerateBtn = document.getElementById('test-generate-btn');
    const testImageResult = document.getElementById('test-image-result');
    const testStatus = document.getElementById('test-status');
    const testImage = document.getElementById('test-image');
    const leonardoStatus = document.getElementById('leonardo-status');
    const selectionCount = document.getElementById('selection-count');
    const selectAllBtn = document.getElementById('select-all-btn');
    const deselectAllBtn = document.getElementById('deselect-all-btn');
    const generateVideosBtn = document.getElementById('generate-videos-btn');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const clearStorageBtn = document.getElementById('clear-storage-btn');
    const selectAllCheckbox = document.getElementById('select-all-checkbox');

    let csvData = [];
    let selectedRows = new Set();
    let processingData = [];
    let selectedProcessingRows = new Set();
    let nextProcessingId = 1;
    let usedTopicIds = new Set();
    let openaiApiKey = '';
    let elevenlabsApiKey = '';
    let elevenlabsVoiceId = '';
    let lateApiKey = '';
    let leonardoApiKey = '';
    let selectedLeonardoModel = 'de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3'; // Default to Leonardo Phoenix 1.0
    let leonardoAlchemyEnabled = false; // Default to disabled to save credits

    // Clean text function to remove special characters
    function cleanText(text) {
        if (!text) return '';

        // Replace common Unicode characters with ASCII equivalents
        return text
            .replace(/[\u2018\u2019]/g, "'")  // Smart single quotes
            .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes
            .replace(/\u2014/g, '--')          // Em dash
            .replace(/\u2013/g, '-')           // En dash
            .replace(/\u2026/g, '...')         // Ellipsis
            .replace(/\u00A0/g, ' ')           // Non-breaking space
            .replace(/[\u2010-\u2015]/g, '-')  // Various dashes
            .replace(/[\u2022]/g, '*')         // Bullet point
            .replace(/[\u00B7]/g, '-')         // Middle dot
            .replace(/[\u2122]/g, 'TM')        // Trademark
            .replace(/[\u00A9]/g, '(c)')       // Copyright
            .replace(/[\u00AE]/g, '(R)')       // Registered
            .replace(/[^\x00-\x7F]/g, '')      // Remove any remaining non-ASCII characters
            .trim();
    }

    // Sanitize image prompts to avoid content policy violations
    function sanitizeImagePrompt(prompt, useStrictMode = false) {
        if (!prompt) return '';

        let sanitized = cleanText(prompt);

        // For DALL-E 2, we can be less strict with replacements
        if (useStrictMode) {
            // Strict replacements for problematic content
            const problematicTerms = {
                'blood': 'red liquid',
                'bloody': 'red-stained',
                'gore': 'aftermath',
                'corpse': 'lifeless figure',
                'dead body': 'still figure',
                'dead bodies': 'still figures',
                'murder': 'dramatic incident',
                'murdered': 'affected',
                'killing': 'dramatic confrontation',
                'child': 'young person',
                'children': 'young people'
            };

            // Replace problematic terms (case-insensitive)
            Object.keys(problematicTerms).forEach(term => {
                const regex = new RegExp(`\\b${term}\\b`, 'gi');
                sanitized = sanitized.replace(regex, problematicTerms[term]);
            });
        }

        // For DALL-E 2, just add artistic prefix without heavy modification
        if (!sanitized.toLowerCase().includes('illustration') && !sanitized.toLowerCase().includes('artistic')) {
            sanitized = 'Digital art illustration: ' + sanitized;
        }

        // Add style modifiers for better results
        sanitized += ', digital art style, atmospheric lighting, cinematic composition';

        return sanitized;
    }

    // ID generation function
    function generateTopicId() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let id;
        do {
            id = '';
            for (let i = 0; i < 4; i++) {
                id += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        } while (usedTopicIds.has(id));

        usedTopicIds.add(id);
        return id;
    }

    // OpenAI Script Generation
    async function generateScript(topic, info, ytType = 'Long') {
        if (!openaiApiKey) {
            throw new Error('OpenAI API key not configured');
        }

        const isShort = ytType === 'Shorts';
        const targetWords = isShort ? 400 : 1200;
        const sceneCount = isShort ? 4 : 10;

        const prompt = `You are an award-winning narrative architect and YouTube strategy expert specializing in faceless, AI-narrated, content (True Crime, Dark History, Mysteries, Creepy Happenings) that maximizes audience retention and growth. You craft meticulously-researched, vividly-told scripts that create an eerie yet factual journey into humanity's darkest chapters.

Write an immersive, narrative-driven YouTube ${isShort ? 'Shorts' : 'Long-form'} script on:
📌 TOPIC: ${topic}

Short Info About the Topic: ${info}

Write a full script first as a numbered list of ${sceneCount} distinct scenes, each with a title and target word count to collectively total ~${targetWords} words. ${isShort ? 'For Shorts, focus on immediate hook and rapid pacing.' : 'Use suspenseful but calm, authoritative language to build curiosity and maintain an unsettling yet factual tone.'} After presenting the outline,

Full script should conclude with the specified haunting/hooky outro line/scene. Stay strictly within verified facts and note if the topic warrants a multi-part series. Your goal: craft an unforgettable, cinematic narrative experience that keeps viewers watching to the end — and eager for the next dark chapter.

For each scene's image prompt, ensure they are:
- Written in clear, descriptive English
- Appropriate for OpenAI/DALL-E and compliant with their community standards
- Visually accurate and aligned with the events and atmosphere of the script
- Consistent in describing any recurring or prominent characters (describe their age, gender, clothing, and other distinctive features clearly and use the same description throughout all scenes where they appear)
- Include the mood, time of day, setting, and any relevant props or details to make the image atmospheric and relevant to the story

IMPORTANT: Use only plain ASCII text. Avoid special characters, smart quotes, em-dashes, or any Unicode characters. Use simple punctuation only (periods, commas, apostrophes, hyphens, quotes).

Format your response as JSON with this exact structure:
{
  "scenes": [
    {
      "scene_number": 1,
      "title": "Scene Title",
      "script": "The full script text for this scene...",
      "image_prompt": "Detailed image generation prompt for this scene"
    }
  ]
}`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4',
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 4000,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const content = data.choices[0].message.content;

            // Try to parse as JSON, fallback to text parsing if needed
            try {
                const parsedData = JSON.parse(content);
                // Clean all text in the parsed data
                if (parsedData.scenes) {
                    parsedData.scenes = parsedData.scenes.map(scene => ({
                        ...scene,
                        script: cleanText(scene.script),
                        title: cleanText(scene.title),
                        image_prompt: cleanText(scene.image_prompt)
                    }));
                }
                return parsedData;
            } catch (parseError) {
                // Fallback: parse text response
                return parseTextScript(content);
            }
        } catch (error) {
            console.error('Error generating script:', error);
            throw error;
        }
    }

    function parseTextScript(text) {
        // Fallback parser for non-JSON responses
        const scenes = [];
        const lines = text.split('\n');
        let currentScene = null;
        let sceneNumber = 1;

        lines.forEach(line => {
            line = line.trim();
            if (line.match(/^\d+\./)) {
                if (currentScene) {
                    scenes.push(currentScene);
                }
                currentScene = {
                    scene_number: sceneNumber++,
                    title: cleanText(line.replace(/^\d+\./, '').trim()),
                    script: '',
                    image_prompt: cleanText(`Dark, atmospheric scene for: ${line.replace(/^\d+\./, '').trim()}`)
                };
            } else if (currentScene && line) {
                currentScene.script += line + ' ';
            }
        });

        if (currentScene) {
            currentScene.script = cleanText(currentScene.script);
            scenes.push(currentScene);
        }

        // Clean all scenes
        scenes = scenes.map(scene => ({
            ...scene,
            script: cleanText(scene.script),
            title: cleanText(scene.title),
            image_prompt: cleanText(scene.image_prompt)
        }));

        return { scenes };
    }

    async function generateCSV(topic, topicId, scriptData) {
        const headers = ['Scene #', 'Script for Voice Over', 'Image Generation Prompt'];
        const rows = [headers];

        scriptData.scenes.forEach(scene => {
            rows.push([
                scene.scene_number,
                scene.script.trim(),
                scene.image_prompt
            ]);
        });

        const csvContent = rows.map(row =>
            row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');

        // Check if running in Electron
        if (typeof require !== 'undefined') {
            // Electron: Save with new directory structure
            try {
                const { ipcRenderer } = require('electron');
                const result = await ipcRenderer.invoke('save-csv-file', {
                    topicId: topicId,
                    topicName: topic,
                    content: csvContent
                });

                if (result.success) {
                    console.log(`File saved to: ${result.filePath}`);
                    console.log(`Output directory created: ${result.outputDir}`);
                    return {
                        filename: `${topicId}.csv`,
                        outputDir: result.outputDir
                    };
                } else {
                    console.error('Failed to save file:', result.error);
                    alert(`Failed to save file: ${result.error}`);
                    return null;
                }
            } catch (error) {
                console.error('Error saving file:', error);
                alert(`Error saving file: ${error.message}`);
                return null;
            }
        } else {
            // Web: Download file (fallback for non-Electron environment)
            const filename = `${topicId}.csv`;
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');

            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', filename);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
            return { filename: filename, outputDir: null };
        }
    }

    // Parse CSV content to extract scenes
    function parseCSVContent(csvContent) {
        const lines = csvContent.split('\n').filter(line => line.trim());
        const scenes = [];

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const parts = parseCSVLine(lines[i]);
            if (parts.length >= 3) {
                scenes.push({
                    sceneNumber: parts[0],
                    script: parts[1],
                    imagePrompt: parts[2]
                });
            }
        }

        return scenes;
    }

    // Generate images using Leonardo.ai
    async function generateImages(processingItem, retryOnly = false) {
        if (!leonardoApiKey) {
            throw new Error('Leonardo.ai API key not configured');
        }

        if (!processingItem.outputDir) {
            throw new Error('Output directory not found');
        }

        try {
            // Read the CSV file
            const { ipcRenderer } = require('electron');
            const csvResult = await ipcRenderer.invoke('read-csv-file', {
                outputDir: processingItem.outputDir,
                topicId: processingItem.id
            });

            if (!csvResult.success) {
                throw new Error(csvResult.error);
            }

            const scenes = parseCSVContent(csvResult.content);

            // Check which images already exist if retrying
            let existingSceneNumbers = [];
            let existingCount = 0;

            if (retryOnly) {
                const statusResult = await ipcRenderer.invoke('check-processing-status', {
                    outputDir: processingItem.outputDir,
                    topicId: processingItem.id
                });

                if (statusResult.success) {
                    existingCount = statusResult.status.imageCount;
                    existingSceneNumbers = statusResult.status.existingImages || [];

                    console.log(`Retrying failed images only. Found ${existingCount} existing images out of ${scenes.length}`);
                    console.log(`Existing scene numbers: ${existingSceneNumbers.join(', ')}`);
                }
            }

            console.log(`Generating ${retryOnly ? 'missing' : 'all'} images for ${processingItem.topic}`);

            // Initialize or use existing failed scenes tracker
            if (!processingItem.failedScenes) {
                processingItem.failedScenes = [];
            }

            // Update status
            processingItem.image = retryOnly ? 'retrying failed...' : 'generating...';
            populateProcessingTable();

            let successCount = existingCount;
            const failedScenes = [];

            // Generate images for each scene
            for (let i = 0; i < scenes.length; i++) {
                const scene = scenes[i];
                const sceneNum = parseInt(scene.sceneNumber);

                // Skip if image already exists (when retrying)
                if (retryOnly && existingSceneNumbers.includes(sceneNum)) {
                    console.log(`Skipping scene ${sceneNum} - image already exists`);
                    continue;
                }

                // Update progress display
                processingItem.image = `generating ${i + 1}/${scenes.length}...`;
                populateProcessingTable();

                try {
                    console.log(`Generating image ${scene.sceneNumber} of ${scenes.length} for ${processingItem.topic}`);

                    // Try with original prompt first
                    let attemptCount = 0;
                    let lastError = null;
                    let imageGenerated = false;

                    while (attemptCount < 3 && !imageGenerated) {
                        attemptCount++;

                        // Progressively simplify prompt on retries
                        let promptToUse = scene.imagePrompt;
                        if (attemptCount === 2) {
                            // Second attempt: Use sanitized prompt
                            promptToUse = sanitizeImagePrompt(scene.imagePrompt, true);
                            console.log(`Attempt ${attemptCount}: Using sanitized prompt`);
                        } else if (attemptCount === 3) {
                            // Third attempt: Use generic safe prompt
                            promptToUse = `Atmospheric cinematic scene, moody lighting, professional photography style, artistic composition`;
                            console.log(`Attempt ${attemptCount}: Using generic safe prompt`);
                        }

                        try {
                            // Call Leonardo.ai API for photorealistic images
                            const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
                                method: 'POST',
                                headers: {
                                    'accept': 'application/json',
                                    'content-type': 'application/json',
                                    'authorization': `Bearer ${leonardoApiKey}`
                                },
                                body: JSON.stringify({
                                    prompt: promptToUse,
                                    modelId: selectedLeonardoModel,
                                    width: 1024,
                                    height: 576,  // 16:9 aspect ratio (1024x576)
                                    num_images: 1,
                                    ...(leonardoAlchemyEnabled && { alchemy: true }),  // Only add alchemy if enabled
                                    presetStyle: 'CINEMATIC'  // Cinematic style for video content
                                })
                            });

                            if (!response.ok) {
                                const errorText = await response.text();
                                let errorMessage = `Leonardo API error: ${response.status}`;
                                lastError = errorMessage;
                                throw new Error(errorMessage);
                            }

                            const data = await response.json();
                            const generationId = data.sdGenerationJob.generationId;

                            // Poll for completion (Leonardo requires polling)
                            let imageUrl = null;
                            let attempts = 0;
                            const maxAttempts = 30; // Wait up to 60 seconds

                            while (!imageUrl && attempts < maxAttempts) {
                                attempts++;
                                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

                                const pollResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
                                    headers: {
                                        'accept': 'application/json',
                                        'authorization': `Bearer ${leonardoApiKey}`
                                    }
                                });

                                if (pollResponse.ok) {
                                    const pollData = await pollResponse.json();
                                    if (pollData.generations_by_pk && pollData.generations_by_pk.status === 'COMPLETE') {
                                        if (pollData.generations_by_pk.generated_images && pollData.generations_by_pk.generated_images.length > 0) {
                                            imageUrl = pollData.generations_by_pk.generated_images[0].url;
                                        }
                                    }
                                }
                            }

                            if (!imageUrl) {
                                throw new Error('Leonardo generation timed out or failed');
                            }

                            // Save the image
                            const saveResult = await ipcRenderer.invoke('save-image', {
                                imageUrl: imageUrl,
                                outputDir: processingItem.outputDir,
                                topicId: processingItem.id,
                                sceneNumber: scene.sceneNumber
                            });

                            if (saveResult.success) {
                                successCount++;
                                console.log(`Image ${scene.sceneNumber} saved successfully on attempt ${attemptCount}`);
                                imageGenerated = true;
                                // Remove from failed scenes if it was there
                                processingItem.failedScenes = processingItem.failedScenes.filter(s => s !== scene.sceneNumber);
                            }

                        } catch (error) {
                            console.log(`Attempt ${attemptCount} failed for scene ${scene.sceneNumber}: ${error.message}`);

                            if (attemptCount < 3) {
                                // Wait before retry
                                if (error.message.includes('rate_limit')) {
                                    console.log('Rate limited, waiting 10 seconds...');
                                    await new Promise(resolve => setTimeout(resolve, 10000));
                                } else if (error.message.includes('content_policy')) {
                                    console.log('Content policy issue, trying with safer prompt...');
                                    await new Promise(resolve => setTimeout(resolve, 2000));
                                } else {
                                    await new Promise(resolve => setTimeout(resolve, 3000));
                                }
                            }
                        }
                    }

                    if (!imageGenerated) {
                        console.error(`Failed all 3 attempts for scene ${scene.sceneNumber}`);
                        failedScenes.push(scene.sceneNumber);
                    }

                    // Add delay between scenes
                    await new Promise(resolve => setTimeout(resolve, 2000));

                } catch (error) {
                    console.error(`Unexpected error for scene ${scene.sceneNumber}:`, error);
                    failedScenes.push(scene.sceneNumber);
                }
            }

            // Store failed scenes for potential retry
            processingItem.failedScenes = failedScenes;

            // Update status with more detail
            if (successCount === scenes.length) {
                processingItem.image = 'done';
            } else {
                processingItem.image = `${successCount}/${scenes.length} done`;
                if (failedScenes.length > 0) {
                    processingItem.imageError = `Failed: scenes ${failedScenes.join(', ')}`;
                }
            }

            processingItem.imageCount = successCount;
            processingItem.totalScenes = scenes.length;
            populateProcessingTable();
            saveToLocalStorage();

            return successCount;

        } catch (error) {
            processingItem.image = 'failed';
            processingItem.imageError = error.message;
            populateProcessingTable();
            throw error;
        }
    }

    async function processScriptGeneration(processingItem, index) {
        try {
            // Update status to writing
            processingItem.script = 'writing...';
            populateProcessingTable();

            const scriptData = await generateScript(processingItem.topic, processingItem.fullData.Info, processingItem.ytType);
            const result = await generateCSV(processingItem.topic, processingItem.id, scriptData);

            if (result) {
                // Update status to done
                processingItem.script = 'done';
                processingItem.scriptFile = result.filename;
                processingItem.outputDir = result.outputDir;

                // Store total scenes for tracking
                processingItem.totalScenes = scriptData.scenes ? scriptData.scenes.length : 0;

                populateProcessingTable();
                saveToLocalStorage();

                console.log(`Script generated for ${processingItem.topic}`);
                console.log(`Output directory: ${result.outputDir}`);

                // Automatically start image generation
                console.log(`Auto-starting image generation for ${processingItem.topic}`);
                await generateImages(processingItem);

                // TODO: Auto-generate voice overs here (future implementation)
                // await generateVoiceOvers(processingItem);

            } else {
                throw new Error('Failed to save CSV file');
            }
        } catch (error) {
            console.error('Script generation failed:', error);
            processingItem.script = 'failed';
            populateProcessingTable();
            alert(`Script generation failed for "${processingItem.topic}": ${error.message}`);
        }
    }

    // LocalStorage functions
    function saveToLocalStorage() {
        try {
            localStorage.setItem('bc_generator_data', JSON.stringify(csvData));
            localStorage.setItem('bc_generator_processing', JSON.stringify(processingData));
            localStorage.setItem('bc_generator_next_id', nextProcessingId);
            localStorage.setItem('bc_generator_used_ids', JSON.stringify(Array.from(usedTopicIds)));
            localStorage.setItem('bc_generator_openai_key', openaiApiKey);
            localStorage.setItem('bc_generator_elevenlabs_key', elevenlabsApiKey);
            localStorage.setItem('bc_generator_elevenlabs_voice_id', elevenlabsVoiceId);
            localStorage.setItem('bc_generator_late_key', lateApiKey);
            localStorage.setItem('bc_generator_leonardo_key', leonardoApiKey);
            localStorage.setItem('bc_generator_leonardo_model', selectedLeonardoModel);
            localStorage.setItem('bc_generator_leonardo_alchemy', leonardoAlchemyEnabled);
            localStorage.setItem('bc_generator_timestamp', new Date().toISOString());
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    }

    function loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('bc_generator_data');
            const savedProcessing = localStorage.getItem('bc_generator_processing');
            const savedNextId = localStorage.getItem('bc_generator_next_id');
            const timestamp = localStorage.getItem('bc_generator_timestamp');

            if (savedData) {
                csvData = JSON.parse(savedData);

                // Add IDs to existing data that doesn't have them
                csvData.forEach(row => {
                    if (!row._topicId) {
                        const baseId = generateTopicId();
                        row._topicId = baseId + (row['YT Type'] === 'Shorts' ? '_S' : '_L');
                    } else if (!row._topicId.match(/_[LS]$/)) {
                        // Add suffix to existing IDs that don't have them
                        row._topicId = row._topicId + (row['YT Type'] === 'Shorts' ? '_S' : '_L');
                    }
                });

                if (csvData.length > 0) {
                    populateTable();

                    // Show info about loaded data
                    const savedDate = new Date(timestamp).toLocaleString();
                    fileInfo.innerHTML = `
                        <div style="text-align: left;">
                            <span style="color: #0066cc; font-weight: bold;">LOADED FROM MEMORY</span><br>
                            <span style="color: var(--text-primary);">Last saved: ${savedDate}</span><br>
                            <span style="color: var(--text-secondary);">Topics: ${csvData.length} rows</span>
                        </div>
                    `;
                    fileInfo.classList.add('show');
                }
            }

            if (savedProcessing) {
                processingData = JSON.parse(savedProcessing);
                populateProcessingTable();
            }

            if (savedNextId) {
                nextProcessingId = parseInt(savedNextId);
            }

            const savedUsedIds = localStorage.getItem('bc_generator_used_ids');
            if (savedUsedIds) {
                usedTopicIds = new Set(JSON.parse(savedUsedIds));
            }

            const savedApiKey = localStorage.getItem('bc_generator_openai_key');
            if (savedApiKey) {
                openaiApiKey = savedApiKey;
                openaiApiKeyInput.value = savedApiKey;
                updateApiStatus('saved');
            }

            const savedElevenlabsKey = localStorage.getItem('bc_generator_elevenlabs_key');
            if (savedElevenlabsKey) {
                elevenlabsApiKey = savedElevenlabsKey;
                elevenlabsApiKeyInput.value = savedElevenlabsKey;
                updateElevenlabsStatus('saved');
            }

            const savedVoiceId = localStorage.getItem('bc_generator_elevenlabs_voice_id');
            if (savedVoiceId) {
                elevenlabsVoiceId = savedVoiceId;
                elevenlabsVoiceIdInput.value = savedVoiceId;
            }

            const savedLateKey = localStorage.getItem('bc_generator_late_key');
            if (savedLateKey) {
                lateApiKey = savedLateKey;
                lateApiKeyInput.value = savedLateKey;
                updateLateStatus('saved');
            }

            const savedLeonardoKey = localStorage.getItem('bc_generator_leonardo_key');
            if (savedLeonardoKey) {
                leonardoApiKey = savedLeonardoKey;
                leonardoApiKeyInput.value = savedLeonardoKey;
                updateLeonardoStatus('saved');
            }

            const savedLeonardoModel = localStorage.getItem('bc_generator_leonardo_model');
            if (savedLeonardoModel) {
                selectedLeonardoModel = savedLeonardoModel;
                leonardoModelSelect.value = savedLeonardoModel;
            }

            const savedLeonardoAlchemy = localStorage.getItem('bc_generator_leonardo_alchemy');
            if (savedLeonardoAlchemy !== null) {
                leonardoAlchemyEnabled = savedLeonardoAlchemy === 'true';
                leonardoAlchemyToggle.checked = leonardoAlchemyEnabled;
            }
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
        }
    }

    function clearLocalStorage() {
        try {
            // Preserve API keys before clearing
            const apiKey = localStorage.getItem('bc_generator_openai_key');
            const elevenlabsKey = localStorage.getItem('bc_generator_elevenlabs_key');
            const voiceId = localStorage.getItem('bc_generator_elevenlabs_voice_id');
            const lateKey = localStorage.getItem('bc_generator_late_key');
            const leonardoKey = localStorage.getItem('bc_generator_leonardo_key');

            localStorage.removeItem('bc_generator_data');
            localStorage.removeItem('bc_generator_processing');
            localStorage.removeItem('bc_generator_next_id');
            localStorage.removeItem('bc_generator_used_ids');
            localStorage.removeItem('bc_generator_timestamp');

            // Restore API keys if they existed
            if (apiKey) {
                localStorage.setItem('bc_generator_openai_key', apiKey);
            }
            if (elevenlabsKey) {
                localStorage.setItem('bc_generator_elevenlabs_key', elevenlabsKey);
            }
            if (voiceId) {
                localStorage.setItem('bc_generator_elevenlabs_voice_id', voiceId);
            }
            if (lateKey) {
                localStorage.setItem('bc_generator_late_key', lateKey);
            }
            if (leonardoKey) {
                localStorage.setItem('bc_generator_leonardo_key', leonardoKey);
            }
        } catch (e) {
            console.warn('Could not clear localStorage:', e);
        }
    }

    function updateApiStatus(status) {
        const statusText = apiStatus.querySelector('.status-text');

        switch (status) {
            case 'saved':
                statusText.textContent = 'API key saved and ready';
                statusText.style.color = '#008000';
                testApiKeyBtn.style.display = 'inline-block';
                break;
            case 'testing':
                statusText.textContent = 'Testing connection...';
                statusText.style.color = '#ff8800';
                break;
            case 'success':
                statusText.textContent = 'Connection successful!';
                statusText.style.color = '#008000';
                break;
            case 'error':
                statusText.textContent = 'Connection failed - check your API key';
                statusText.style.color = '#cc0000';
                break;
            default:
                statusText.textContent = 'No API key configured';
                statusText.style.color = '#666666';
                testApiKeyBtn.style.display = 'none';
        }
    }

    function updateElevenlabsStatus(status) {
        const statusText = elevenlabsStatus.querySelector('.status-text');

        switch (status) {
            case 'saved':
                statusText.textContent = 'ElevenLabs API key saved and ready';
                statusText.style.color = '#008000';
                break;
            default:
                statusText.textContent = 'No ElevenLabs API key configured';
                statusText.style.color = '#666666';
        }
    }

    function updateLateStatus(status) {
        const statusText = lateStatus.querySelector('.status-text');

        switch (status) {
            case 'saved':
                statusText.textContent = 'Late API key saved and ready';
                statusText.style.color = '#008000';
                testLateKeyBtn.style.display = 'inline-block';
                break;
            case 'testing':
                statusText.textContent = 'Testing Late connection...';
                statusText.style.color = '#ff8800';
                break;
            case 'success':
                statusText.textContent = 'Late connection successful!';
                statusText.style.color = '#008000';
                break;
            case 'error':
                statusText.textContent = 'Late connection failed - check your API key';
                statusText.style.color = '#cc0000';
                break;
            default:
                statusText.textContent = 'No Late API key configured';
                statusText.style.color = '#666666';
                testLateKeyBtn.style.display = 'none';
        }
    }

    function updateLeonardoStatus(status) {
        const statusText = leonardoStatus.querySelector('.status-text');

        switch (status) {
            case 'saved':
                statusText.textContent = 'Leonardo.ai API key saved and ready';
                statusText.style.color = '#008000';
                // Show test button if we have a prompt
                if (testPromptInput.value.trim()) {
                    testGenerateBtn.style.display = 'inline-block';
                }
                break;
            default:
                statusText.textContent = 'No Leonardo.ai API key configured';
                statusText.style.color = '#666666';
                testGenerateBtn.style.display = 'none';
        }
    }

    function createProcessingItem(topicData) {
        return {
            id: topicData._topicId, // Use the same ID from Pending Topics
            topic: topicData.Topic,
            ytType: topicData['YT Type'] || 'Long',
            script: 'writing...',
            image: 'waiting...',
            voiceOvers: 'waiting...',
            video: 'waiting...',
            posting: 'waiting',
            fullData: topicData // Store all data for reference
        };
    }

    function getStatusClass(status) {
        if (status === 'writing...' || status === 'writing') return 'status-writing';
        if (status === 'generating...' || status === 'generating') return 'status-generating';
        if (status === 'waiting...' || status === 'waiting') return 'status-waiting';
        if (status === 'done') return 'status-done';
        if (status === 'ready to schedule') return 'status-ready';
        return 'status-waiting';
    }

    function populateProcessingTable() {
        processingTable.innerHTML = '';
        selectedProcessingRows.clear(); // Clear selection when repopulating

        if (processingData.length === 0) {
            noProcessingData.classList.add('show');
            document.getElementById('processing-table').style.display = 'none';
            processingCount.textContent = '0 videos in queue';
            return;
        }

        noProcessingData.classList.remove('show');
        document.getElementById('processing-table').style.display = 'table';

        processingData.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.dataset.index = index;

            // Create checkbox cell
            const checkboxTd = document.createElement('td');
            checkboxTd.className = 'checkbox-col';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    selectedProcessingRows.add(index);
                    tr.classList.add('selected');
                    console.log('Added index:', index, 'Total selected:', selectedProcessingRows.size);
                } else {
                    selectedProcessingRows.delete(index);
                    tr.classList.remove('selected');
                    console.log('Removed index:', index, 'Total selected:', selectedProcessingRows.size);
                }
                updateProcessingSelectionCount();
            });
            checkboxTd.appendChild(checkbox);
            tr.appendChild(checkboxTd);

            // Create other cells individually to avoid innerHTML overwriting
            const idTd = document.createElement('td');
            idTd.innerHTML = `<span class="processing-id">${item.id}</span>`;
            tr.appendChild(idTd);

            const topicTd = document.createElement('td');
            topicTd.innerHTML = `<span class="processing-topic" title="${item.topic}">${item.topic}</span>`;
            tr.appendChild(topicTd);

            const scriptTd = document.createElement('td');
            if (item.script === 'waiting...' && openaiApiKey) {
                scriptTd.innerHTML = `
                    <span class="status ${getStatusClass(item.script)}">${item.script}</span>
                    <button class="btn-mini" onclick="generateScriptForItem(${index})">Generate</button>
                `;
            } else {
                scriptTd.innerHTML = `<span class="status ${getStatusClass(item.script)}">${item.script}</span>`;
            }
            tr.appendChild(scriptTd);

            const imageTd = document.createElement('td');
            // Show retry button if images partially failed (e.g., "7/10 done")
            const imageStatus = item.image || '';
            const isPartiallyComplete = imageStatus.match(/(\d+)\/(\d+)\s*done/);

            if (isPartiallyComplete) {
                const [_, completed, total] = isPartiallyComplete;
                if (parseInt(completed) < parseInt(total)) {
                    imageTd.innerHTML = `
                        <span class="status ${getStatusClass(item.image)}">${item.image}</span>
                        <button class="btn-mini" onclick="retryFailedImages(${index})" title="Retry failed images">Retry</button>
                    `;
                    if (item.imageError) {
                        imageTd.innerHTML += `<br><span style="color: #cc0000; font-size: 11px;">${item.imageError}</span>`;
                    }
                } else {
                    imageTd.innerHTML = `<span class="status ${getStatusClass(item.image)}">${item.image}</span>`;
                }
            } else {
                imageTd.innerHTML = `<span class="status ${getStatusClass(item.image)}">${item.image}</span>`;
            }
            tr.appendChild(imageTd);

            const voiceTd = document.createElement('td');
            voiceTd.innerHTML = `<span class="status ${getStatusClass(item.voiceOvers)}">${item.voiceOvers}</span>`;
            tr.appendChild(voiceTd);

            const videoTd = document.createElement('td');
            videoTd.innerHTML = `<span class="status ${getStatusClass(item.video)}">${item.video}</span>`;
            tr.appendChild(videoTd);

            const postingTd = document.createElement('td');
            postingTd.innerHTML = `<span class="status ${getStatusClass(item.posting)}">${item.posting}</span>`;
            tr.appendChild(postingTd);

            processingTable.appendChild(tr);
        });

        processingCount.textContent = `${processingData.length} video${processingData.length !== 1 ? 's' : ''} in queue`;
    }

    function updateProcessingSelectionCount() {
        const count = selectedProcessingRows.size;
        console.log('updateProcessingSelectionCount called, count:', count);
        processingSelectionCount.textContent = `${count} item${count !== 1 ? 's' : ''} selected`;

        if (count === processingData.length && processingData.length > 0) {
            selectAllProcessingCheckbox.checked = true;
            selectAllProcessingBtn.style.display = 'none';
            deselectAllProcessingBtn.style.display = 'inline-block';
        } else if (count === 0) {
            selectAllProcessingCheckbox.checked = false;
            selectAllProcessingBtn.style.display = 'inline-block';
            deselectAllProcessingBtn.style.display = 'none';
        } else {
            selectAllProcessingCheckbox.checked = false;
            selectAllProcessingBtn.style.display = 'inline-block';
            deselectAllProcessingBtn.style.display = 'none';
        }

        // Show/hide cancel button based on ANY selection (not just all)
        console.log('Cancel button visibility:', count > 0 ? 'show' : 'hide');
        if (count > 0) {
            cancelSelectedBtn.style.display = 'inline-block';
        } else {
            cancelSelectedBtn.style.display = 'none';
        }
    }

    const requiredColumns = [
        'Topic',
        'Info'
    ];

    // Display mapping for shorter column names in the table
    const columnDisplayNames = {
        'Topic': 'Topic',
        'Info': 'Info'
    };

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');

            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            this.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });

    function parseCSV(text) {
        const lines = text.split(/\r?\n/).filter(line => line.trim());
        if (lines.length === 0) return [];

        const data = [];
        const headers = parseCSVLine(lines[0]);

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            const baseRow = {};
            headers.forEach((header, index) => {
                baseRow[header.trim()] = values[index] ? values[index].trim() : '';
            });

            // Generate base ID for both versions
            const baseId = generateTopicId();

            // Create Long version
            const longRow = {...baseRow};
            longRow._topicId = baseId + '_L';
            longRow['YT Type'] = 'Long';
            data.push(longRow);

            // Create Shorts version
            const shortsRow = {...baseRow};
            shortsRow._topicId = baseId + '_S';
            shortsRow['YT Type'] = 'Shorts';
            data.push(shortsRow);
        }
        return data;
    }

    function parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const nextChar = line[i + 1];

            if (char === '"') {
                if (inQuotes && nextChar === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current);

        return result.map(value => {
            value = value.trim();
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.slice(1, -1).replace(/""/g, '"');
            }
            return value;
        });
    }

    function createCellContent(text, column) {
        const columnLimits = {
            'Topic': 20,
            'Info': 30,
            'Schedule Date': 12,
            'Schedule Time': 8,
            'TikTok Caption': 25,
            'YouTube Title': 25,
            'YouTube Description': 30,
            'Youtube Tags': 20
        };

        const maxLength = columnLimits[column] || 20;
        const isLong = text.length > maxLength;
        const cellDiv = document.createElement('div');
        cellDiv.className = 'cell-content';

        if (isLong) {
            cellDiv.classList.add('clippable');
            cellDiv.textContent = text.substring(0, maxLength) + '...';
            cellDiv.title = 'Click to expand';
            cellDiv.dataset.fullText = text;
            cellDiv.dataset.clippedText = text.substring(0, maxLength) + '...';

            cellDiv.onclick = function(e) {
                e.stopPropagation();
                if (this.classList.contains('expanded')) {
                    this.classList.remove('expanded');
                    this.textContent = this.dataset.clippedText;
                    this.title = 'Click to expand';
                } else {
                    this.classList.add('expanded');
                    this.textContent = this.dataset.fullText;
                    this.title = 'Click to collapse';
                }
            };
        } else {
            cellDiv.textContent = text;
        }

        return cellDiv;
    }

    function populateTable() {
        topicsTable.innerHTML = '';

        if (csvData.length === 0) {
            noDataMessage.classList.add('show');
            document.getElementById('topics-table').style.display = 'none';
            return;
        }

        noDataMessage.classList.remove('show');
        document.getElementById('topics-table').style.display = 'table';

        csvData.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.dataset.index = index;

            const checkboxTd = document.createElement('td');
            checkboxTd.className = 'checkbox-col';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    selectedRows.add(index);
                    tr.classList.add('selected');
                } else {
                    selectedRows.delete(index);
                    tr.classList.remove('selected');
                }
                updateSelectionCount();
            });
            checkboxTd.appendChild(checkbox);
            tr.appendChild(checkboxTd);

            // Add ID column first
            const idTd = document.createElement('td');
            const idSpan = document.createElement('span');
            idSpan.className = 'topic-id';
            idSpan.textContent = row._topicId || 'N/A';
            idTd.appendChild(idSpan);
            tr.appendChild(idTd);

            // Add required columns plus YT Type
            const displayColumns = [...requiredColumns, 'YT Type'];
            displayColumns.forEach(column => {
                const td = document.createElement('td');
                const cellContent = createCellContent(row[column] || '', column);

                if (column === 'YT Type') {
                    // Special handling for YT Type dropdown
                    const selectWrapper = document.createElement('div');
                    selectWrapper.className = 'select-wrapper';

                    const select = document.createElement('select');
                    select.className = 'yt-type-select';

                    const option1 = document.createElement('option');
                    option1.value = 'Shorts';
                    option1.textContent = 'Shorts';

                    const option2 = document.createElement('option');
                    option2.value = 'Long';
                    option2.textContent = 'Long';

                    select.appendChild(option1);
                    select.appendChild(option2);

                    // Set current value (default to Long)
                    select.value = row[column] || 'Long';

                    select.addEventListener('change', function() {
                        csvData[index][column] = this.value;
                        // Update the ID suffix based on YT Type
                        const currentId = csvData[index]._topicId;
                        const baseId = currentId.replace(/_[LS]$/, ''); // Remove existing suffix
                        csvData[index]._topicId = baseId + (this.value === 'Long' ? '_L' : '_S');

                        // Update the displayed ID
                        const idSpan = tr.querySelector('.topic-id');
                        if (idSpan) {
                            idSpan.textContent = csvData[index]._topicId;
                        }

                        saveToLocalStorage();
                    });

                    selectWrapper.appendChild(select);
                    td.appendChild(selectWrapper);
                } else {
                    // Regular editable text columns
                    const editableDiv = document.createElement('div');
                    editableDiv.className = 'editable';
                    editableDiv.contentEditable = true;
                    editableDiv.appendChild(cellContent);

                    editableDiv.addEventListener('blur', function() {
                        const newValue = this.innerText.trim();
                        csvData[index][column] = newValue;
                        // Save to localStorage
                        saveToLocalStorage();
                    });

                    editableDiv.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            this.blur();
                        }
                    });

                    td.appendChild(editableDiv);
                }

                tr.appendChild(td);
            });

            topicsTable.appendChild(tr);
        });
    }

    function updateSelectionCount() {
        const count = selectedRows.size;
        selectionCount.textContent = `${count} item${count !== 1 ? 's' : ''} selected`;

        if (count === csvData.length && csvData.length > 0) {
            selectAllCheckbox.checked = true;
            selectAllBtn.style.display = 'none';
            deselectAllBtn.style.display = 'inline-block';
        } else if (count === 0) {
            selectAllCheckbox.checked = false;
            selectAllBtn.style.display = 'inline-block';
            deselectAllBtn.style.display = 'none';
        } else {
            selectAllCheckbox.checked = false;
            selectAllBtn.style.display = 'inline-block';
            deselectAllBtn.style.display = 'none';
        }

        // Show/hide action buttons based on selection
        if (count > 0) {
            generateVideosBtn.style.display = 'inline-block';
            deleteSelectedBtn.style.display = 'inline-block';
        } else {
            generateVideosBtn.style.display = 'none';
            deleteSelectedBtn.style.display = 'none';
        }
    }

    selectAllBtn.addEventListener('click', function() {
        const checkboxes = topicsTable.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox, index) => {
            checkbox.checked = true;
            selectedRows.add(index);
            checkbox.closest('tr').classList.add('selected');
        });
        updateSelectionCount();
    });

    deselectAllBtn.addEventListener('click', function() {
        const checkboxes = topicsTable.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            checkbox.closest('tr').classList.remove('selected');
        });
        selectedRows.clear();
        updateSelectionCount();
    });

    selectAllCheckbox.addEventListener('change', function() {
        if (this.checked) {
            selectAllBtn.click();
        } else {
            deselectAllBtn.click();
        }
    });

    deleteSelectedBtn.addEventListener('click', function() {
        const count = selectedRows.size;
        const confirmMessage = `Are you sure you want to delete ${count} selected topic${count !== 1 ? 's' : ''}? This action cannot be undone.`;

        if (confirm(confirmMessage)) {
            // Convert selectedRows Set to sorted array (highest index first)
            const indicesToDelete = Array.from(selectedRows).sort((a, b) => b - a);

            // Remove rows from csvData (starting from highest index to avoid index shifting)
            indicesToDelete.forEach(index => {
                csvData.splice(index, 1);
            });

            // Clear selection and refresh table
            selectedRows.clear();
            populateTable();
            updateSelectionCount();

            // Save to localStorage
            saveToLocalStorage();
        }
    });

    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];

        if (file) {
            if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
                fileInfo.innerHTML = '<span style="color: #cc0000;">ERROR: Please upload a valid CSV file</span>';
                fileInfo.classList.add('show');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
                const csvText = event.target.result;
                const lines = csvText.split(/\r?\n/).filter(line => line.trim());

                if (lines.length === 0) {
                    fileInfo.innerHTML = '<span style="color: #cc0000;">ERROR: CSV file is empty</span>';
                    fileInfo.classList.add('show');
                    return;
                }

                const headers = parseCSVLine(lines[0]).map(header => header.trim());
                const missingColumns = [];

                requiredColumns.forEach(column => {
                    if (!headers.includes(column)) {
                        missingColumns.push(column);
                    }
                });

                if (missingColumns.length > 0) {
                    fileInfo.innerHTML = `
                        <div style="text-align: left;">
                            <span style="color: #cc0000; font-weight: bold;">ERROR: Missing required columns</span><br>
                            <span style="color: #666; font-size: 12px;">Required: ${requiredColumns.join(' | ')}</span><br>
                            <span style="color: #cc0000; font-size: 12px;">Missing: ${missingColumns.join(', ')}</span>
                        </div>
                    `;
                    fileInfo.classList.add('show');
                    fileInput.value = '';
                    return;
                }

                csvData = parseCSV(csvText);
                const fileSize = (file.size / 1024).toFixed(2);
                const originalRowCount = Math.floor(csvData.length / 2); // Each topic creates 2 entries
                const totalEntries = csvData.length;

                fileInfo.innerHTML = `
                    <div style="text-align: left;">
                        <span style="color: #008000; font-weight: bold;">SUCCESS: Valid CSV format</span><br>
                        <span style="color: var(--text-primary);">File: ${file.name} (${fileSize} KB)</span><br>
                        <span style="color: var(--text-secondary);">Topics: ${originalRowCount} topics → ${totalEntries} entries (Long + Shorts)</span>
                    </div>
                `;
                fileInfo.classList.add('show');

                populateTable();
                selectedRows.clear();
                updateSelectionCount();

                // Save to localStorage
                saveToLocalStorage();

                console.log('CSV validated successfully:', {
                    headers: headers,
                    originalTopics: originalRowCount,
                    totalEntries: totalEntries,
                    fileSize: fileSize
                });
            };
            reader.readAsText(file);
        }
    });

    generateVideosBtn.addEventListener('click', function() {
        const count = selectedRows.size;
        const selectedIndices = Array.from(selectedRows);
        const selectedTopics = selectedIndices.map(index => csvData[index]);

        // Add selected topics to processing queue with full data
        selectedTopics.forEach(topicData => {
            const processingItem = createProcessingItem(topicData);
            processingData.push(processingItem);
        });

        // Remove selected topics from csvData (sort indices descending to avoid index issues)
        selectedIndices.sort((a, b) => b - a).forEach(index => {
            csvData.splice(index, 1);
        });

        // Clear selection and refresh tables
        selectedRows.clear();
        updateSelectionCount();
        populateTable();
        populateProcessingTable();

        // Save to localStorage
        saveToLocalStorage();

        // Switch to Processing tab
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        document.querySelector('[data-tab="processing"]').classList.add('active');
        document.getElementById('processing-tab').classList.add('active');

        console.log(`Moved ${count} topics to processing queue:`, selectedTopics);

        // Automatically start script generation for all newly added items
        const startIndex = processingData.length - selectedTopics.length;
        for (let i = startIndex; i < processingData.length; i++) {
            processScriptGeneration(processingData[i], i);
        }
    });

    clearStorageBtn.addEventListener('click', function() {
        const confirmMessage = 'Are you sure you want to clear all saved data from memory? This will remove all topics and cannot be undone.';

        if (confirm(confirmMessage)) {
            clearLocalStorage();
            csvData = [];
            processingData = [];
            nextProcessingId = 1;
            usedTopicIds.clear();
            selectedRows.clear();
            populateTable();
            populateProcessingTable();
            updateSelectionCount();

            fileInfo.innerHTML = `
                <div style="text-align: center;">
                    <span style="color: #ff8800; font-weight: bold;">MEMORY CLEARED</span><br>
                    <span style="color: var(--text-secondary);">All saved data has been removed</span>
                </div>
            `;
            fileInfo.classList.add('show');

            // Hide the message after 3 seconds
            setTimeout(() => {
                fileInfo.classList.remove('show');
            }, 3000);
        }
    });

    // Processing selection controls
    selectAllProcessingBtn.addEventListener('click', function() {
        const checkboxes = processingTable.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach((checkbox, index) => {
            checkbox.checked = true;
            selectedProcessingRows.add(index);
            checkbox.closest('tr').classList.add('selected');
        });
        updateProcessingSelectionCount();
    });

    deselectAllProcessingBtn.addEventListener('click', function() {
        const checkboxes = processingTable.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            checkbox.closest('tr').classList.remove('selected');
        });
        selectedProcessingRows.clear();
        updateProcessingSelectionCount();
    });

    selectAllProcessingCheckbox.addEventListener('change', function() {
        if (this.checked) {
            selectAllProcessingBtn.click();
        } else {
            deselectAllProcessingBtn.click();
        }
    });

    // Cancel functionality
    cancelSelectedBtn.addEventListener('click', function() {
        cancelModal.style.display = 'block';
    });

    bringBackBtn.addEventListener('click', function() {
        const selectedIndices = Array.from(selectedProcessingRows);
        const itemsToRestore = selectedIndices.map(index => processingData[index]);

        // Add back to pending topics
        itemsToRestore.forEach(item => {
            if (item.fullData) {
                csvData.push(item.fullData);
            }
        });

        // Remove from processing (sort descending to avoid index issues)
        selectedIndices.sort((a, b) => b - a).forEach(index => {
            processingData.splice(index, 1);
        });

        // Clear selection and refresh
        selectedProcessingRows.clear();
        populateTable();
        populateProcessingTable();
        updateProcessingSelectionCount();
        saveToLocalStorage();

        cancelModal.style.display = 'none';
    });

    deletePermanentlyBtn.addEventListener('click', function() {
        const selectedIndices = Array.from(selectedProcessingRows);

        // Remove from processing (sort descending to avoid index issues)
        selectedIndices.sort((a, b) => b - a).forEach(index => {
            processingData.splice(index, 1);
        });

        // Clear selection and refresh
        selectedProcessingRows.clear();
        populateProcessingTable();
        updateProcessingSelectionCount();
        saveToLocalStorage();

        cancelModal.style.display = 'none';
    });

    cancelModalBtn.addEventListener('click', function() {
        cancelModal.style.display = 'none';
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === cancelModal) {
            cancelModal.style.display = 'none';
        }
    });

    // API Key Management
    saveApiKeyBtn.addEventListener('click', function() {
        const apiKey = openaiApiKeyInput.value.trim();
        if (apiKey) {
            openaiApiKey = apiKey;
            saveToLocalStorage();
            updateApiStatus('saved');
            populateProcessingTable(); // Refresh to show Generate buttons
        }
    });

    testApiKeyBtn.addEventListener('click', async function() {
        updateApiStatus('testing');
        try {
            const response = await fetch('https://api.openai.com/v1/models', {
                headers: {
                    'Authorization': `Bearer ${openaiApiKey}`
                }
            });

            if (response.ok) {
                updateApiStatus('success');
            } else {
                updateApiStatus('error');
            }
        } catch (error) {
            updateApiStatus('error');
        }
    });

    // ElevenLabs API Management
    saveElevenlabsKeyBtn.addEventListener('click', function() {
        const apiKey = elevenlabsApiKeyInput.value.trim();
        if (apiKey) {
            elevenlabsApiKey = apiKey;
            saveToLocalStorage();
            updateElevenlabsStatus('saved');
        }
    });


    saveVoiceIdBtn.addEventListener('click', function() {
        const voiceId = elevenlabsVoiceIdInput.value.trim();
        if (voiceId) {
            elevenlabsVoiceId = voiceId;
            saveToLocalStorage();
        }
    });

    // Late API Management
    saveLateKeyBtn.addEventListener('click', function() {
        const apiKey = lateApiKeyInput.value.trim();
        if (apiKey) {
            lateApiKey = apiKey;
            saveToLocalStorage();
            updateLateStatus('saved');
        }
    });

    testLateKeyBtn.addEventListener('click', async function() {
        updateLateStatus('testing');
        try {
            const response = await fetch('https://getlate.dev/api/v1/usage-stats', {
                headers: {
                    'Authorization': `Bearer ${lateApiKey}`
                }
            });

            if (response.ok) {
                updateLateStatus('success');
            } else {
                updateLateStatus('error');
            }
        } catch (error) {
            updateLateStatus('error');
        }
    });

    // Leonardo API Management
    saveLeonardoKeyBtn.addEventListener('click', function() {
        const apiKey = leonardoApiKeyInput.value.trim();
        if (apiKey) {
            leonardoApiKey = apiKey;
            saveToLocalStorage();
            updateLeonardoStatus('saved');
            populateProcessingTable(); // Refresh to show Generate buttons
            // Show test generation button if we have an API key
            if (leonardoApiKey) {
                testGenerateBtn.style.display = 'inline-block';
            }
        }
    });

    // Leonardo model selection
    leonardoModelSelect.addEventListener('change', function() {
        selectedLeonardoModel = leonardoModelSelect.value;
        saveToLocalStorage();
    });

    // Leonardo alchemy toggle
    leonardoAlchemyToggle.addEventListener('change', function() {
        leonardoAlchemyEnabled = leonardoAlchemyToggle.checked;
        saveToLocalStorage();
    });

    // Test prompt input changes
    testPromptInput.addEventListener('input', function() {
        if (leonardoApiKey && testPromptInput.value.trim()) {
            testGenerateBtn.style.display = 'inline-block';
        } else {
            testGenerateBtn.style.display = 'none';
        }
    });

    // Test image generation
    testGenerateBtn.addEventListener('click', async function() {
        const prompt = testPromptInput.value.trim();
        if (!prompt || !leonardoApiKey) {
            return;
        }

        testStatus.textContent = 'Generating test image...';
        testStatus.style.color = '#ff8800';
        testImageResult.style.display = 'block';
        testImage.style.display = 'none';
        testGenerateBtn.disabled = true;
        testGenerateBtn.textContent = 'Generating...';

        try {
            // Validate API key format
            if (!leonardoApiKey || leonardoApiKey.length < 10) {
                throw new Error('Invalid API key format. Please check your Leonardo.ai API key.');
            }

            console.log('Making Leonardo API request with model:', selectedLeonardoModel);

            // Call Leonardo.ai API
            const requestBody = {
                prompt: prompt,
                modelId: selectedLeonardoModel,
                width: 1024,
                height: 576,  // 16:9 aspect ratio
                num_images: 1,
                presetStyle: 'CINEMATIC'
            };

            // Only add alchemy if enabled
            if (leonardoAlchemyEnabled) {
                requestBody.alchemy = true;
            }

            console.log('Request body:', requestBody);

            const response = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'authorization': `Bearer ${leonardoApiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`API error: ${response.status} - ${errorText}`);
            }

            const result = await response.json();
            const generationId = result.sdGenerationJob.generationId;

            // Poll for completion
            testStatus.textContent = 'Processing image (this may take 30-60 seconds)...';
            let imageUrl = null;
            let attempts = 0;
            const maxAttempts = 30; // 60 seconds max

            while (!imageUrl && attempts < maxAttempts) {
                attempts++;
                await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

                const pollResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${generationId}`, {
                    headers: {
                        'accept': 'application/json',
                        'authorization': `Bearer ${leonardoApiKey}`
                    }
                });

                if (pollResponse.ok) {
                    const pollData = await pollResponse.json();
                    if (pollData.generations_by_pk && pollData.generations_by_pk.status === 'COMPLETE') {
                        if (pollData.generations_by_pk.generated_images && pollData.generations_by_pk.generated_images.length > 0) {
                            imageUrl = pollData.generations_by_pk.generated_images[0].url;
                        }
                    }
                }
            }

            if (imageUrl) {
                testStatus.textContent = 'Image generated successfully!';
                testStatus.style.color = '#008000';
                testImage.src = imageUrl;
                testImage.style.display = 'block';
            } else {
                throw new Error('Generation timed out or failed');
            }

        } catch (error) {
            console.error('Test generation error:', error);
            testStatus.textContent = `Error: ${error.message}`;
            testStatus.style.color = '#cc0000';
            testImage.style.display = 'none';
        } finally {
            testGenerateBtn.disabled = false;
            testGenerateBtn.textContent = 'Generate Test Image';
        }
    });


    // Global function for inline script generation
    window.generateScriptForItem = async function(index) {
        if (index >= 0 && index < processingData.length) {
            await processScriptGeneration(processingData[index], index);
        }
    };

    // Global function for inline image generation
    window.generateImagesForItem = async function(index) {
        if (index >= 0 && index < processingData.length) {
            await generateImages(processingData[index]);
        }
    };

    // Global function to retry failed images only
    window.retryFailedImages = async function(index) {
        if (index >= 0 && index < processingData.length) {
            const item = processingData[index];
            console.log(`Retrying failed images for ${item.topic}`);
            await generateImages(item, true);  // true = retry only missing images
        }
    };

    // Refresh processing status
    async function refreshProcessingStatus() {
        console.log('Refreshing processing status...');

        if (typeof require === 'undefined') {
            console.warn('Refresh only works in Electron environment');
            return;
        }

        const { ipcRenderer } = require('electron');
        const itemsToGenerateImages = [];

        for (let i = 0; i < processingData.length; i++) {
            const item = processingData[i];

            if (!item.outputDir) continue;

            try {
                const result = await ipcRenderer.invoke('check-processing-status', {
                    outputDir: item.outputDir,
                    topicId: item.id
                });

                if (result.success) {
                    const { status } = result;
                    const wasScriptWaiting = item.script === 'waiting...';

                    // Update script status
                    if (status.hasScript && item.script !== 'done') {
                        item.script = 'done';

                        // If script just became done and images are still waiting, mark for auto-generation
                        if (wasScriptWaiting && item.image === 'waiting...' && status.imageCount === 0) {
                            itemsToGenerateImages.push(item);
                            console.log(`Marked ${item.topic} for auto image generation`);
                        }
                    }

                    // First, try to determine total scenes from CSV if not already set
                    if (status.hasScript && !item.totalScenes) {
                        try {
                            const csvResult = await ipcRenderer.invoke('read-csv-file', {
                                outputDir: item.outputDir,
                                topicId: item.id
                            });
                            if (csvResult.success) {
                                const scenes = parseCSVContent(csvResult.content);
                                item.totalScenes = scenes.length;
                            }
                        } catch (error) {
                            console.error('Error reading CSV for scene count:', error);
                        }
                    }

                    // Update image status
                    if (status.imageCount > 0) {
                        if (item.totalScenes) {
                            if (status.imageCount === item.totalScenes) {
                                item.image = 'done';
                            } else {
                                // Use the X/Y done format for partial completion
                                item.image = `${status.imageCount}/${item.totalScenes} done`;
                            }
                        } else {
                            item.image = `${status.imageCount} images`;
                        }
                    } else if (status.hasScript && item.image === 'waiting...' && !itemsToGenerateImages.includes(item)) {
                        // Script exists but no images yet, mark for generation
                        itemsToGenerateImages.push(item);
                        console.log(`Marked ${item.topic} for auto image generation (script exists)`);
                    }

                    // Update audio status
                    if (status.audioCount > 0) {
                        if (item.totalScenes && status.audioCount === item.totalScenes) {
                            item.voiceOvers = 'done';
                        } else {
                            item.voiceOvers = `${status.audioCount} audios`;
                        }
                    }

                    // Update video status
                    if (status.hasVideo) {
                        item.video = 'done';
                    }

                    // Update posting status
                    if (status.hasScript && status.imageCount > 0 && status.audioCount > 0 && status.hasVideo) {
                        item.posting = 'ready to schedule';
                    }
                }
            } catch (error) {
                console.error(`Error checking status for ${item.topic}:`, error);
            }
        }

        populateProcessingTable();
        saveToLocalStorage();

        // Auto-generate images for items that have scripts but no images
        if (itemsToGenerateImages.length > 0) {
            console.log(`Starting auto image generation for ${itemsToGenerateImages.length} items`);
            for (const item of itemsToGenerateImages) {
                console.log(`Auto-generating images for ${item.topic}`);
                await generateImages(item);
            }
        }
    }

    // Add refresh button event listener
    const refreshStatusBtn = document.getElementById('refresh-status-btn');
    if (refreshStatusBtn) {
        refreshStatusBtn.addEventListener('click', refreshProcessingStatus);
    }

    // Load data from localStorage on page load
    loadFromLocalStorage();
    updateSelectionCount();
    updateProcessingSelectionCount();
});