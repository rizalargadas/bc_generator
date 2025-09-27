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
    const pauseSelectedBtn = document.getElementById('pause-selected-btn');
    const continueSelectedBtn = document.getElementById('continue-selected-btn');
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
    const testVoiceInput = document.getElementById('test-voice-input');
    const testVoiceBtn = document.getElementById('test-voice-btn');
    const testVoiceResult = document.getElementById('test-voice-result');
    const testVoiceStatus = document.getElementById('test-voice-status');
    const testAudio = document.getElementById('test-audio');
    const leonardoStatus = document.getElementById('leonardo-status');
    const longScriptWordsInput = document.getElementById('long-script-words');
    const saveScriptConfigBtn = document.getElementById('save-script-config');
    const currentWordCountSpan = document.getElementById('current-word-count');
    const selectionCount = document.getElementById('selection-count');
    const selectAllBtn = document.getElementById('select-all-btn');
    const deselectAllBtn = document.getElementById('deselect-all-btn');
    const generateVideosBtn = document.getElementById('generate-videos-btn');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const clearStorageBtn = document.getElementById('clear-storage-btn');
    const selectAllCheckbox = document.getElementById('select-all-checkbox');

    // Calendar elements
    const calendarDays = document.getElementById('calendar-days');
    const currentMonthElement = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const todayBtn = document.getElementById('today-btn');
    const selectedDayPosts = document.getElementById('selected-day-posts');

    // Scheduling configuration elements
    const weekdayScheduleTimeInput = document.getElementById('weekday-schedule-time');
    const weekendScheduleTimeInput = document.getElementById('weekend-schedule-time');
    const saveScheduleConfigBtn = document.getElementById('save-schedule-config');
    const currentWeekdayTimeSpan = document.getElementById('current-weekday-time');
    const currentWeekendTimeSpan = document.getElementById('current-weekend-time');

    // History elements
    const historyTable = document.getElementById('history-table');
    const historyCount = document.getElementById('history-count');
    const selectAllHistoryBtn = document.getElementById('select-all-history-btn');
    const deselectAllHistoryBtn = document.getElementById('deselect-all-history-btn');
    const deleteHistoryBtn = document.getElementById('delete-history-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const selectAllHistoryCheckbox = document.getElementById('select-all-history-checkbox');
    const noHistoryData = document.getElementById('no-history-data');

    let csvData = [];
    let selectedRows = new Set();
    let processingData = [];
    let selectedProcessingRows = new Set();
    let pausedItems = new Set(); // Track paused processing items
    let historyData = []; // Store completed/scheduled videos
    let selectedHistoryRows = new Set();
    let nextProcessingId = 1;
    let usedTopicIds = new Set();
    let openaiApiKey = '';
    let elevenlabsApiKey = '';
    let elevenlabsVoiceId = '';
    let lateApiKey = '';
    let leonardoApiKey = '';
    let selectedLeonardoModel = 'de7d3faf-762f-48e0-b3b7-9d0ac3a3fcf3'; // Default to Leonardo Phoenix 1.0
    let leonardoAlchemyEnabled = false; // Default to disabled to save credits
    let longScriptWordCount = 6000; // Default word count for Long videos

    // Calendar state
    let currentDate = new Date();
    let selectedDate = null;
    let scheduledPosts = []; // This will store scheduled posts data

    // Scheduling configuration
    let weekdayScheduleTime = '21:00'; // Default 9:00 PM for weekdays
    let weekendScheduleTime = '13:00'; // Default 1:00 PM for weekends

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
            // Remove emoji ranges and other problematic Unicode
            .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
            .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols
            .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport
            .replace(/[\u{1F700}-\u{1F77F}]/gu, '') // Alchemical Symbols
            .replace(/[\u{1F780}-\u{1F7FF}]/gu, '') // Geometric Shapes Extended
            .replace(/[\u{1F800}-\u{1F8FF}]/gu, '') // Supplemental Arrows-C
            .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
            .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
            .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
            .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
            .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
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

    // Convert Long script to Shorts script
    async function convertLongToShorts(longScriptData, topic, info) {
        if (!openaiApiKey) {
            throw new Error('OpenAI API key not configured');
        }

        console.log(`Converting Long script to Shorts for: ${topic}`);

        const prompt = `You are an expert YouTube Shorts adapter specializing in converting long-form content into engaging, fast-paced short videos.

Convert this long-form script into a YouTube Shorts version with metadata optimized for viral reach.

ORIGINAL LONG SCRIPT:
${longScriptData}

TOPIC: ${topic}
ADDITIONAL INFO: ${info || 'N/A'}

CONVERSION REQUIREMENTS:
1. SCRIPT CONVERSION:
- Keep the EXACT SAME number of scenes as the original
- Maintain the same scene structure and image descriptions
- Condense the narration to be punchy, fast-paced, and hook-driven
- Target 400-500 words total
- Keep the most compelling, dramatic moments
- Use short, impactful sentences perfect for Shorts format
- Maintain the dark, mysterious tone but make it more urgent
- Keep all scene numbers and image descriptions identical

2. GENERATE METADATA:
- YouTube Title: Create a compelling, clickbait-style title (max 100 chars) that hooks viewers instantly
- YouTube Description: Write a brief, engaging description (2-3 sentences) with hashtags #Shorts #BlackChapter - DO NOT include timestamps
- YouTube Tags: Generate 10-15 relevant tags separated by commas, including "shorts", "black chapter", topic keywords
- TikTok/IG Caption: Create a punchy caption with trending hashtags and a call-to-action (NO EMOJIS - plain text only)

Return ONLY a JSON object with this EXACT structure:
{
  "csv_content": "Scene,Narration,Image Description\\n1,narration text,image description\\n2,narration text,image description",
  "metadata": {
    "youtube_title": "Your compelling title here",
    "youtube_description": "Your description with #hashtags",
    "youtube_tags": "tag1, tag2, tag3, shorts, black chapter",
    "social_caption": "Your TikTok/IG caption with #hashtags (NO EMOJIS)"
  }
}`;

        try {
            console.log('🤖 Calling OpenAI API for Shorts conversion...');
            console.log(`📊 Prompt length: ${prompt.length} characters`);
            console.log(`🔑 API Key configured: ${openaiApiKey ? 'Yes' : 'No'}`);

            const requestBody = {
                model: 'gpt-4',
                messages: [{ role: 'user', content: prompt }],
                max_tokens: 2000,
                temperature: 0.8
            };

            console.log('📤 Sending request to OpenAI...');

            // Add timeout to prevent hanging
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('OpenAI request timeout after 60 seconds')), 60000);
            });

            const fetchPromise = fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openaiApiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            const response = await Promise.race([fetchPromise, timeoutPromise]);

            console.log(`📥 OpenAI response status: ${response.status}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`❌ OpenAI API error details: ${errorText}`);
                throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
            }

            console.log('📝 Parsing OpenAI response...');
            const data = await response.json();

            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                console.error('❌ Invalid OpenAI response structure:', data);
                throw new Error('Invalid response from OpenAI API');
            }

            const shortsScriptContent = data.choices[0].message.content.trim();
            console.log(`✅ Shorts script conversion completed, result length: ${shortsScriptContent.length} characters`);

            // Try to parse as JSON
            try {
                const parsedResponse = JSON.parse(shortsScriptContent);

                if (!parsedResponse.csv_content || !parsedResponse.metadata) {
                    throw new Error('Response missing required fields (csv_content or metadata)');
                }

                console.log(`✅ Parsed response with metadata:`);
                console.log(`   - Title: ${parsedResponse.metadata.youtube_title}`);
                console.log(`   - Tags: ${parsedResponse.metadata.youtube_tags}`);

                return parsedResponse;
            } catch (parseError) {
                console.error('Failed to parse JSON response:', parseError);
                // Fall back to treating it as plain CSV for backward compatibility
                if (shortsScriptContent.includes('Scene') && shortsScriptContent.includes(',')) {
                    console.log('Falling back to plain CSV format (no metadata)');
                    return {
                        csv_content: shortsScriptContent,
                        metadata: null
                    };
                }
                throw new Error('Response is neither valid JSON nor CSV format');
            }

        } catch (error) {
            console.error('Error converting to Shorts:', error);
            throw error;
        }
    }

    // OpenAI Script Generation
    async function generateScript(topic, info, ytType = 'Long') {
        if (!openaiApiKey) {
            throw new Error('OpenAI API key not configured');
        }

        // Check if this item is paused
        const topicId = topic.replace(/[^a-zA-Z0-9]/g, '_') + (ytType === 'Shorts' ? '_S' : '_L');
        if (pausedItems.has(topicId)) {
            console.log(`⏸️ Script generation paused for ${topic}`);
            return { scenes: [], paused: true }; // Return a paused indicator
        }

        const isShort = ytType === 'Shorts';
        const targetWords = isShort ? 400 : longScriptWordCount;  // Use configurable word count for Long videos
        const sceneCount = isShort ? 4 : 10;

        console.log(`📝 Script generation for ${ytType}: Target words = ${targetWords} (configured: ${longScriptWordCount})`);

        const prompt = `You are an award-winning narrative architect and YouTube strategy expert specializing in faceless, AI-narrated, content (True Crime, Dark History, Mysteries, Creepy Happenings) that maximizes audience retention and growth. You craft meticulously-researched, vividly-told scripts that create an eerie yet factual journey into humanity's darkest chapters.

Write an immersive, narrative-driven YouTube ${isShort ? 'Shorts' : 'Long-form'} script on:
📌 TOPIC: ${topic}

Short Info About the Topic: ${info}

🎯 CRITICAL WORD COUNT REQUIREMENT:
- The TOTAL combined script content across ALL scenes must be EXACTLY ${targetWords} words (±50 words tolerance)
- Each scene should contain approximately ${Math.floor(targetWords / sceneCount)} words of actual narration script
- Only count words in the "script" field - titles and image prompts don't count toward word limit
- Write FULL, COMPLETE scripts - not summaries or outlines

Create ${sceneCount} distinct scenes with DETAILED, COMPLETE narration. ${isShort ? 'For Shorts, focus on immediate hook and rapid pacing.' : 'Use suspenseful but calm, authoritative language to build curiosity and maintain an unsettling yet factual tone.'}

The script should conclude with a haunting/hooky outro line/scene. Stay strictly within verified facts and note if the topic warrants a multi-part series. Your goal: craft an unforgettable, cinematic narrative experience that keeps viewers watching to the end — and eager for the next dark chapter.

⚠️ MANDATORY WORD COUNT CHECK: Before submitting your response, manually count the words in ALL "script" fields combined. The total must be ${targetWords} words (±50). If you're short, add more descriptive detail, atmosphere, background information, and narrative depth. If you're over, trim unnecessary words while maintaining impact and flow.

For each scene's image prompt, ensure they are:
- Written in clear, descriptive English
- Appropriate for OpenAI/DALL-E and compliant with their community standards
- Visually accurate and aligned with the events and atmosphere of the script
- Consistent in describing any recurring or prominent characters (describe their age, gender, clothing, and other distinctive features clearly and use the same description throughout all scenes where they appear)
- Include the mood, time of day, setting, and any relevant props or details to make the image atmospheric and relevant to the story

IMPORTANT: Use only plain ASCII text. Avoid special characters, smart quotes, em-dashes, or any Unicode characters. Use simple punctuation only (periods, commas, apostrophes, hyphens, quotes).

🎯 FINAL REMINDER: The combined word count of ALL "script" fields must total ${targetWords} words (±50). Count them before submitting!

Additionally, generate metadata for YouTube and social media, plus thumbnail prompts:

For ${isShort ? 'YouTube Shorts' : 'Long-form YouTube video'}:
- YouTube Title: An engaging, click-worthy title (max 100 characters)
- YouTube Description: A compelling description with key points and call-to-action (200-500 words) - DO NOT include timestamps
- YouTube Tags: Exactly 30 relevant, comma-separated tags for SEO

${isShort ? `For TikTok/Instagram:
- Social Caption: An engaging caption for TikTok/IG including relevant hashtags like #tiktok #instagram #shorts #mystery #truecrime etc (max 150 characters, NO EMOJIS - plain text only)` : ''}

For YouTube Thumbnail (CRITICAL - Dark History CTR Strategy):
You are a dark-history YouTube thumbnail strategist, expert in crafting scroll-stopping visuals and text for maximum CTR (click-through rate).

Step 1: Craft a vivid, cinematic AI image prompt for Leonardo.ai to generate a YouTube thumbnail for this video script. The image must evoke mystery, eeriness, and curiosity while remaining compliant with platform guidelines. Include a close-up of a human face or the most striking subject of the story. Use dramatic, descriptive language (mood, lighting, emotion, setting) in one sentence — no text on the image.

Step 2: Create 6-8 short, eerie, clickbait-worthy thumbnail captions (max 6 words each) in a mix of questions, statements, and shocking facts — in the style of: "The Great Disaster of 2025", "Creepiest Things in Vatican", "She is 800 Million Years Old", etc. Your goal: maximize intrigue and clicks while staying on brand.

Format your response as JSON with this exact structure:
{
  "scenes": [
    {
      "scene_number": 1,
      "title": "Scene Title",
      "script": "The COMPLETE full script narration for this scene - approximately ${Math.floor(targetWords / sceneCount)} words",
      "image_prompt": "Detailed image generation prompt for this scene"
    }
  ],
  "metadata": {
    "youtube_title": "Engaging YouTube title",
    "youtube_description": "Detailed YouTube description",
    "youtube_tags": "tag1, tag2, tag3... (30 tags total)"${isShort ? `,
    "social_caption": "TikTok/IG caption with hashtags (NO EMOJIS)"` : ''}
  },
  "thumbnail": {
    "image_prompt": "A vivid, cinematic AI image prompt for Leonardo.ai showing [describe the most striking visual from the story with dramatic mood, lighting, emotion, and setting - no text on image]",
    "text_options": ["Option 1 (max 6 words)", "Option 2 (max 6 words)", "Option 3 (max 6 words)", "Option 4 (max 6 words)", "Option 5 (max 6 words)", "Option 6 (max 6 words)", "Option 7 (max 6 words)", "Option 8 (max 6 words)"]
  }
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

                    // Verify word count
                    const totalWords = parsedData.scenes.reduce((total, scene) => {
                        const wordCount = scene.script ? scene.script.split(/\s+/).filter(word => word.length > 0).length : 0;
                        return total + wordCount;
                    }, 0);

                    console.log(`📊 Script word count verification:`);
                    console.log(`- Target: ${targetWords} words`);
                    console.log(`- Actual: ${totalWords} words`);
                    console.log(`- Difference: ${totalWords - targetWords} words (${((totalWords / targetWords) * 100).toFixed(1)}% of target)`);

                    const tolerance = Math.max(50, targetWords * 0.1); // 10% tolerance or 50 words minimum
                    if (Math.abs(totalWords - targetWords) > tolerance) {
                        console.warn(`⚠️ Word count significantly off target! Expected ~${targetWords}, got ${totalWords}`);
                    } else {
                        console.log(`✅ Word count within acceptable range`);
                    }
                }

                // Clean metadata if present
                if (parsedData.metadata) {
                    parsedData.metadata = {
                        youtube_title: cleanText(parsedData.metadata.youtube_title || ''),
                        youtube_description: cleanText(parsedData.metadata.youtube_description || ''),
                        youtube_tags: cleanText(parsedData.metadata.youtube_tags || ''),
                        social_caption: cleanText(parsedData.metadata.social_caption || '')
                    };
                }

                // Clean thumbnail data if present
                if (parsedData.thumbnail) {
                    parsedData.thumbnail = {
                        image_prompt: cleanText(parsedData.thumbnail.image_prompt || ''),
                        text_options: parsedData.thumbnail.text_options ?
                            parsedData.thumbnail.text_options.map(option => cleanText(option)) : []
                    };
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

    async function generateCSV(topic, topicId, scriptData, ytType = 'Long') {
        const isShort = ytType === 'Shorts';

        // Determine headers based on video type (now includes thumbnail columns)
        const headers = isShort ?
            ['Scene #', 'Script for Voice Over', 'Image Generation Prompt', 'YT Title', 'YT Description', 'YT Tags', 'TikTok/IG Caption', 'Thumbnail Image Prompt', 'Thumbnail Text'] :
            ['Scene #', 'Script for Voice Over', 'Image Generation Prompt', 'YT Title', 'YT Description', 'YT Tags', 'Thumbnail Image Prompt', 'Thumbnail Text'];

        const rows = [headers];

        // Add scene data rows
        scriptData.scenes.forEach((scene, index) => {
            const row = [
                scene.scene_number,
                scene.script.trim(),
                scene.image_prompt
            ];

            // Add metadata only to the first row
            if (index === 0 && scriptData.metadata) {
                row.push(
                    scriptData.metadata.youtube_title || '',
                    scriptData.metadata.youtube_description || '',
                    scriptData.metadata.youtube_tags || ''
                );

                if (isShort) {
                    row.push(scriptData.metadata.social_caption || '');
                }

                // Add thumbnail data to first row
                if (scriptData.thumbnail) {
                    row.push(
                        scriptData.thumbnail.image_prompt || '',
                        scriptData.thumbnail.text_options ? scriptData.thumbnail.text_options.join(' | ') : ''
                    );
                } else {
                    row.push('', ''); // Empty thumbnail columns
                }
            } else {
                // Empty cells for metadata columns in subsequent rows
                row.push('', '', '');
                if (isShort) {
                    row.push('');
                }
                // Empty thumbnail columns for subsequent rows
                row.push('', '');
            }

            rows.push(row);
        });

        const csvContent = rows.map(row =>
            row.map(cell => {
                // Safety check for undefined/null values
                const cellValue = (cell !== undefined && cell !== null) ? cell.toString() : '';
                return `"${cellValue.replace(/"/g, '""')}"`;
            }).join(',')
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

    // Generate voice overs using ElevenLabs API
    async function generateVoiceOvers(processingItem, retryOnly = false) {
        if (!elevenlabsApiKey) {
            throw new Error('ElevenLabs API key not configured');
        }

        if (!elevenlabsVoiceId) {
            throw new Error('ElevenLabs Voice ID not configured');
        }

        // Check if this item is paused
        if (pausedItems.has(processingItem.id)) {
            console.log(`⏸️ Voice generation paused for ${processingItem.topic}`);
            processingItem.voiceOvers = 'paused';
            populateProcessingTable();
            saveToLocalStorage();
            return; // Exit gracefully without error
        }

        if (!processingItem.outputDir) {
            throw new Error('Output directory not found');
        }

        console.log(`🎤 Starting voice generation for: ${processingItem.topic}`);
        console.log(`🔍 Voice generation called with retryOnly: ${retryOnly}`);
        console.log(`📂 Processing item details:`, {
            id: processingItem.id,
            topic: processingItem.topic,
            ytType: processingItem.ytType,
            outputDir: processingItem.outputDir,
            totalScenes: processingItem.totalScenes
        });

        try {
            // Read the CSV file to get script content
            const { ipcRenderer } = require('electron');
            const csvResult = await ipcRenderer.invoke('read-csv-file', {
                outputDir: processingItem.outputDir,
                topicId: processingItem.id
            });

            if (!csvResult.success) {
                throw new Error(`Could not read script: ${csvResult.error}`);
            }

            console.log(`📄 CSV file read successfully, length: ${csvResult.content.length} characters`);
            const scenes = parseCSVContent(csvResult.content);
            console.log(`📝 Found ${scenes.length} scenes to generate voice for`);

            // Log first scene as example
            if (scenes.length > 0) {
                console.log(`📋 First scene preview:`, {
                    sceneNumber: scenes[0].sceneNumber,
                    scriptLength: scenes[0].script?.length || 0,
                    scriptPreview: scenes[0].script?.substring(0, 100) + '...',
                    imagePrompt: scenes[0].imagePrompt?.substring(0, 50) + '...'
                });
            }

            // Check which audio files already exist if retrying
            let existingAudioNumbers = [];
            let existingCount = 0;

            if (retryOnly) {
                const statusResult = await ipcRenderer.invoke('check-processing-status', {
                    outputDir: processingItem.outputDir,
                    topicId: processingItem.id
                });

                if (statusResult.success && statusResult.status.existingAudio) {
                    existingAudioNumbers = statusResult.status.existingAudio;
                    existingCount = existingAudioNumbers.length;
                    console.log(`🔄 Retry mode: ${existingCount} audio files already exist: [${existingAudioNumbers.join(', ')}]`);
                }
            }

            let successCount = existingCount;
            let failedScenes = [];

            // Update status to show we're working
            processingItem.voiceOvers = 'generating...';
            populateProcessingTable();

            for (const scene of scenes) {
                // Check if paused during loop
                if (pausedItems.has(processingItem.id)) {
                    console.log(`⏸️ Voice generation paused for ${processingItem.topic} at scene ${scene.sceneNumber}`);
                    processingItem.voiceOvers = `generating... (${i}/${scenes.length} done - paused)`;
                    populateProcessingTable();
                    saveToLocalStorage();
                    return; // Exit gracefully without error
                }

                const sceneNumber = parseInt(scene.sceneNumber);

                // Skip if already exists in retry mode
                if (retryOnly && existingAudioNumbers.includes(sceneNumber)) {
                    console.log(`⏭️ Skipping scene ${sceneNumber} - audio already exists`);
                    continue;
                }

                console.log(`🎧 Generating voice for scene ${sceneNumber}...`);

                const { ipcRenderer } = require('electron');
                let attemptCount = 0;
                let success = false;

                while (attemptCount < 3 && !success) {
                    attemptCount++;

                    try {
                        console.log(`🔄 Attempt ${attemptCount} for scene ${sceneNumber}`);

                        // Use ElevenLabs SDK via IPC
                        const voiceResult = await ipcRenderer.invoke('generate-voice', {
                            text: scene.script,
                            apiKey: elevenlabsApiKey,
                            voiceId: elevenlabsVoiceId,
                            sceneNumber: sceneNumber
                        });

                        if (!voiceResult.success) {
                            console.error(`❌ ElevenLabs voice generation error: ${voiceResult.error}`);
                            throw new Error(`ElevenLabs voice generation error: ${voiceResult.error}`);
                        }

                        console.log(`📦 Received audio data for scene ${sceneNumber}: ${voiceResult.fileSize} bytes`);

                        // Save audio file
                        const saveResult = await ipcRenderer.invoke('save-audio', {
                            audioBuffer: voiceResult.audioBuffer,
                            outputDir: processingItem.outputDir,
                            topicId: processingItem.id,
                            sceneNumber: sceneNumber
                        });

                        if (saveResult.success) {
                            console.log(`✅ Scene ${sceneNumber} audio saved: ${saveResult.audioPath}`);
                            successCount++;
                            success = true;
                        } else {
                            throw new Error(`Failed to save audio: ${saveResult.error}`);
                        }

                        // Small delay between requests to be nice to the API
                        await new Promise(resolve => setTimeout(resolve, 1000));

                    } catch (error) {
                        console.log(`💥 Attempt ${attemptCount} failed for scene ${sceneNumber}: ${error.message}`);

                        if (attemptCount < 3) {
                            // Wait before retry
                            if (error.message.includes('rate_limit') || error.message.includes('429')) {
                                console.log('⏳ Rate limited, waiting 5 seconds...');
                                await new Promise(resolve => setTimeout(resolve, 5000));
                            } else {
                                await new Promise(resolve => setTimeout(resolve, 2000));
                            }
                        }
                    }
                }

                if (!success) {
                    console.error(`❌ Failed to generate audio for scene ${sceneNumber} after 3 attempts`);
                    failedScenes.push(sceneNumber);
                }
            }

            console.log(`🎤 Voice generation completed: ${successCount}/${scenes.length} successful`);

            // Update status
            if (failedScenes.length === 0) {
                processingItem.voiceOvers = 'done';
                console.log(`✅ All voice overs generated successfully for ${processingItem.topic}`);
            } else {
                processingItem.voiceOvers = `${successCount}/${scenes.length} done`;
                console.log(`⚠️ Voice generation partially completed: ${failedScenes.length} scenes failed: [${failedScenes.join(', ')}]`);
            }

            populateProcessingTable();
            saveToLocalStorage();

        } catch (error) {
            console.error('Voice generation failed:', error);
            processingItem.voiceOvers = 'failed';
            processingItem.voiceError = error.message;
            populateProcessingTable();
            throw error;
        }
    }

    // Parse CSV content to extract scenes
    function parseCSVContent(csvContent) {
        const lines = csvContent.split('\n').filter(line => line.trim());
        const scenes = [];
        let thumbnailImagePrompt = null;

        // Parse header row to find column indices
        const headerParts = lines.length > 0 ? parseCSVLine(lines[0]) : [];
        const thumbnailImagePromptIndex = headerParts.findIndex(header =>
            header.toLowerCase().includes('thumbnail image prompt')
        );

        // Skip header row and process scenes
        for (let i = 1; i < lines.length; i++) {
            const parts = parseCSVLine(lines[i]);
            if (parts.length >= 3) {
                // Extract thumbnail prompt from first row only (metadata row)
                if (i === 1 && thumbnailImagePromptIndex !== -1 && parts[thumbnailImagePromptIndex]) {
                    thumbnailImagePrompt = parts[thumbnailImagePromptIndex].trim();
                }

                scenes.push({
                    sceneNumber: parts[0],
                    script: parts[1],
                    imagePrompt: parts[2]
                });
            }
        }

        // Add thumbnail prompt to the result
        scenes.thumbnailImagePrompt = thumbnailImagePrompt;
        return scenes;
    }

    // Generate images using Leonardo.ai
    async function generateImages(processingItem, retryOnly = false) {
        if (!processingItem.outputDir) {
            throw new Error('Output directory not found');
        }

        // Check if this item is paused
        if (pausedItems.has(processingItem.id)) {
            console.log(`⏸️ Image generation paused for ${processingItem.topic}`);
            processingItem.image = 'paused';
            populateProcessingTable();
            saveToLocalStorage();
            return; // Exit gracefully without error
        }

        // Handle Shorts videos by copying images from Long video
        if (processingItem.ytType === 'Shorts') {
            console.log(`Processing Shorts video: ${processingItem.id} - copying images from Long video`);

            const baseId = processingItem.id.replace('_S', '');
            const longId = baseId + '_L';
            const longItem = processingData.find(item => item.id === longId);

            if (!longItem || !longItem.outputDir) {
                throw new Error('Long video not found or has no output directory');
            }

            // Check if Long video image generation is completely done
            const { ipcRenderer } = require('electron');
            const longStatus = await ipcRenderer.invoke('check-processing-status', {
                outputDir: longItem.outputDir,
                topicId: longItem.id
            });

            if (!longStatus.success || longStatus.status.imageCount === 0) {
                throw new Error('Long video has no images to copy. Generate Long video images first.');
            }

            // Verify that Long video image generation is actually complete
            if (longItem.image !== 'Done') {
                throw new Error('Long video image generation is not complete yet. Wait for Long video to finish generating all images.');
            }

            // Additional check: ensure Long has all expected scene images
            if (longItem.totalScenes && longStatus.status.sceneImageCount < longItem.totalScenes) {
                throw new Error(`Long video image generation incomplete: ${longStatus.status.sceneImageCount}/${longItem.totalScenes} scenes. Wait for all Long video images to be generated.`);
            }

            console.log(`Copying ${longStatus.status.imageCount} images from Long to Shorts`);

            // Copy images from Long to Shorts
            const copyResult = await ipcRenderer.invoke('copy-images-long-to-shorts', {
                longOutputDir: longItem.outputDir,
                longTopicId: longItem.id,
                shortsOutputDir: processingItem.outputDir,
                shortsTopicId: processingItem.id
            });

            if (!copyResult.success) {
                throw new Error(`Failed to copy images: ${copyResult.error}`);
            }

            console.log(`Successfully copied ${copyResult.copiedCount} images for Shorts video`);

            // Copy brand images for Shorts
            const brandResult = await ipcRenderer.invoke('copy-brand-images', {
                outputDir: processingItem.outputDir,
                topicId: processingItem.id,
                videoType: 'Shorts'
            });

            if (brandResult.success) {
                console.log(`✅ Copied ${brandResult.copiedFiles.length} brand images for Shorts`);
            } else {
                console.warn(`⚠️ Failed to copy some brand images for Shorts:`, brandResult.errors);
            }

            // Update the processing item status
            processingItem.image = 'done';
            processingItem.totalScenes = copyResult.copiedCount;
            populateProcessingTable();
            saveToLocalStorage();

            // Automatically start voice generation for Shorts after images are copied
            console.log(`🎤 Images copied for Shorts ${processingItem.topic} - starting voice generation...`);
            console.log(`Voice generation prerequisites check:`);
            console.log(`- ElevenLabs API Key configured: ${elevenlabsApiKey ? 'YES' : 'NO'}`);
            console.log(`- ElevenLabs Voice ID configured: ${elevenlabsVoiceId ? 'YES' : 'NO'}`);

            if (!elevenlabsApiKey || !elevenlabsVoiceId) {
                console.warn(`❌ Voice generation skipped for Shorts: Missing ElevenLabs configuration`);
                processingItem.voiceOvers = 'config missing';
                populateProcessingTable();
                saveToLocalStorage();
            } else {
                try {
                    await generateVoiceOvers(processingItem);
                } catch (voiceError) {
                    console.error(`❌ Voice generation failed for Shorts ${processingItem.topic}:`, voiceError);
                    processingItem.voiceOvers = 'failed';
                    processingItem.voiceError = voiceError.message;
                    populateProcessingTable();
                    saveToLocalStorage();
                }
            }

            return; // Exit early for Shorts videos
        }

        // For Long videos, continue with regular image generation
        if (!leonardoApiKey) {
            throw new Error('Leonardo.ai API key not configured');
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
                // Check if paused during loop
                if (pausedItems.has(processingItem.id)) {
                    console.log(`⏸️ Image generation paused for ${processingItem.topic} at scene ${i + 1}`);
                    processingItem.image = `${i}/${scenes.length} done (paused)`;
                    populateProcessingTable();
                    saveToLocalStorage();
                    return; // Exit gracefully without error
                }

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
                // Generate thumbnail image for Long videos only
                if (processingItem.ytType === 'Long' && scenes.thumbnailImagePrompt) {
                    console.log(`🖼️ Generating thumbnail image for ${processingItem.topic}...`);
                    processingItem.image = 'generating thumbnail...';
                    populateProcessingTable();

                    try {
                        // Generate thumbnail using Leonardo.ai API
                        const thumbnailResponse = await fetch('https://cloud.leonardo.ai/api/rest/v1/generations', {
                            method: 'POST',
                            headers: {
                                'accept': 'application/json',
                                'content-type': 'application/json',
                                'authorization': `Bearer ${leonardoApiKey}`
                            },
                            body: JSON.stringify({
                                prompt: scenes.thumbnailImagePrompt,
                                modelId: selectedLeonardoModel,
                                width: 1024,
                                height: 576,  // 16:9 aspect ratio for YouTube thumbnails
                                num_images: 1,
                                ...(leonardoAlchemyEnabled && { alchemy: true })
                            })
                        });

                        if (!thumbnailResponse.ok) {
                            const errorText = await thumbnailResponse.text();
                            console.error('Thumbnail API Error Response:', errorText);
                            throw new Error(`Thumbnail API error: ${thumbnailResponse.status} - ${errorText}`);
                        }

                        const thumbnailResult = await thumbnailResponse.json();
                        const thumbnailGenerationId = thumbnailResult.sdGenerationJob.generationId;

                        // Poll for thumbnail completion
                        let thumbnailUrl = null;
                        let thumbnailAttempts = 0;
                        const maxThumbnailAttempts = 30;

                        while (!thumbnailUrl && thumbnailAttempts < maxThumbnailAttempts) {
                            thumbnailAttempts++;
                            await new Promise(resolve => setTimeout(resolve, 2000));

                            const thumbnailPollResponse = await fetch(`https://cloud.leonardo.ai/api/rest/v1/generations/${thumbnailGenerationId}`, {
                                headers: {
                                    'accept': 'application/json',
                                    'authorization': `Bearer ${leonardoApiKey}`
                                }
                            });

                            if (thumbnailPollResponse.ok) {
                                const thumbnailPollData = await thumbnailPollResponse.json();
                                if (thumbnailPollData.generations_by_pk &&
                                    thumbnailPollData.generations_by_pk.status === 'COMPLETE' &&
                                    thumbnailPollData.generations_by_pk.generated_images &&
                                    thumbnailPollData.generations_by_pk.generated_images.length > 0) {
                                    thumbnailUrl = thumbnailPollData.generations_by_pk.generated_images[0].url;
                                }
                            }
                        }

                        if (thumbnailUrl) {
                            console.log(`✅ Thumbnail generated successfully for ${processingItem.topic}`);

                            // Save thumbnail to topic folder root
                            const { ipcRenderer } = require('electron');
                            const thumbnailSaveResult = await ipcRenderer.invoke('save-thumbnail', {
                                imageUrl: thumbnailUrl,
                                outputDir: processingItem.outputDir,
                                fileName: 'thumbnail_to_edit.png'
                            });

                            if (thumbnailSaveResult.success) {
                                console.log(`💾 Thumbnail saved: ${thumbnailSaveResult.thumbnailPath}`);
                            } else {
                                console.error(`❌ Failed to save thumbnail: ${thumbnailSaveResult.error}`);
                            }
                        } else {
                            console.warn(`⚠️ Thumbnail generation timed out for ${processingItem.topic}`);
                        }

                    } catch (thumbnailError) {
                        console.error(`❌ Thumbnail generation failed for ${processingItem.topic}:`, thumbnailError);
                        // Continue with voice generation despite thumbnail failure
                    }
                } else if (processingItem.ytType === 'Long') {
                    console.log(`ℹ️ No thumbnail prompt found for ${processingItem.topic}, skipping thumbnail generation`);
                } else {
                    console.log(`ℹ️ Skipping thumbnail generation for Shorts video: ${processingItem.topic}`);
                }

                // Copy brand images for Long videos
                if (processingItem.ytType === 'Long' || !processingItem.ytType) {
                    const brandResult = await ipcRenderer.invoke('copy-brand-images', {
                        outputDir: processingItem.outputDir,
                        topicId: processingItem.id,
                        videoType: 'Long'
                    });

                    if (brandResult.success) {
                        console.log(`✅ Copied ${brandResult.copiedFiles.length} brand images for Long video`);
                    } else {
                        console.warn(`⚠️ Failed to copy some brand images for Long video:`, brandResult.errors);
                    }
                }

                processingItem.image = 'Done';

                // Automatically start voice generation when images are complete
                console.log(`🎤 Images complete for ${processingItem.topic} - starting voice generation...`);
                console.log(`📊 Image generation summary: ${successCount}/${scenes.length} images successful`);
                console.log(`Voice generation prerequisites check:`);
                console.log(`- ElevenLabs API Key configured: ${elevenlabsApiKey ? 'YES' : 'NO'}`);
                console.log(`- ElevenLabs Voice ID configured: ${elevenlabsVoiceId ? 'YES' : 'NO'}`);
                console.log(`- Processing item ID: ${processingItem.id}`);
                console.log(`- Output directory: ${processingItem.outputDir}`);

                if (!elevenlabsApiKey || !elevenlabsVoiceId) {
                    console.warn(`❌ Voice generation skipped: Missing ElevenLabs configuration`);
                    processingItem.voiceOvers = 'config missing';
                    populateProcessingTable();
                    saveToLocalStorage();
                } else {
                    try {
                        await generateVoiceOvers(processingItem);
                    } catch (voiceError) {
                        console.error(`❌ Voice generation failed for ${processingItem.topic}:`, voiceError);
                        processingItem.voiceOvers = 'failed';
                        processingItem.voiceError = voiceError.message;
                        populateProcessingTable();
                        saveToLocalStorage();
                    }
                }
            } else {
                // Don't show confusing ratios, just show generating status
                processingItem.image = 'generating...';
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

            let scriptData;

            if (processingItem.ytType === 'Shorts') {
                // For Shorts, find the corresponding Long video and convert its script
                console.log(`🔄 Starting Shorts script generation for: ${processingItem.topic}`);

                const baseId = processingItem.id.replace('_S', '');
                const longId = baseId + '_L';
                console.log(`📋 Looking for Long video with ID: ${longId}`);

                const longItem = processingData.find(item => item.id === longId);

                if (!longItem) {
                    throw new Error(`Long video with ID ${longId} not found in processing data`);
                }

                // Check if Long video script is still being written
                if (longItem.script === 'writing...' || longItem.script === 'pending') {
                    // Set Shorts to waiting status
                    processingItem.script = 'waiting';
                    populateProcessingTable();
                    console.log(`⏳ Shorts script set to 'waiting' - Long video script is still being generated`);
                    return; // Exit without error - will be processed later
                }

                if (longItem.script !== 'done') {
                    throw new Error(`Long video script status is '${longItem.script}' - must be 'done' before generating Shorts script`);
                }

                console.log(`✅ Found Long video: ${longItem.topic}, Output Dir: ${longItem.outputDir}`);

                // Read the Long script content
                console.log(`📖 Reading Long script content...`);
                const { ipcRenderer } = require('electron');
                const csvResult = await ipcRenderer.invoke('read-csv-file', {
                    outputDir: longItem.outputDir,
                    topicId: longItem.id
                });

                if (!csvResult.success) {
                    console.error(`❌ Failed to read Long script: ${csvResult.error}`);
                    throw new Error(`Could not read Long script: ${csvResult.error}`);
                }

                console.log(`📝 Long script content length: ${csvResult.content.length} characters`);
                console.log(`🔄 Starting OpenAI conversion to Shorts...`);

                // Convert Long script to Shorts
                const shortsResponse = await convertLongToShorts(csvResult.content, processingItem.topic, processingItem.fullData.Info);

                console.log(`✅ Shorts script conversion completed`);

                // Handle the response whether it's the new JSON format or legacy CSV
                let shortsScriptText;
                let metadata = null;

                if (shortsResponse.csv_content) {
                    // New JSON format with metadata
                    shortsScriptText = shortsResponse.csv_content;
                    metadata = shortsResponse.metadata;
                    console.log(`📊 Received metadata for Shorts video`);
                } else {
                    // Legacy format - plain CSV string
                    shortsScriptText = shortsResponse;
                    console.log(`📋 Using legacy CSV format (no metadata)`);
                }

                // Parse the converted script to get scene structure
                const parsedScenes = parseCSVContent(shortsScriptText);

                if (!parsedScenes || parsedScenes.length === 0) {
                    throw new Error('Failed to parse converted Shorts script - no scenes found');
                }

                // Convert to the format expected by generateCSV with validation
                const scenes = parsedScenes.map((scene, index) => {
                    if (!scene.sceneNumber || !scene.script || !scene.imagePrompt) {
                        console.warn(`Scene ${index + 1} missing required fields:`, scene);
                    }

                    return {
                        scene_number: scene.sceneNumber || `${index + 1}`,
                        script: scene.script || 'Missing script content',
                        image_prompt: scene.imagePrompt || 'Missing image prompt'
                    };
                });

                console.log(`Converted ${scenes.length} scenes for Shorts script`);
                scriptData = { scenes, metadata };

            } else {
                // For Long videos, generate new script
                scriptData = await generateScript(processingItem.topic, processingItem.fullData.Info, processingItem.ytType);
            }

            // Check if script generation was paused
            if (scriptData.paused) {
                processingItem.script = 'paused';
                populateProcessingTable();
                saveToLocalStorage();
                console.log(`Script generation paused for ${processingItem.topic}`);
                return; // Exit gracefully
            }

            const result = await generateCSV(processingItem.topic, processingItem.id, scriptData, processingItem.ytType);

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

                // If this was a Long video, check if there's a waiting Shorts
                if (processingItem.ytType === 'Long') {
                    const baseId = processingItem.id.replace('_L', '');
                    const shortsId = baseId + '_S';
                    const waitingShorts = processingData.find(item =>
                        item.id === shortsId && item.script === 'waiting'
                    );

                    if (waitingShorts) {
                        console.log(`📹 Found waiting Shorts for ${waitingShorts.topic}, starting script generation...`);
                        const shortsIndex = processingData.indexOf(waitingShorts);
                        // Start the Shorts script generation in the background
                        setTimeout(() => processScriptGeneration(waitingShorts, shortsIndex), 100);
                    }
                }

                // Automatically start image generation
                console.log(`Auto-starting image generation for ${processingItem.topic}`);
                await generateImages(processingItem);

                // Voice overs will be automatically generated after images complete

            } else {
                throw new Error('Failed to save CSV file');
            }
        } catch (error) {
            console.error(`💥 Script generation failed for ${processingItem.topic} (${processingItem.ytType}):`, error);
            console.error('📊 Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });

            processingItem.script = 'failed';
            populateProcessingTable();
            saveToLocalStorage();

            alert(`Script generation failed for "${processingItem.topic}" (${processingItem.ytType}): ${error.message}`);
        }
    }

    // Sync scheduled posts from both processing data and history data
    function syncScheduledPostsToCalendar() {
        // Initialize scheduled posts array if it doesn't exist
        if (!Array.isArray(scheduledPosts)) {
            scheduledPosts = [];
        }

        // Find all processing items that are scheduled
        const scheduledProcessingItems = processingData.filter(item =>
            item.posting === 'scheduled' && item.scheduledDate
        );

        // Find all history items that have scheduled dates (from History tab)
        const scheduledHistoryItems = historyData.filter(item =>
            item.scheduledDate && (item.status === 'scheduled' || item.posting === 'scheduled')
        );

        // Combine both arrays for comprehensive sync
        const allScheduledItems = [...scheduledProcessingItems, ...scheduledHistoryItems];

        let addedCount = 0;

        // Add any missing scheduled posts to the calendar
        for (const item of allScheduledItems) {
            const existingPost = scheduledPosts.find(post =>
                post.title.includes(item.topic) &&
                new Date(post.scheduledTime).getTime() === new Date(item.scheduledDate).getTime()
            );

            if (!existingPost) {
                const videoType = item.ytType || item.scheduledType || 'Long';
                const post = {
                    id: Date.now() + Math.random(), // Ensure unique ID
                    title: `${item.topic} (${videoType})`,
                    platform: 'YouTube',
                    scheduledTime: item.scheduledDate,
                    status: 'scheduled',
                    addedAt: new Date().toISOString()
                };
                scheduledPosts.push(post);
                addedCount++;
                console.log(`📅 Synced scheduled post to calendar: ${post.title}`);
            }
        }

        // Save the updated scheduled posts if we added any
        if (addedCount > 0) {
            localStorage.setItem('bc_generator_scheduled_posts', JSON.stringify(scheduledPosts));
            console.log(`📅 Total synced ${addedCount} items from Processing (${scheduledProcessingItems.length}) + History (${scheduledHistoryItems.length}) to Calendar`);
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
            localStorage.setItem('bc_generator_paused_items', JSON.stringify(Array.from(pausedItems)));
            localStorage.setItem('bc_generator_script_word_count', longScriptWordCount);
            localStorage.setItem('bc_generator_weekday_time', weekdayScheduleTime);
            localStorage.setItem('bc_generator_weekend_time', weekendScheduleTime);
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

                // Sync scheduled posts after loading processing data
                syncScheduledPostsToCalendar();
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
                // Show test button if we have all requirements on page load
                if (elevenlabsApiKey && elevenlabsVoiceId && testVoiceInput.value.trim()) {
                    testVoiceBtn.style.display = 'inline-block';
                }
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

            const savedPausedItems = localStorage.getItem('bc_generator_paused_items');
            if (savedPausedItems) {
                pausedItems = new Set(JSON.parse(savedPausedItems));
            }

            const savedScriptWordCount = localStorage.getItem('bc_generator_script_word_count');
            if (savedScriptWordCount) {
                longScriptWordCount = parseInt(savedScriptWordCount);
                // Update UI elements if they exist
                if (longScriptWordsInput) {
                    longScriptWordsInput.value = longScriptWordCount;
                }
                if (currentWordCountSpan) {
                    currentWordCountSpan.textContent = longScriptWordCount;
                }
            }

            // Load scheduling settings
            loadSchedulingSettings();
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
            localStorage.removeItem('bc_generator_paused_items');
            localStorage.removeItem('bc_generator_script_word_count');
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

    function clearPendingTopics() {
        try {
            // Preserve API keys and all other settings
            const apiKey = localStorage.getItem('bc_generator_openai_key');
            const elevenlabsKey = localStorage.getItem('bc_generator_elevenlabs_key');
            const voiceId = localStorage.getItem('bc_generator_elevenlabs_voice_id');
            const lateKey = localStorage.getItem('bc_generator_late_key');
            const leonardoKey = localStorage.getItem('bc_generator_leonardo_key');
            const leonardoModel = localStorage.getItem('bc_generator_leonardo_model');
            const leonardoAlchemy = localStorage.getItem('bc_generator_leonardo_alchemy');
            const scriptWordCount = localStorage.getItem('bc_generator_script_word_count');

            // Preserve processing data and related settings
            const processingData = localStorage.getItem('bc_generator_processing');
            const nextId = localStorage.getItem('bc_generator_next_id');
            const usedIds = localStorage.getItem('bc_generator_used_ids');
            const pausedItems = localStorage.getItem('bc_generator_paused_items');

            // Preserve history data - PROTECTED from clearing
            const historyData = localStorage.getItem('bc_generator_history');
            const historyTimestamp = localStorage.getItem('bc_generator_history_timestamp');

            // Only remove pending topics data
            localStorage.removeItem('bc_generator_data');

            // Restore all preserved data
            if (apiKey) localStorage.setItem('bc_generator_openai_key', apiKey);
            if (elevenlabsKey) localStorage.setItem('bc_generator_elevenlabs_key', elevenlabsKey);
            if (voiceId) localStorage.setItem('bc_generator_elevenlabs_voice_id', voiceId);
            if (lateKey) localStorage.setItem('bc_generator_late_key', lateKey);
            if (leonardoKey) localStorage.setItem('bc_generator_leonardo_key', leonardoKey);
            if (leonardoModel) localStorage.setItem('bc_generator_leonardo_model', leonardoModel);
            if (leonardoAlchemy) localStorage.setItem('bc_generator_leonardo_alchemy', leonardoAlchemy);
            if (scriptWordCount) localStorage.setItem('bc_generator_script_word_count', scriptWordCount);

            // Restore processing-related data
            if (processingData) localStorage.setItem('bc_generator_processing', processingData);
            if (nextId) localStorage.setItem('bc_generator_next_id', nextId);
            if (usedIds) localStorage.setItem('bc_generator_used_ids', usedIds);
            if (pausedItems) localStorage.setItem('bc_generator_paused_items', pausedItems);

            // Restore history data - PROTECTED from clearing
            if (historyData) localStorage.setItem('bc_generator_history', historyData);
            if (historyTimestamp) localStorage.setItem('bc_generator_history_timestamp', historyTimestamp);

            // Update timestamp
            localStorage.setItem('bc_generator_timestamp', new Date().toISOString());

            console.log('✅ Pending topics cleared, processing and history data preserved');
        } catch (e) {
            console.warn('Could not clear pending topics from localStorage:', e);
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
                // Show test button if we have both API key and voice ID and test text
                if (elevenlabsApiKey && elevenlabsVoiceId && testVoiceInput.value.trim()) {
                    testVoiceBtn.style.display = 'inline-block';
                }
                break;
            default:
                statusText.textContent = 'No ElevenLabs API key configured';
                statusText.style.color = '#666666';
                testVoiceBtn.style.display = 'none';
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
        if (status === 'done' || status === 'Done') return 'status-done';
        if (status === 'ready to schedule') return 'status-ready';
        if (status === 'scheduled') return 'status-scheduled';
        if (status === 'failed') return 'status-failed';
        if (status === 'paused') return 'status-paused';
        return 'status-waiting';
    }

    // Check thumbnail status for a processing item (for UI display)
    async function checkThumbnailStatus(outputDir, thumbnailTd, ytType) {
        try {
            // Shorts don't need thumbnails, so always show Ready
            if (ytType === 'Shorts') {
                thumbnailTd.innerHTML = `<span class="status ready">Ready</span>`;
                return;
            }

            const { ipcRenderer } = require('electron');
            const result = await ipcRenderer.invoke('check-thumbnail', { outputDir });

            if (result.success) {
                if (result.hasThumbnail) {
                    thumbnailTd.innerHTML = `<span class="status ready">Ready</span>`;
                } else {
                    thumbnailTd.innerHTML = `<span class="status waiting">waiting...</span>`;
                }
            } else {
                thumbnailTd.innerHTML = `<span class="status error">Error</span>`;
            }
        } catch (error) {
            console.error('Error checking thumbnail status:', error);
            thumbnailTd.innerHTML = `<span class="status error">Error</span>`;
        }
    }

    // Check thumbnail status for a processing item (for logic)
    async function checkItemThumbnail(outputDir, ytType) {
        try {
            // Shorts don't need thumbnails, so always return Ready
            if (ytType === 'Shorts') {
                return { success: true, hasThumbnail: true };
            }

            if (!outputDir) return { success: false, hasThumbnail: false };

            const { ipcRenderer } = require('electron');
            const result = await ipcRenderer.invoke('check-thumbnail', { outputDir });
            return result;
        } catch (error) {
            console.error('Error checking item thumbnail:', error);
            return { success: false, hasThumbnail: false };
        }
    }

    // Update posting status based on all prerequisites
    async function updatePostingStatus(item, postingTd) {
        try {
            // Check all prerequisites
            const scriptReady = item.script === 'done';
            const imageReady = item.image && (item.image === 'Done' || item.image === 'done' || item.image.includes('done'));
            const voiceReady = item.voiceOvers === 'done';
            const videoReady = item.video === 'done';

            // Check thumbnail status
            const thumbnailResult = await checkItemThumbnail(item.outputDir, item.ytType);
            const thumbnailReady = thumbnailResult && thumbnailResult.hasThumbnail;

            // Check if already scheduled
            if (item.posting === 'scheduled' && item.scheduledDate) {
                const scheduledDate = new Date(item.scheduledDate);
                const dateStr = scheduledDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                postingTd.innerHTML = `<span class="status scheduled" title="Scheduled for ${dateStr}">scheduled (${dateStr})</span>`;
            } else if (scriptReady && imageReady && voiceReady && videoReady && thumbnailReady) {
                const itemIndex = processingData.indexOf(item);
                postingTd.innerHTML = `<span class="status ready schedule-ready" data-item-index="${itemIndex}" onclick="scheduleNow(${itemIndex})" onmouseover="this.innerHTML='Schedule Now'" onmouseout="this.innerHTML='ready to schedule'" style="cursor: pointer;">ready to schedule</span>`;
            } else {
                const missing = [];
                if (!scriptReady) missing.push('script');
                if (!imageReady) missing.push('images');
                if (!voiceReady) missing.push('voice');
                if (!videoReady) missing.push('video');
                if (!thumbnailReady) missing.push('thumbnail');

                postingTd.innerHTML = `<span class="status waiting">waiting...</span>`;
            }
        } catch (error) {
            console.error('Error updating posting status:', error);
            postingTd.innerHTML = `<span class="status error">Error</span>`;
        }
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
            const idDiv = document.createElement('div');
            idDiv.className = 'processing-id editable';
            idDiv.contentEditable = true;
            idDiv.textContent = item.id;

            // Add blur event to save changes
            idDiv.addEventListener('blur', function() {
                const newValue = this.textContent.trim();
                if (newValue && newValue !== processingData[index].id) {
                    processingData[index].id = newValue;
                    // Save to localStorage
                    saveToLocalStorage();
                    console.log(`Updated processing ID for row ${index} to: ${newValue}`);
                }
            });

            // Add keydown event to handle Enter key
            idDiv.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.blur();
                }
            });

            idTd.appendChild(idDiv);
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
            } else if (item.script === 'waiting') {
                // Waiting for Long video to complete
                scriptTd.innerHTML = `
                    <span class="status waiting">waiting...</span>
                `;
            } else if (item.script === 'failed') {
                // Show retry button for failed script
                scriptTd.innerHTML = `
                    <span class="status failed">${item.script}</span>
                    <button class="btn-mini" onclick="retryScriptGeneration(${index})" title="Retry script generation">Retry</button>
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
            } else if (item.image === 'failed') {
                // Show retry button for failed images
                imageTd.innerHTML = `
                    <span class="status failed">${item.image}</span>
                    <button class="btn-mini" onclick="retryImageGeneration(${index})" title="Retry image generation">Retry</button>
                `;
            } else {
                imageTd.innerHTML = `<span class="status ${getStatusClass(item.image)}">${item.image}</span>`;
            }
            tr.appendChild(imageTd);

            const voiceTd = document.createElement('td');
            if (item.voiceOvers === 'failed') {
                // Show retry button for failed voice overs
                voiceTd.innerHTML = `
                    <span class="status failed">${item.voiceOvers}</span>
                    <button class="btn-mini" onclick="retryVoiceGeneration(${index})" title="Retry voice generation">Retry</button>
                `;
            } else {
                voiceTd.innerHTML = `<span class="status ${getStatusClass(item.voiceOvers)}">${item.voiceOvers}</span>`;
            }
            tr.appendChild(voiceTd);

            const videoTd = document.createElement('td');
            if (item.video === 'failed') {
                // Show retry button for failed video
                videoTd.innerHTML = `
                    <span class="status failed">${item.video}</span>
                    <button class="btn-mini" onclick="retryVideoGeneration(${index})" title="Retry video generation">Retry</button>
                `;
            } else {
                videoTd.innerHTML = `<span class="status ${getStatusClass(item.video)}">${item.video}</span>`;
            }
            tr.appendChild(videoTd);

            const thumbnailTd = document.createElement('td');
            thumbnailTd.innerHTML = `<span class="status checking">checking...</span>`;
            tr.appendChild(thumbnailTd);

            // Check thumbnail status asynchronously
            if (item.outputDir) {
                checkThumbnailStatus(item.outputDir, thumbnailTd, item.ytType);
            } else if (item.ytType === 'Shorts') {
                // Shorts don't need thumbnails
                thumbnailTd.innerHTML = `<span class="status ready">Ready</span>`;
            } else {
                thumbnailTd.innerHTML = `<span class="status not-ready">Not Ready</span>`;
            }

            const postingTd = document.createElement('td');
            postingTd.innerHTML = `<span class="status checking">checking...</span>`;
            tr.appendChild(postingTd);

            // Check posting readiness asynchronously
            updatePostingStatus(item, postingTd);

            // Create folder cell
            const folderTd = document.createElement('td');
            if (item.outputDir) {
                folderTd.innerHTML = `<button class="btn-secondary btn-small" onclick="openItemFolder(${index})" title="Open output folder">📁 See Folder</button>`;
            } else {
                folderTd.innerHTML = '<span class="text-muted">No folder</span>';
            }
            tr.appendChild(folderTd);

            // Apply paused styling if item is paused
            if (item.paused) {
                tr.classList.add('paused');
                tr.style.opacity = '0.6';
                tr.style.backgroundColor = '#fff3cd';
            }

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

        // Show/hide action buttons based on selection
        console.log('Action button visibility:', count > 0 ? 'show' : 'hide');
        if (count > 0) {
            pauseSelectedBtn.style.display = 'inline-block';
            continueSelectedBtn.style.display = 'inline-block';
            cancelSelectedBtn.style.display = 'inline-block';
        } else {
            pauseSelectedBtn.style.display = 'none';
            continueSelectedBtn.style.display = 'none';
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
            const idDiv = document.createElement('div');
            idDiv.className = 'topic-id editable';
            idDiv.contentEditable = true;
            idDiv.textContent = row._topicId || 'N/A';

            // Add blur event to save changes
            idDiv.addEventListener('blur', function() {
                const newValue = this.textContent.trim();
                if (newValue && newValue !== csvData[index]._topicId) {
                    csvData[index]._topicId = newValue;
                    // Save to localStorage
                    saveToLocalStorage();
                    console.log(`Updated topic ID for row ${index} to: ${newValue}`);
                }
            });

            // Add keydown event to handle Enter key
            idDiv.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.blur();
                }
            });

            idTd.appendChild(idDiv);
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
        const confirmMessage = 'Are you sure you want to clear all Pending Topics from memory? This will only remove topics that haven\'t been moved to Processing yet. Items currently in Processing will be preserved.';

        if (confirm(confirmMessage)) {
            clearPendingTopics();
            csvData = [];
            // Don't clear processingData - preserve items in Processing
            // Don't reset nextProcessingId - keep sequence for new items
            // Don't clear usedTopicIds - preserve to prevent ID conflicts
            // Don't clear pausedItems - preserve pause states for processing items
            selectedRows.clear();
            populateTable();
            populateProcessingTable();
            updateSelectionCount();

            // Don't reset UI elements - keep settings preserved

            fileInfo.innerHTML = `
                <div style="text-align: center;">
                    <span style="color: #ff8800; font-weight: bold;">PENDING TOPICS CLEARED</span><br>
                    <span style="color: var(--text-secondary);">Pending topics removed, processing items preserved</span>
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

    // Pause functionality
    pauseSelectedBtn.addEventListener('click', function() {
        const selectedIndices = Array.from(selectedProcessingRows);

        selectedIndices.forEach(index => {
            if (index < processingData.length) {
                const item = processingData[index];
                pausedItems.add(item.id);
                item.paused = true;
                console.log(`Paused processing for: ${item.topic}`);
            }
        });

        populateProcessingTable();
        saveToLocalStorage();

        // Clear selection after pausing
        selectedProcessingRows.clear();
        updateProcessingSelectionCount();
    });

    // Continue functionality
    continueSelectedBtn.addEventListener('click', function() {
        const selectedIndices = Array.from(selectedProcessingRows);

        selectedIndices.forEach(index => {
            if (index < processingData.length) {
                const item = processingData[index];
                pausedItems.delete(item.id);
                item.paused = false;
                console.log(`Resumed processing for: ${item.topic}`);
            }
        });

        populateProcessingTable();
        saveToLocalStorage();

        // Clear selection after continuing
        selectedProcessingRows.clear();
        updateProcessingSelectionCount();
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
            // Show test button if we have all requirements
            if (elevenlabsApiKey && elevenlabsVoiceId && testVoiceInput.value.trim()) {
                testVoiceBtn.style.display = 'inline-block';
            }
        }
    });

    // Test voice input changes
    testVoiceInput.addEventListener('input', function() {
        if (elevenlabsApiKey && elevenlabsVoiceId && testVoiceInput.value.trim()) {
            testVoiceBtn.style.display = 'inline-block';
        } else {
            testVoiceBtn.style.display = 'none';
        }
    });

    // Test voice generation
    testVoiceBtn.addEventListener('click', async function() {
        const text = testVoiceInput.value.trim();
        if (!text || !elevenlabsApiKey || !elevenlabsVoiceId) {
            return;
        }

        console.log('Testing voice generation with text:', text);

        testVoiceResult.style.display = 'block';
        testAudio.style.display = 'none';
        testVoiceBtn.disabled = true;
        testVoiceBtn.textContent = 'Generating...';

        try {
            testVoiceStatus.textContent = 'Generating voice...';
            testVoiceStatus.style.color = '#0066cc';

            // Use the same IPC call as the main voice generation
            const { ipcRenderer } = require('electron');
            const voiceResult = await ipcRenderer.invoke('generate-voice', {
                text: text,
                apiKey: elevenlabsApiKey,
                voiceId: elevenlabsVoiceId,
                sceneNumber: 'test'
            });

            if (!voiceResult.success) {
                throw new Error(voiceResult.error);
            }

            console.log('Voice generation successful, file size:', voiceResult.fileSize);

            // Convert array buffer back to blob for audio playback
            const audioBlob = new Blob([new Uint8Array(voiceResult.audioBuffer)], { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);

            testAudio.src = audioUrl;
            testAudio.style.display = 'block';

            testVoiceStatus.textContent = `Voice generated successfully! (${voiceResult.fileSize} bytes)`;
            testVoiceStatus.style.color = '#008000';

        } catch (error) {
            console.error('Voice generation test failed:', error);
            testVoiceStatus.textContent = `Error: ${error.message}`;
            testVoiceStatus.style.color = '#cc0000';
            testAudio.style.display = 'none';
        } finally {
            testVoiceBtn.disabled = false;
            testVoiceBtn.textContent = 'Generate Test Voice';
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

    // Script Configuration Management
    saveScriptConfigBtn.addEventListener('click', function() {
        const wordCount = parseInt(longScriptWordsInput.value.trim());
        if (wordCount && wordCount >= 1000 && wordCount <= 20000) {
            longScriptWordCount = wordCount;
            saveToLocalStorage();
            currentWordCountSpan.textContent = wordCount;

            // Show success feedback
            const originalText = saveScriptConfigBtn.textContent;
            saveScriptConfigBtn.textContent = 'Saved!';
            saveScriptConfigBtn.style.backgroundColor = '#28a745';

            setTimeout(() => {
                saveScriptConfigBtn.textContent = originalText;
                saveScriptConfigBtn.style.backgroundColor = '';
            }, 2000);

            console.log(`Script word count updated to: ${wordCount} words`);
        } else {
            alert('Please enter a valid word count between 1,000 and 20,000');
        }
    });

    // Scheduling Configuration Management
    if (saveScheduleConfigBtn) {
        saveScheduleConfigBtn.addEventListener('click', function() {
            const weekdayTime = weekdayScheduleTimeInput.value;
            const weekendTime = weekendScheduleTimeInput.value;

            if (weekdayTime && weekendTime) {
                weekdayScheduleTime = weekdayTime;
                weekendScheduleTime = weekendTime;
                saveToLocalStorage();

                // Update display
                updateScheduleDisplay();

                // Show success feedback
                const originalText = saveScheduleConfigBtn.textContent;
                saveScheduleConfigBtn.textContent = 'Saved!';
                saveScheduleConfigBtn.style.backgroundColor = '#28a745';

                setTimeout(() => {
                    saveScheduleConfigBtn.textContent = originalText;
                    saveScheduleConfigBtn.style.backgroundColor = '';
                }, 2000);
            } else {
                alert('Please select both weekday and weekend times.');
            }
        });
    }

    // Function to update schedule display
    function updateScheduleDisplay() {
        if (currentWeekdayTimeSpan && weekdayScheduleTime) {
            const [hours, minutes] = weekdayScheduleTime.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            currentWeekdayTimeSpan.textContent = `${displayHour}:${minutes} ${ampm}`;
        }

        if (currentWeekendTimeSpan && weekendScheduleTime) {
            const [hours, minutes] = weekendScheduleTime.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            currentWeekendTimeSpan.textContent = `${displayHour}:${minutes} ${ampm}`;
        }
    }

    // Load scheduling settings from localStorage
    function loadSchedulingSettings() {
        const savedWeekdayTime = localStorage.getItem('bc_generator_weekday_time');
        const savedWeekendTime = localStorage.getItem('bc_generator_weekend_time');

        if (savedWeekdayTime) {
            weekdayScheduleTime = savedWeekdayTime;
            if (weekdayScheduleTimeInput) {
                weekdayScheduleTimeInput.value = savedWeekdayTime;
            }
        }

        if (savedWeekendTime) {
            weekendScheduleTime = savedWeekendTime;
            if (weekendScheduleTimeInput) {
                weekendScheduleTimeInput.value = savedWeekendTime;
            }
        }

        updateScheduleDisplay();
    }

    // Function to get the default schedule time for a given date
    function getDefaultScheduleTime(date) {
        const dayOfWeek = date.getDay();
        // 0 = Sunday, 6 = Saturday
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return weekendScheduleTime;
        } else {
            return weekdayScheduleTime;
        }
    }

    // Update word count display when input changes
    longScriptWordsInput.addEventListener('input', function() {
        const wordCount = parseInt(longScriptWordsInput.value.trim());
        if (wordCount && wordCount >= 1000 && wordCount <= 20000) {
            currentWordCountSpan.textContent = wordCount;
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

    // Global function for inline voice generation
    window.generateVoiceForItem = async function(index) {
        if (index >= 0 && index < processingData.length) {
            await generateVoiceOvers(processingData[index]);
        }
    };

    // Global function to retry failed voice overs only
    window.retryFailedVoices = async function(index) {
        if (index >= 0 && index < processingData.length) {
            const item = processingData[index];
            console.log(`Retrying failed voice overs for ${item.topic}`);
            await generateVoiceOvers(item, true);  // true = retry only missing audio
        }
    };

    // Retry failed script generation
    window.retryScriptGeneration = async function(index) {
        if (index >= 0 && index < processingData.length) {
            const item = processingData[index];
            console.log(`Retrying script generation for ${item.topic}`);
            await processScriptGeneration(item, index);
        }
    };

    // Retry failed image generation
    window.retryImageGeneration = async function(index) {
        if (index >= 0 && index < processingData.length) {
            const item = processingData[index];
            console.log(`Retrying image generation for ${item.topic}`);
            await generateImages(item);
        }
    };

    // Retry failed voice generation
    window.retryVoiceGeneration = async function(index) {
        if (index >= 0 && index < processingData.length) {
            const item = processingData[index];
            console.log(`Retrying voice generation for ${item.topic}`);
            await generateVoiceOvers(item);
        }
    };

    // Retry failed video generation
    window.retryVideoGeneration = async function(index) {
        if (index >= 0 && index < processingData.length) {
            const item = processingData[index];
            console.log(`Retrying video generation for ${item.topic}`);
            // For now, just log - video generation logic to be implemented
            alert('Video generation retry will be implemented in a future update');
        }
    };

    // Refresh processing status
    async function refreshProcessingStatus() {
        console.log('🔄 Starting comprehensive processing status refresh...');

        if (typeof require === 'undefined') {
            console.warn('Refresh only works in Electron environment');
            return;
        }

        const { ipcRenderer } = require('electron');
        const itemsToGenerateImages = [];
        const itemsToGenerateVoice = [];
        let totalItemsChecked = 0;
        let itemsWithIssues = 0;

        for (let i = 0; i < processingData.length; i++) {
            const item = processingData[i];
            totalItemsChecked++;

            if (!item.outputDir) {
                console.warn(`⚠️ ${item.topic}: No output directory specified`);
                itemsWithIssues++;
                continue;
            }

            try {
                console.log(`🔍 Checking ${item.topic} (${item.id})...`);
                const result = await ipcRenderer.invoke('check-processing-status', {
                    outputDir: item.outputDir,
                    topicId: item.id
                });

                if (result.success) {
                    const { status } = result;
                    const wasScriptWaiting = item.script === 'waiting...';

                    console.log(`📊 Status for ${item.topic}:`, {
                        script: status.hasScript ? `✅ (${status.scriptSize} bytes)` : '❌',
                        images: `${status.imageCount} files`,
                        audio: `${status.audioCount} files`,
                        video: status.hasVideo ? `✅ (${status.videoFiles.length} files)` : '❌',
                        directories: status.directoryStructure
                    });

                    // Update script status
                    if (status.hasScript && item.script !== 'done') {
                        item.script = 'done';

                        // If script just became done and images are still waiting, mark for auto-generation
                        if (wasScriptWaiting && item.image === 'waiting...' && status.imageCount === 0) {
                            if (item.ytType === 'Shorts') {
                                // For Shorts, check if Long counterpart has images ready before marking for copying
                                const baseId = item.id.replace('_S', '');
                                const longId = baseId + '_L';
                                const longItem = processingData.find(longItem => longItem.id === longId);

                                if (longItem && longItem.image === 'Done') {
                                    itemsToGenerateImages.push(item);
                                    console.log(`🎯 ${item.topic}: Shorts script done, Long images ready - marked for image copying`);
                                } else {
                                    console.log(`📝 ${item.topic}: Shorts script done, waiting for Long images to complete`);
                                }
                            } else {
                                // For Long videos, mark for normal image generation
                                itemsToGenerateImages.push(item);
                                console.log(`🎯 ${item.topic}: Long script done - marked for auto image generation`);
                            }
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

                    // Update image status - handle Shorts videos differently
                    if (item.ytType === 'Shorts') {
                        // For Shorts videos, check if Long counterpart has images
                        const baseId = item.id.replace('_S', '');
                        const longId = baseId + '_L';
                        const longItem = processingData.find(longItem => longItem.id === longId);

                        if (status.sceneImageCount > 0) {
                            // Shorts has images (copied from Long), mark as done
                            item.image = 'Done';
                            console.log(`✅ ${item.topic}: Shorts images copied from Long (${status.sceneImageCount} images)`);

                            // Auto-trigger voice generation if images are complete but voice is not
                            if (status.audioCount === 0 || (item.totalScenes && status.audioCount < item.totalScenes)) {
                                if (!itemsToGenerateVoice.includes(item)) {
                                    itemsToGenerateVoice.push(item);
                                    console.log(`🎯 ${item.topic}: Marked for auto voice generation (images complete, voice missing)`);
                                }
                            }
                        } else if (longItem && longItem.image === 'Done') {
                            // Long has images but Shorts doesn't, mark for copying
                            item.image = 'waiting...';
                            if (!itemsToGenerateImages.includes(item)) {
                                itemsToGenerateImages.push(item);
                                console.log(`🎯 ${item.topic}: Shorts marked for image copying (Long images ready)`);
                            }
                        } else {
                            // Long doesn't have images yet, wait
                            item.image = 'waiting...';
                            console.log(`⏳ ${item.topic}: Shorts waiting for Long video images`);
                        }
                    } else {
                        // For Long videos, use original logic
                        if (status.sceneImageCount > 0) {
                            if (item.totalScenes) {
                                if (status.sceneImageCount >= item.totalScenes) {
                                    item.image = 'Done';
                                    console.log(`✅ ${item.topic}: All ${status.sceneImageCount} scene images complete (${status.imageCount} total files including brand images)`);

                                    // Auto-trigger voice generation if images are complete but voice is not
                                    if (status.audioCount === 0 || (item.totalScenes && status.audioCount < item.totalScenes)) {
                                        if (!itemsToGenerateVoice.includes(item)) {
                                            itemsToGenerateVoice.push(item);
                                            console.log(`🎯 ${item.topic}: Marked for auto voice generation (images complete, voice missing)`);
                                        }
                                    }
                                } else {
                                    item.image = 'generating...';
                                    console.log(`🔄 ${item.topic}: ${status.sceneImageCount}/${item.totalScenes} scene images (missing: ${item.totalScenes - status.sceneImageCount})`);
                                }
                            } else {
                                // No total scenes info available, assume ready if we have scene images
                                item.image = 'Done';
                                console.log(`📷 ${item.topic}: Found ${status.sceneImageCount} scene images, total scenes unknown - marking as Ready`);
                            }

                            // Log which specific image files exist
                            if (status.existingImages.length > 0) {
                                console.log(`📁 ${item.topic}: Image scenes found: [${status.existingImages.sort((a,b) => a-b).join(', ')}]`);
                            }
                        } else if (status.hasScript && !itemsToGenerateImages.includes(item)) {
                            // Script exists but no images yet, mark for generation
                            item.image = 'waiting...';
                            itemsToGenerateImages.push(item);
                            console.log(`🎯 ${item.topic}: Marked for auto image generation (script ready, no images)`);
                        } else {
                            // No script yet, keep waiting
                            item.image = 'waiting...';
                            console.log(`⏳ ${item.topic}: No images found, waiting for script or generation`);
                        }
                    }

                    // Update audio status - simplified to just show "done" when audio files exist
                    if (status.audioCount > 0) {
                        // If there are any audio files, mark as done
                        item.voiceOvers = 'done';

                        // Still log detailed info for debugging
                        if (item.totalScenes && status.audioCount === item.totalScenes) {
                            console.log(`🔊 ${item.topic}: All ${status.audioCount} audio files complete`);
                        } else if (item.totalScenes) {
                            console.log(`🎵 ${item.topic}: ${status.audioCount}/${item.totalScenes} audio files found - displaying as done`);
                        } else {
                            console.log(`🎵 ${item.topic}: Found ${status.audioCount} audio files - displaying as done`);
                        }

                        // Log which specific audio files exist
                        if (status.existingAudio.length > 0) {
                            console.log(`🎧 ${item.topic}: Audio scenes found: [${status.existingAudio.sort((a,b) => a-b).join(', ')}]`);
                        }
                    } else {
                        // No audio files found, reset to waiting
                        item.voiceOvers = 'waiting...';
                        console.log(`⏳ ${item.topic}: No audio files found, status reset to waiting`);
                    }

                    // Update video status with detailed verification
                    if (status.hasVideo) {
                        item.video = 'done';
                        console.log(`🎬 ${item.topic}: Video complete - files: [${status.videoFiles.join(', ')}]`);
                    } else {
                        // No video files found, reset to waiting
                        item.video = 'waiting...';
                        console.log(`⏳ ${item.topic}: No video files found, status reset to waiting`);
                    }

                    // Update posting status - now includes thumbnail check
                    const thumbnailResult = await checkItemThumbnail(item.outputDir, item.ytType);
                    const hasThumbnail = thumbnailResult && thumbnailResult.hasThumbnail;

                    if (status.hasScript && status.imageCount > 0 && status.audioCount > 0 && status.hasVideo && hasThumbnail) {
                        item.posting = 'ready to schedule';
                        console.log(`🚀 ${item.topic}: Ready for posting - all assets complete`);
                    } else {
                        const missing = [];
                        if (!status.hasScript) missing.push('script');
                        if (status.imageCount === 0) missing.push('images');
                        if (status.audioCount === 0) missing.push('audio');
                        if (!status.hasVideo) missing.push('video');
                        if (!hasThumbnail) missing.push('thumbnail');
                        item.posting = 'waiting...';
                        console.log(`⏳ ${item.topic}: Waiting for: [${missing.join(', ')}]`);
                    }
                } else {
                    console.error(`❌ ${item.topic}: Status check failed - ${result.error}`);
                    itemsWithIssues++;
                }
            } catch (error) {
                console.error(`💥 ${item.topic}: Error during status check - ${error.message}`);
                itemsWithIssues++;
            }
        }

        // Print comprehensive refresh summary
        console.log(`\n📊 REFRESH SUMMARY`);
        console.log(`═══════════════════════════════════════`);
        console.log(`📝 Total items checked: ${totalItemsChecked}`);
        console.log(`⚠️ Items with issues: ${itemsWithIssues}`);
        console.log(`🎯 Items marked for auto image generation: ${itemsToGenerateImages.length}`);
        console.log(`🎤 Items marked for auto voice generation: ${itemsToGenerateVoice.length}`);

        const completedItems = processingData.filter(item =>
            item.script === 'done' &&
            (item.image === 'Done' || item.image === 'done') &&
            item.voiceOvers === 'done' &&
            item.video === 'done'
        ).length;

        const partialItems = processingData.filter(item =>
            item.script === 'done' ||
            (item.image !== 'waiting...' && item.image !== 'Done' && item.image !== 'done') ||
            (item.voiceOvers !== 'waiting...' && item.voiceOvers !== 'done') ||
            (item.video !== 'waiting...' && item.video !== 'done')
        ).length - completedItems;

        console.log(`✅ Fully completed items: ${completedItems}`);
        console.log(`🔄 Partially completed items: ${partialItems}`);
        console.log(`⏸️ Not started items: ${totalItemsChecked - completedItems - partialItems}`);
        console.log(`═══════════════════════════════════════\n`);

        populateProcessingTable();
        saveToLocalStorage();

        // Auto-generate images for items that have scripts but no images
        if (itemsToGenerateImages.length > 0) {
            console.log(`🚀 Starting auto image generation for ${itemsToGenerateImages.length} items`);
            for (const item of itemsToGenerateImages) {
                console.log(`🎨 Auto-generating images for ${item.topic}`);
                await generateImages(item);
            }
        } else {
            console.log(`✨ No auto image generation needed`);
        }

        // Auto-generate voice for items that have images but no voice
        if (itemsToGenerateVoice.length > 0) {
            console.log(`🚀 Starting auto voice generation for ${itemsToGenerateVoice.length} items`);
            console.log(`Voice generation prerequisites check:`);
            console.log(`- ElevenLabs API Key configured: ${elevenlabsApiKey ? 'YES' : 'NO'}`);
            console.log(`- ElevenLabs Voice ID configured: ${elevenlabsVoiceId ? 'YES' : 'NO'}`);

            if (!elevenlabsApiKey || !elevenlabsVoiceId) {
                console.warn(`❌ Voice generation skipped: Missing ElevenLabs configuration`);
                for (const item of itemsToGenerateVoice) {
                    item.voiceOvers = 'config missing';
                }
                populateProcessingTable();
                saveToLocalStorage();
            } else {
                for (const item of itemsToGenerateVoice) {
                    console.log(`🎤 Auto-generating voice for ${item.topic}`);
                    try {
                        await generateVoiceOvers(item);
                    } catch (voiceError) {
                        console.error(`❌ Auto voice generation failed for ${item.topic}:`, voiceError);
                        item.voiceOvers = 'failed';
                        item.voiceError = voiceError.message;
                        populateProcessingTable();
                        saveToLocalStorage();
                    }
                }
            }
        } else {
            console.log(`✨ No auto voice generation needed`);
        }

        console.log(`🎯 Refresh complete!`);
    }

    // Add refresh button event listener
    const refreshStatusBtn = document.getElementById('refresh-status-btn');
    if (refreshStatusBtn) {
        refreshStatusBtn.addEventListener('click', refreshProcessingStatus);
    }

    // Function to open item folder - needs to be global for onclick access
    window.openItemFolder = async function(index) {
        const item = processingData[index];
        if (!item || !item.outputDir) {
            alert('No output folder available for this item');
            return;
        }

        try {
            console.log(`Opening folder for ${item.topic}: ${item.outputDir}`);
            const { ipcRenderer } = require('electron');
            const result = await ipcRenderer.invoke('open-folder', { folderPath: item.outputDir });

            if (result.success) {
                console.log(`Successfully opened folder: ${item.outputDir}`);
            } else {
                console.error('Failed to open folder:', result.error);
                alert(`Failed to open folder: ${result.error}`);
            }
        } catch (error) {
            console.error('Error opening folder:', error);
            alert(`Error opening folder: ${error.message}`);
        }
    };

    // Load data from localStorage on page load
    loadFromLocalStorage();
    updateSelectionCount();
    updateProcessingSelectionCount();
    // Global function for API help dropdown toggle (exposed to window for inline onclick)
    window.toggleApiHelp = function() {
        const helpContent = document.getElementById('api-help-content');
        const arrow = document.getElementById('api-help-arrow');

        if (helpContent.style.display === 'none' || helpContent.style.display === '') {
            helpContent.style.display = 'block';
            arrow.classList.add('expanded');
            arrow.textContent = '▲';
        } else {
            helpContent.style.display = 'none';
            arrow.classList.remove('expanded');
            arrow.textContent = '▼';
        }
    };

    // Calendar Functions
    function getManilaTime() {
        // Get current time in Manila timezone
        return new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Manila"}));
    }

    function renderCalendar() {
        if (!calendarDays) return; // Exit if calendar elements not found

        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        // Update month display
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        currentMonthElement.textContent = `${monthNames[month]} ${year}`;

        // Clear previous calendar
        calendarDays.innerHTML = '';

        // Get first day of month and days in month
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Get today's date in Manila timezone
        const manilaToday = getManilaTime();
        const todayDate = manilaToday.getDate();
        const todayMonth = manilaToday.getMonth();
        const todayYear = manilaToday.getFullYear();

        // Add previous month's trailing days
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayElement = createDayElement(daysInPrevMonth - i, 'other-month',
                new Date(year, month - 1, daysInPrevMonth - i));
            calendarDays.appendChild(dayElement);
        }

        // Add current month's days
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isToday = day === todayDate && month === todayMonth && year === todayYear;
            const dayElement = createDayElement(day, isToday ? 'today' : '', date);

            // Check if this day has scheduled posts
            const postsCount = getPostsForDay(date);
            if (postsCount > 0) {
                dayElement.classList.add('has-posts');
                const indicator = document.createElement('div');
                indicator.className = 'post-indicator';
                dayElement.appendChild(indicator);

                const countElement = document.createElement('div');
                countElement.className = 'day-posts-count';
                countElement.textContent = `${postsCount} post${postsCount > 1 ? 's' : ''}`;
                dayElement.appendChild(countElement);
            }

            calendarDays.appendChild(dayElement);
        }

        // Add next month's leading days
        const totalCells = calendarDays.children.length;
        const cellsNeeded = totalCells > 35 ? 42 : 35;
        let nextMonthDay = 1;
        for (let i = totalCells; i < cellsNeeded; i++) {
            const dayElement = createDayElement(nextMonthDay++, 'other-month',
                new Date(year, month + 1, nextMonthDay - 1));
            calendarDays.appendChild(dayElement);
        }
    }

    function createDayElement(day, className, date) {
        const dayElement = document.createElement('div');
        dayElement.className = `calendar-day ${className}`;
        dayElement.dataset.date = date.toISOString();

        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        dayElement.appendChild(dayNumber);

        dayElement.addEventListener('click', function() {
            // Remove previous selection
            document.querySelectorAll('.calendar-day.selected').forEach(el => {
                el.classList.remove('selected');
            });

            // Add selection to clicked day
            this.classList.add('selected');
            selectedDate = new Date(this.dataset.date);

            // Display posts for selected day
            displayPostsForDay(selectedDate);
        });

        return dayElement;
    }

    function getPostsForDay(date) {
        // Filter scheduled posts for the given date
        const dateStr = date.toDateString();
        return scheduledPosts.filter(post => {
            const postDate = new Date(post.scheduledTime);
            return postDate.toDateString() === dateStr;
        }).length;
    }

    function displayPostsForDay(date) {
        const dateStr = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'Asia/Manila'
        });

        const dayPosts = scheduledPosts.filter(post => {
            const postDate = new Date(post.scheduledTime);
            return postDate.toDateString() === date.toDateString();
        });

        if (dayPosts.length === 0) {
            selectedDayPosts.innerHTML = `
                <p class="no-posts-message">No posts scheduled for ${dateStr}</p>
            `;
        } else {
            let html = `<h4 style="margin-bottom: 15px;">${dateStr}</h4>`;
            dayPosts.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));

            dayPosts.forEach((post, index) => {
                const time = new Date(post.scheduledTime).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                    timeZone: 'Asia/Manila'
                });

                const postIndex = scheduledPosts.indexOf(post);

                html += `
                    <div class="scheduled-post-item">
                        <div class="post-time">${time}</div>
                        <div class="post-title">${post.title}</div>
                        <span class="post-platform">${post.platform}</span>
                        ${post.status ? `<span class="post-status">${post.status}</span>` : ''}
                        <button class="btn-cancel-post" onclick="cancelScheduledPost(${postIndex}); this.style.display='none'; this.parentElement.style.opacity='0.5';" title="Cancel this scheduled post">✕</button>
                    </div>
                `;
            });

            selectedDayPosts.innerHTML = html;
        }
    }

    // Calendar event listeners
    if (prevMonthBtn) {
        prevMonthBtn.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });
    }

    if (nextMonthBtn) {
        nextMonthBtn.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });
    }

    if (todayBtn) {
        todayBtn.addEventListener('click', function() {
            currentDate = getManilaTime();
            renderCalendar();

            // Auto-select today
            const todayElement = document.querySelector('.calendar-day.today');
            if (todayElement) {
                todayElement.click();
            }
        });
    }

    // Load scheduled posts from localStorage
    function loadScheduledPosts() {
        const saved = localStorage.getItem('bc_generator_scheduled_posts');
        if (saved) {
            scheduledPosts = JSON.parse(saved);
        }

        // Sync scheduled posts from processing data
        syncScheduledPostsToCalendar();
        renderCalendar();
    }


    // Save scheduled posts to localStorage
    function saveScheduledPosts() {
        localStorage.setItem('bc_generator_scheduled_posts', JSON.stringify(scheduledPosts));
    }

    // Example function to add a scheduled post
    function addScheduledPost(title, platform, scheduledTime, status = 'scheduled') {
        const post = {
            id: Date.now(),
            title,
            platform,
            scheduledTime,
            status,
            addedAt: new Date().toISOString()
        };
        scheduledPosts.push(post);
        saveScheduledPosts();
        renderCalendar();
        return post;
    }

    // Initialize calendar when tab is shown
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            if (this.dataset.tab === 'calendar') {
                loadScheduledPosts();
            }
        });
    });

    // Initialize calendar on page load if calendar tab is active
    if (document.querySelector('.tab-btn[data-tab="calendar"].active')) {
        loadScheduledPosts();
    }

    // Find the next available date for scheduling based on the weekly pattern
    // Find next available date based on the scheduling pattern
    // Monday - Topic 1 Long, Tuesday - Topic 1 Shorts
    // Wednesday - Topic 2 Long, Thursday - Topic 2 Shorts
    // Friday - Topic 3 Long, Saturday - Topic 3 Shorts
    // Sunday - REST (no posts)
    function findNextAvailableDateForVideoType(videoType) {
        const today = new Date();
        let checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() + 1); // Start from tomorrow

        // Start checking from tomorrow (never schedule for today or past dates)
        while (true) {
            const dayOfWeek = checkDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

            // Skip Sunday (day 0) - REST DAY
            if (dayOfWeek === 0) {
                checkDate.setDate(checkDate.getDate() + 1);
                continue;
            }

            // Check if this date already has a post scheduled
            const dateStr = checkDate.toDateString();
            const existingPost = scheduledPosts.find(post => {
                const postDate = new Date(post.scheduledTime);
                return postDate.toDateString() === dateStr;
            });

            if (!existingPost) {
                // Check if this day matches the video type pattern
                const isLongDay = (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5); // Mon, Wed, Fri
                const isShortsDay = (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6); // Tue, Thu, Sat

                if ((videoType === 'Long' && isLongDay) || (videoType === 'Shorts' && isShortsDay)) {
                    return checkDate;
                }
            }

            // Move to next day
            checkDate.setDate(checkDate.getDate() + 1);

            // Prevent infinite loop - limit to 60 days in future
            if (checkDate.getTime() - today.getTime() > 60 * 24 * 60 * 60 * 1000) {
                break;
            }
        }

        return null; // No available date found in next 60 days
    }

    function findNextAvailableDate() {
        const today = new Date();
        let checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() + 1); // Start from tomorrow

        // Start checking from tomorrow (never schedule for today or past dates)
        while (true) {
            const dayOfWeek = checkDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

            // Skip Sunday (day 0) - REST DAY
            if (dayOfWeek === 0) {
                checkDate.setDate(checkDate.getDate() + 1);
                continue;
            }

            // Check if this date already has a post scheduled
            const dateStr = checkDate.toDateString();
            const existingPost = scheduledPosts.find(post => {
                const postDate = new Date(post.scheduledTime);
                return postDate.toDateString() === dateStr;
            });

            if (!existingPost) {
                return checkDate;
            }

            // Move to next day
            checkDate.setDate(checkDate.getDate() + 1);

            // Prevent infinite loop - limit to 60 days in future
            if (checkDate.getTime() - today.getTime() > 60 * 24 * 60 * 60 * 1000) {
                break;
            }
        }

        return null; // No available date found in next 60 days
    }

    // Determine if we should schedule Long or Shorts based on existing schedule
    function determineVideoType(scheduledDate, item) {
        // If item already has a specific type, return it
        if (item.ytType === 'Long' || item.ytType === 'Shorts') {
            return item.ytType;
        }

        // Default to Long if no specific type
        return 'Long';
    }

    // Schedule Now functionality
    window.scheduleNow = function(itemIndex) {
        if (itemIndex < 0 || itemIndex >= processingData.length) {
            alert('Invalid item index');
            return;
        }

        const item = processingData[itemIndex];
        const videoType = item.ytType || 'Long'; // Default to Long if not specified

        let scheduledDate;

        // Special handling for Shorts - they should be scheduled after their Long counterpart
        if (videoType === 'Shorts') {
            // Find the Long counterpart
            const baseId = item.id.replace('_S', '');
            const longId = baseId + '_L';

            // Look for Long video in processing data, history data, and scheduled posts
            const longInProcessing = processingData.find(p => p.id === longId);
            const longInHistory = historyData.find(h => h.id === longId && h.scheduledDate);
            const longInScheduled = scheduledPosts.find(s => s.title.includes(item.topic) && s.title.includes('Long'));

            let longScheduledDate = null;

            if (longInHistory && longInHistory.scheduledDate) {
                longScheduledDate = new Date(longInHistory.scheduledDate);
                console.log(`Found Long video in history scheduled for: ${longScheduledDate.toDateString()}`);
            } else if (longInScheduled) {
                longScheduledDate = new Date(longInScheduled.scheduledTime);
                console.log(`Found Long video in scheduled posts for: ${longScheduledDate.toDateString()}`);
            } else if (longInProcessing) {
                alert(`The Long version of "${item.topic}" must be scheduled first. Please schedule the Long video before scheduling the Shorts version.`);
                return;
            } else {
                alert(`Cannot find the Long version of "${item.topic}". The Long video must be scheduled first before scheduling the Shorts version.`);
                return;
            }

            if (longScheduledDate) {
                // Schedule Shorts for the next day after Long
                scheduledDate = new Date(longScheduledDate);
                scheduledDate.setDate(scheduledDate.getDate() + 1);

                // Skip Sunday if that's where we land
                if (scheduledDate.getDay() === 0) {
                    scheduledDate.setDate(scheduledDate.getDate() + 1);
                }

                // Ensure we don't schedule for today or past dates
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Reset time for date comparison
                scheduledDate.setHours(0, 0, 0, 0);

                if (scheduledDate <= today) {
                    alert(`Cannot schedule Shorts for "${item.topic}" on ${scheduledDate.toDateString()} as it's today or in the past. The Long video needs to be rescheduled to a future date first.`);
                    return;
                }

                // Check if this date is already taken
                const dateStr = scheduledDate.toDateString();
                const existingPost = scheduledPosts.find(post => {
                    const postDate = new Date(post.scheduledTime);
                    return postDate.toDateString() === dateStr;
                });

                if (existingPost) {
                    alert(`The day after the Long video (${scheduledDate.toDateString()}) is already taken by: ${existingPost.title}. Please reschedule the Long video or manually choose a date for the Shorts.`);
                    return;
                }

                console.log(`Scheduling Shorts "${item.topic}" for ${scheduledDate.toDateString()} (day after Long video)`);
            }
        } else {
            // For Long videos, use the normal scheduling logic
            scheduledDate = findNextAvailableDateForVideoType(videoType);
            if (!scheduledDate) {
                alert(`No available ${videoType} slots found in the next 60 days. Please check your calendar.`);
                return;
            }
        }

        // Determine time based on day
        const dayOfWeek = scheduledDate.getDay();
        const isWeekend = dayOfWeek === 6 || dayOfWeek === 0; // Saturday = 6, Sunday = 0
        const scheduleTime = isWeekend ? weekendScheduleTime : weekdayScheduleTime;

        // Create scheduled time
        const [hours, minutes] = scheduleTime.split(':');
        scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);

        // Add to scheduled posts
        const scheduledPost = addScheduledPost(
            `${item.topic} (${videoType})`,
            'YouTube',
            scheduledDate.toISOString(),
            'scheduled'
        );

        // Create history entry
        const historyEntry = {
            ...item, // Copy all properties from the processing item
            scheduledDate: scheduledDate.toISOString(),
            scheduledType: videoType,
            completedDate: new Date().toISOString(),
            status: 'scheduled'
        };

        // Add to history
        historyData.push(historyEntry);

        // Remove from processing
        const processingIndex = processingData.indexOf(item);
        if (processingIndex > -1) {
            processingData.splice(processingIndex, 1);
        }

        // Save and refresh all tables
        populateProcessingTable();
        populateHistoryTable();
        saveToLocalStorage();
        saveHistoryData();

        // Log for debugging (no popup)
        const dateStr = scheduledDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        console.log(`📅 Scheduled: ${item.topic} (${videoType}) for ${dateStr}`);
    };

    // Cancel/Delete scheduled post functionality
    window.cancelScheduledPost = function(postIndex) {
        if (postIndex < 0 || postIndex >= scheduledPosts.length) {
            console.error('Invalid post index:', postIndex);
            return;
        }

        const post = scheduledPosts[postIndex];
        console.log(`🗑️ Cancelling scheduled post: ${post.title}`);

        // Find corresponding history item and move it back to processing
        const historyItem = historyData.find(item => {
            return item.scheduledDate &&
                   new Date(item.scheduledDate).getTime() === new Date(post.scheduledTime).getTime() &&
                   post.title.includes(item.topic);
        });

        if (historyItem) {
            // Move back to processing with "ready to schedule" status
            const processingItem = {
                ...historyItem,
                posting: 'ready to schedule'
            };

            // Remove scheduled-related fields
            delete processingItem.scheduledDate;
            delete processingItem.scheduledType;
            delete processingItem.completedDate;
            delete processingItem.status;

            // Add back to processing
            processingData.push(processingItem);

            // Remove from history
            const historyIndex = historyData.indexOf(historyItem);
            if (historyIndex > -1) {
                historyData.splice(historyIndex, 1);
            }

            console.log(`🔄 Moved ${historyItem.topic} back to processing`);
        }

        // Remove the scheduled post
        scheduledPosts.splice(postIndex, 1);

        // Save and refresh all relevant UIs
        saveScheduledPosts(); // Updates calendar
        populateProcessingTable(); // Updates processing table
        populateHistoryTable(); // Updates history table
        saveToLocalStorage(); // Saves processing data
        saveHistoryData(); // Saves history data

        // Refresh the calendar display immediately
        renderCalendar();

        // If we're currently viewing this day, update the posts display immediately
        if (selectedDate) {
            displayDayPosts(selectedDate);
        }

        console.log(`✅ Cancelled scheduled post and updated all UI`);
    };

    // History management functions
    function populateHistoryTable() {
        if (!historyTable) return; // Safety check

        historyTable.innerHTML = '';
        selectedHistoryRows.clear();

        if (historyData.length === 0) {
            noHistoryData.classList.add('show');
            document.getElementById('history-table').style.display = 'none';
            historyCount.textContent = '0 completed videos';
            return;
        }

        noHistoryData.classList.remove('show');
        document.getElementById('history-table').style.display = 'table';

        historyData.forEach((item, index) => {
            const tr = document.createElement('tr');
            tr.dataset.index = index;

            // Create checkbox cell
            const checkboxTd = document.createElement('td');
            checkboxTd.className = 'checkbox-col';
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.addEventListener('change', function() {
                if (this.checked) {
                    selectedHistoryRows.add(index);
                    tr.classList.add('selected');
                } else {
                    selectedHistoryRows.delete(index);
                    tr.classList.remove('selected');
                }
                updateHistorySelectionCount();
            });
            checkboxTd.appendChild(checkbox);
            tr.appendChild(checkboxTd);

            // ID
            const idTd = document.createElement('td');
            const idDiv = document.createElement('div');
            idDiv.className = 'processing-id editable';
            idDiv.contentEditable = true;
            idDiv.textContent = item.id;

            // Add blur event to save changes
            idDiv.addEventListener('blur', function() {
                const newValue = this.textContent.trim();
                if (newValue && newValue !== historyData[index].id) {
                    historyData[index].id = newValue;
                    // Save to localStorage
                    saveHistoryData();
                    console.log(`Updated history ID for row ${index} to: ${newValue}`);
                }
            });

            // Add keydown event to handle Enter key
            idDiv.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.blur();
                }
            });

            idTd.appendChild(idDiv);
            tr.appendChild(idTd);

            // Topic
            const topicTd = document.createElement('td');
            topicTd.innerHTML = `<span class="processing-topic" title="${item.topic}">${item.topic}</span>`;
            tr.appendChild(topicTd);

            // Type
            const typeTd = document.createElement('td');
            typeTd.innerHTML = `<span class="video-type ${item.ytType.toLowerCase()}">${item.ytType}</span>`;
            tr.appendChild(typeTd);

            // Scheduled Date
            const scheduledTd = document.createElement('td');
            if (item.scheduledDate) {
                const scheduledDate = new Date(item.scheduledDate);
                scheduledTd.innerHTML = scheduledDate.toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } else {
                scheduledTd.innerHTML = 'N/A';
            }
            tr.appendChild(scheduledTd);

            // Completed Date
            const completedTd = document.createElement('td');
            if (item.completedDate) {
                const completedDate = new Date(item.completedDate);
                completedTd.innerHTML = completedDate.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } else {
                completedTd.innerHTML = 'N/A';
            }
            tr.appendChild(completedTd);

            // Status
            const statusTd = document.createElement('td');
            statusTd.innerHTML = `<span class="status ${item.status}">${item.status}</span>`;
            tr.appendChild(statusTd);

            // Folder
            const folderTd = document.createElement('td');
            if (item.outputDir) {
                folderTd.innerHTML = `<button class="btn-mini" onclick="openFolderFromHistory('${item.outputDir.replace(/\\/g, '\\\\')}')">Open</button>`;
            } else {
                folderTd.innerHTML = 'N/A';
            }
            tr.appendChild(folderTd);

            historyTable.appendChild(tr);
        });

        historyCount.textContent = `${historyData.length} completed video${historyData.length === 1 ? '' : 's'}`;
    }

    function updateHistorySelectionCount() {
        const count = selectedHistoryRows.size;

        if (count === 0) {
            selectAllHistoryBtn.style.display = 'inline-block';
            deselectAllHistoryBtn.style.display = 'none';
            deleteHistoryBtn.style.display = 'none';
        } else {
            selectAllHistoryBtn.style.display = 'none';
            deselectAllHistoryBtn.style.display = 'inline-block';
            deleteHistoryBtn.style.display = 'inline-block';
        }
    }

    function saveHistoryData() {
        try {
            localStorage.setItem('bc_generator_history', JSON.stringify(historyData));
            localStorage.setItem('bc_generator_history_timestamp', new Date().toISOString());
        } catch (e) {
            console.warn('Could not save history to localStorage:', e);
        }
    }

    function loadHistoryData() {
        try {
            const savedHistory = localStorage.getItem('bc_generator_history');
            if (savedHistory) {
                historyData = JSON.parse(savedHistory);
                populateHistoryTable();

                // Sync history items to calendar after loading
                syncScheduledPostsToCalendar();
            }
        } catch (e) {
            console.warn('Could not load history from localStorage:', e);
        }
    }

    // Global function for opening folder from history
    window.openFolderFromHistory = async function(folderPath) {
        try {
            const { ipcRenderer } = require('electron');
            const result = await ipcRenderer.invoke('open-folder', { folderPath });

            if (result.success) {
                console.log(`Successfully opened folder: ${folderPath}`);
            } else {
                console.error('Failed to open folder:', result.error);
                alert(`Failed to open folder: ${result.error}`);
            }
        } catch (error) {
            console.error('Error opening folder:', error);
            alert(`Error opening folder: ${error.message}`);
        }
    };

    // History event listeners
    if (selectAllHistoryBtn) {
        selectAllHistoryBtn.addEventListener('click', function() {
            const checkboxes = historyTable.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach((checkbox, index) => {
                checkbox.checked = true;
                selectedHistoryRows.add(index);
                checkbox.closest('tr').classList.add('selected');
            });
            updateHistorySelectionCount();
        });
    }

    if (deselectAllHistoryBtn) {
        deselectAllHistoryBtn.addEventListener('click', function() {
            const checkboxes = historyTable.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach((checkbox) => {
                checkbox.checked = false;
                checkbox.closest('tr').classList.remove('selected');
            });
            selectedHistoryRows.clear();
            updateHistorySelectionCount();
        });
    }

    if (deleteHistoryBtn) {
        deleteHistoryBtn.addEventListener('click', async function() {
            if (selectedHistoryRows.size === 0) return;

            if (confirm(`Are you sure you want to delete ${selectedHistoryRows.size} selected item(s) from history and their folders?`)) {
                // Convert to array and sort descending to avoid index issues
                const indicesToDelete = Array.from(selectedHistoryRows).sort((a, b) => b - a);

                // Delete folders first
                const { ipcRenderer } = require('electron');
                for (const index of indicesToDelete) {
                    const item = historyData[index];
                    if (item && item.outputDir) {
                        try {
                            console.log(`🗑️ Deleting folder for ${item.topic}: ${item.outputDir}`);
                            const deleteResult = await ipcRenderer.invoke('delete-folder', {
                                folderPath: item.outputDir
                            });

                            if (deleteResult.success) {
                                console.log(`✅ Successfully deleted folder: ${item.outputDir}`);
                            } else {
                                console.warn(`⚠️ Failed to delete folder ${item.outputDir}: ${deleteResult.error}`);
                            }
                        } catch (error) {
                            console.error(`❌ Error deleting folder ${item.outputDir}:`, error);
                        }
                    }
                }

                // Remove from history data
                indicesToDelete.forEach(index => {
                    historyData.splice(index, 1);
                });

                selectedHistoryRows.clear();
                populateHistoryTable();
                updateHistorySelectionCount();
                saveHistoryData();
            }
        });
    }

    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
                historyData = [];
                selectedHistoryRows.clear();
                populateHistoryTable();
                updateHistorySelectionCount();
                saveHistoryData();
            }
        });
    }

    // Load history data on page load
    loadHistoryData();

});

// Global variable to store generated topics
let generatedTopics = [];

// Generate topics function
async function generateTopics() {
    const generateBtn = document.getElementById('generateTopicBtn');
    const topicCountSelect = document.getElementById('topicCount');
    const generatedTopicsDiv = document.getElementById('generatedTopics');
    const topicListDiv = document.getElementById('topicList');

    const count = parseInt(topicCountSelect.value);

    try {
        // Disable button and show loading state
        generateBtn.disabled = true;
        generateBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spin">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24"></path>
            </svg>
            Generating ${count} Topics...
        `;

        // Get API key and model from localStorage
        const apiKey = localStorage.getItem('bc_generator_openai_key');
        const model = 'gpt-4'; // Use the same model as other functions

        if (!apiKey) {
            throw new Error('OpenAI API key not configured. Please set it in Settings first.');
        }

        // Get existing topics to avoid duplicates
        const existingTopics = getExistingTopics();

        console.log(`Existing topics found: ${existingTopics.length}`);
        console.log('Generating topics with OpenAI...');

        // Call OpenAI API to generate topics
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [{
                    role: 'system',
                    content: `You are a YouTube content creator specializing in dark history topics. Generate ${count} unique, engaging video topics with titles and descriptions that would perform well on YouTube.

IMPORTANT: Avoid any topics that might appear in this list of existing topics: ${existingTopics.join(', ')}

Focus on:
- Dark historical events and mysteries
- Forgotten crimes and conspiracies
- Unexplained historical phenomena
- Hidden stories from history
- Controversial historical figures
- Ancient mysteries and lost civilizations

For each topic, provide:
- Title: Compelling and click-worthy for YouTube (50-80 characters)
- Info: Brief description explaining what the topic is about (2-3 sentences, 100-200 characters)

Return ONLY a JSON array of objects with "topic" and "info" properties. Example format:
[
  {
    "topic": "The Disappearance of the Roanoke Colony",
    "info": "The mysterious vanishing of 115 English colonists in 1590. No trace was ever found except the word 'CROATOAN' carved into a tree."
  },
  {
    "topic": "The Beast of Gévaudan",
    "info": "A wolf-like creature that terrorized French countryside in the 1760s, killing over 100 people before being mysteriously eliminated."
  }
]`
                }],
                max_tokens: 2000,
                temperature: 0.9
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();
        console.log('OpenAI API response:', result);

        if (!result.choices || !result.choices[0] || !result.choices[0].message) {
            throw new Error('Invalid API response structure');
        }

        const content = result.choices[0].message.content.trim();
        console.log('Raw API content:', content);

        // Parse the JSON response
        let topics;
        try {
            // Remove any markdown code blocks if present
            const cleanContent = content.replace(/```json\n?|```\n?/g, '').trim();
            topics = JSON.parse(cleanContent);
            console.log('Parsed topics:', topics);
        } catch (parseError) {
            console.error('Failed to parse topics JSON:', content);
            throw new Error(`Invalid response format from API: ${parseError.message}`);
        }

        if (!Array.isArray(topics)) {
            console.error('Topics is not an array:', topics);
            throw new Error('API returned invalid topic format - expected array');
        }

        console.log(`Generated ${topics.length} topics before duplicate filtering`);
        console.log('Existing topics to compare against:', existingTopics);

        // Filter out any topics that might still be duplicates (case-insensitive)
        const lowercaseExisting = existingTopics.map(t => t.toLowerCase());
        const uniqueTopics = topics.filter(topicObj =>
            !lowercaseExisting.includes(topicObj.topic.toLowerCase())
        );

        console.log(`After duplicate filtering: ${uniqueTopics.length} unique topics`);
        console.log('Unique topics:', uniqueTopics);

        if (uniqueTopics.length === 0) {
            throw new Error('All generated topics already exist. Please try again.');
        }

        // Store generated topics globally
        generatedTopics = uniqueTopics;

        // Display the generated topics
        displayGeneratedTopics(uniqueTopics);

    } catch (error) {
        console.error('Error generating topics:', error);
        alert(`Failed to generate topics: ${error.message}`);
    } finally {
        // Re-enable button
        generateBtn.disabled = false;
        generateBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                <path d="M2 17l10 5 10-5"></path>
                <path d="M2 12l10 5 10-5"></path>
            </svg>
            Generate Topics
        `;
    }
}

// Get all existing topics from Pending Topics and History
function getExistingTopics() {
    const existingTopics = [];

    // Get topics from pending data using the correct localStorage key
    const pendingDataStr = localStorage.getItem('bc_generator_data');
    if (pendingDataStr) {
        try {
            const pendingData = JSON.parse(pendingDataStr);
            if (Array.isArray(pendingData)) {
                pendingData.forEach(item => {
                    if (item.topic) {
                        existingTopics.push(item.topic);
                    }
                });
            }
        } catch (e) {
            console.error('Error parsing pending data:', e);
        }
    }

    // Get topics from history data
    if (window.historyData && Array.isArray(window.historyData)) {
        window.historyData.forEach(item => {
            if (item.topic) {
                existingTopics.push(item.topic);
            }
        });
    }

    // Get topics from processing data
    if (window.processingData && Array.isArray(window.processingData)) {
        window.processingData.forEach(item => {
            if (item.topic) {
                existingTopics.push(item.topic);
            }
        });
    }

    return existingTopics;
}

// Display generated topics
function displayGeneratedTopics(topics) {
    const generatedTopicsDiv = document.getElementById('generatedTopics');
    const topicListDiv = document.getElementById('topicList');

    // Clear previous topics
    topicListDiv.innerHTML = '';

    // Create topic items
    topics.forEach((topicObj, index) => {
        const topicItem = document.createElement('div');
        topicItem.className = 'topic-item';
        topicItem.innerHTML = `
            <div style="margin-bottom: 5px;"><strong>${index + 1}. ${topicObj.topic}</strong></div>
            <div style="font-size: 0.9em; color: #666; margin-left: 15px;">${topicObj.info}</div>
        `;
        topicListDiv.appendChild(topicItem);
    });

    // Show the generated topics section
    generatedTopicsDiv.style.display = 'block';
}

// Move topics to pending with confirmation
function moveTopicsToPending() {
    console.log('moveTopicsToPending called');
    console.log('generatedTopics:', generatedTopics);

    if (generatedTopics.length === 0) {
        console.log('No topics to move - generatedTopics array is empty');
        return;
    }

    const message = `Add ${generatedTopics.length} generated topic${generatedTopics.length > 1 ? 's' : ''} to Pending Topics?`;
    console.log('Showing confirmation dialog:', message);

    if (confirm(message)) {
        console.log('User confirmed, proceeding to add topics');

        // Get existing pending data using the correct localStorage key
        const existingData = localStorage.getItem('bc_generator_data');
        let pendingTopics = [];

        if (existingData) {
            try {
                pendingTopics = JSON.parse(existingData);
                console.log('Loaded existing pending topics:', pendingTopics);
            } catch (e) {
                console.error('Error parsing existing pending data:', e);
                pendingTopics = [];
            }
        } else {
            console.log('No existing pending data found, starting fresh');
        }

        console.log('Current pending topics before adding:', pendingTopics);

        // Add each topic to pending data - create both Long and Shorts versions
        generatedTopics.forEach((topicObj, index) => {
            // Don't set _topicId here - let the system generate it automatically
            // The existing system will generate proper 4-character IDs when loading

            // Create Long version
            const longTopic = {
                'Topic': topicObj.topic,
                'Info': topicObj.info,
                'YT Type': 'Long'
                // No _topicId - will be generated automatically
            };
            console.log(`Adding Long topic ${index + 1}:`, longTopic);
            pendingTopics.push(longTopic);

            // Create Shorts version
            const shortTopic = {
                'Topic': topicObj.topic,
                'Info': topicObj.info,
                'YT Type': 'Shorts'
                // No _topicId - will be generated automatically
            };
            console.log(`Adding Shorts topic ${index + 1}:`, shortTopic);
            pendingTopics.push(shortTopic);
        });

        console.log('Final pending topics after adding:', pendingTopics);

        // Save to localStorage using the correct key
        localStorage.setItem('bc_generator_data', JSON.stringify(pendingTopics));
        console.log('Saved to localStorage with key: bc_generator_data');

        // Dispatch a custom event to trigger pending table refresh
        const refreshEvent = new CustomEvent('pendingTopicsUpdated', {
            detail: { newTopics: generatedTopics }
        });
        window.dispatchEvent(refreshEvent);
        console.log('Dispatched pendingTopicsUpdated event');

        // Store count before clearing (each topic creates Long + Shorts = 2 entries)
        const topicCount = generatedTopics.length;
        const totalEntries = topicCount * 2;

        // Clear generated topics first
        discardTopics();

        // Show success message
        alert(`Successfully added ${topicCount} topic${topicCount > 1 ? 's' : ''} (${totalEntries} entries: Long + Shorts) to Pending Topics!`);

        // Force page refresh to ensure topics appear
        console.log('Reloading page to refresh pending topics');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } else {
        console.log('User cancelled');
    }
}

// Discard generated topics
function discardTopics() {
    generatedTopics = [];
    const generatedTopicsDiv = document.getElementById('generatedTopics');
    generatedTopicsDiv.style.display = 'none';
}