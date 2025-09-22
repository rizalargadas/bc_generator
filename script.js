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
    async function generateScript(topic, info) {
        if (!openaiApiKey) {
            throw new Error('OpenAI API key not configured');
        }

        const prompt = `You are an award-winning narrative architect and YouTube strategy expert specializing in faceless, AI-narrated, content (True Crime, Dark History, Mysteries, Creepy Happenings) that maximizes audience retention and growth. You craft meticulously-researched, vividly-told scripts that create an eerie yet factual journey into humanity's darkest chapters.

Write an immersive, narrative-driven YouTube script on:
📌 TOPIC: ${topic}

Short Info About the Topic: ${info}

Write a full script first as a numbered list of at least 10 distinct scenes, each with a title and target word count to collectively total ~1200 words. Use suspenseful but calm, authoritative language to build curiosity and maintain an unsettling yet factual tone. After presenting the outline,

Full script should conclude with the specified haunting/hooky outro line/scene. Stay strictly within verified facts and note if the topic warrants a multi-part series. Your goal: craft an unforgettable, cinematic narrative experience that keeps viewers watching to the end — and eager for the next dark chapter.

For each scene's image prompt, ensure they are:
– Written in clear, descriptive English
– Appropriate for OpenAI/DALL-E and compliant with their community standards
– Visually accurate and aligned with the events and atmosphere of the script
– Consistent in describing any recurring or prominent characters (describe their age, gender, clothing, and other distinctive features clearly and use the same description throughout all scenes where they appear)
– Include the mood, time of day, setting, and any relevant props or details to make the image atmospheric and relevant to the story

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
                return JSON.parse(content);
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
                    title: line.replace(/^\d+\./, '').trim(),
                    script: '',
                    image_prompt: `Dark, atmospheric scene for: ${line.replace(/^\d+\./, '').trim()}`
                };
            } else if (currentScene && line) {
                currentScene.script += line + ' ';
            }
        });

        if (currentScene) {
            scenes.push(currentScene);
        }

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

        // Save file directly to scripts folder (Electron) or download (Web)
        const filename = `${topicId}_${topic.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;

        // Check if running in Electron
        if (typeof require !== 'undefined') {
            // Electron: Save directly to scripts folder
            try {
                const { ipcRenderer } = require('electron');
                const result = await ipcRenderer.invoke('save-csv-file', {
                    filename: filename,
                    content: csvContent
                });

                if (result.success) {
                    console.log(`File saved to: ${result.filePath}`);
                } else {
                    console.error('Failed to save file:', result.error);
                    alert(`Failed to save file: ${result.error}`);
                }
            } catch (error) {
                console.error('Error saving file:', error);
                alert(`Error saving file: ${error.message}`);
            }
        } else {
            // Web: Download file
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');

            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `scripts/${filename}`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }

        return filename;
    }

    async function processScriptGeneration(processingItem, index) {
        try {
            // Update status to writing
            processingItem.script = 'writing...';
            populateProcessingTable();

            const scriptData = await generateScript(processingItem.topic, processingItem.fullData.Info);
            const filename = await generateCSV(processingItem.topic, processingItem.id, scriptData);

            // Update status to done
            processingItem.script = 'done';
            processingItem.scriptFile = filename;
            populateProcessingTable();
            saveToLocalStorage();

            console.log(`Script generated for ${processingItem.topic}: ${filename}`);
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
                        row._topicId = generateTopicId();
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
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
        }
    }

    function clearLocalStorage() {
        try {
            // Preserve API key before clearing
            const apiKey = localStorage.getItem('bc_generator_openai_key');

            localStorage.removeItem('bc_generator_data');
            localStorage.removeItem('bc_generator_processing');
            localStorage.removeItem('bc_generator_next_id');
            localStorage.removeItem('bc_generator_used_ids');
            localStorage.removeItem('bc_generator_timestamp');

            // Restore API key if it existed
            if (apiKey) {
                localStorage.setItem('bc_generator_openai_key', apiKey);
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

    function createProcessingItem(topicData) {
        return {
            id: topicData._topicId, // Use the same ID from Pending Topics
            topic: topicData.Topic,
            script: 'writing...',
            image: 'waiting...',
            voiceOvers: 'waiting...',
            video: 'waiting...',
            posting: 'waiting'
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
            imageTd.innerHTML = `<span class="status ${getStatusClass(item.image)}">${item.image}</span>`;
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
        'Info',
        'Schedule Date',
        'Schedule Time',
        'TikTok Caption',
        'YouTube Title',
        'YouTube Description',
        'Youtube Tags'
    ];

    // Display mapping for shorter column names in the table
    const columnDisplayNames = {
        'Topic': 'Topic',
        'Info': 'Info',
        'Schedule Date': 'Schedule',
        'Schedule Time': 'Time',
        'TikTok Caption': 'TikTok',
        'YouTube Title': 'YT Title',
        'YouTube Description': 'YT Desc',
        'Youtube Tags': 'YT Tags'
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
            const row = {};
            headers.forEach((header, index) => {
                row[header.trim()] = values[index] ? values[index].trim() : '';
            });

            // Assign unique ID to each topic
            row._topicId = generateTopicId();
            data.push(row);
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

            requiredColumns.forEach(column => {
                const td = document.createElement('td');
                const cellContent = createCellContent(row[column] || '', column);

                if (column === 'Schedule Date' || column === 'Schedule Time') {
                    // Special handling for date and time columns
                    const inputWrapper = document.createElement('div');
                    inputWrapper.className = 'input-wrapper';
                    inputWrapper.appendChild(cellContent);

                    inputWrapper.addEventListener('click', function(e) {
                        if (e.target.classList.contains('clippable')) return; // Let clippable text handle its own click

                        const input = document.createElement('input');
                        input.type = column === 'Schedule Date' ? 'date' : 'time';
                        input.className = 'datetime-input';

                        // Convert display value to input format
                        let currentValue = csvData[index][column] || '';
                        if (column === 'Schedule Date' && currentValue) {
                            // Try to parse various date formats to YYYY-MM-DD
                            const date = new Date(currentValue);
                            if (!isNaN(date)) {
                                input.value = date.toISOString().split('T')[0];
                            }
                        } else if (column === 'Schedule Time' && currentValue) {
                            // Try to parse time format to HH:MM
                            if (currentValue.match(/^\d{1,2}:\d{2}/)) {
                                input.value = currentValue;
                            }
                        }

                        input.addEventListener('change', function() {
                            let newValue = this.value;
                            if (column === 'Schedule Date' && newValue) {
                                // Format date nicely for display
                                const date = new Date(newValue);
                                newValue = date.toLocaleDateString();
                            }
                            csvData[index][column] = newValue;

                            // Update the display
                            inputWrapper.innerHTML = '';
                            const newCellContent = createCellContent(newValue, column);
                            inputWrapper.appendChild(newCellContent);

                            // Save to localStorage
                            saveToLocalStorage();
                        });

                        input.addEventListener('blur', function() {
                            if (!this.value) {
                                // If no value selected, restore original content
                                inputWrapper.innerHTML = '';
                                inputWrapper.appendChild(cellContent);
                            }
                        });

                        // Replace content with input
                        inputWrapper.innerHTML = '';
                        inputWrapper.appendChild(input);
                        input.focus();
                        if (input.type === 'date') {
                            input.showPicker();
                        }
                    });

                    td.appendChild(inputWrapper);
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
                const rowCount = csvData.length;

                fileInfo.innerHTML = `
                    <div style="text-align: left;">
                        <span style="color: #008000; font-weight: bold;">SUCCESS: Valid CSV format</span><br>
                        <span style="color: var(--text-primary);">File: ${file.name} (${fileSize} KB)</span><br>
                        <span style="color: var(--text-secondary);">Topics: ${rowCount} rows</span>
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
                    rowCount: rowCount,
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
            processingItem.fullData = topicData; // Store complete topic data for potential restoration
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

    // Global function for inline script generation
    window.generateScriptForItem = async function(index) {
        if (index >= 0 && index < processingData.length) {
            await processScriptGeneration(processingData[index], index);
        }
    };

    // Load data from localStorage on page load
    loadFromLocalStorage();
    updateSelectionCount();
    updateProcessingSelectionCount();
});