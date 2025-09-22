document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('csvFile');
    const fileInfo = document.getElementById('fileInfo');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const topicsTable = document.getElementById('topics-tbody');
    const noDataMessage = document.getElementById('no-data-message');
    const selectionCount = document.getElementById('selection-count');
    const selectAllBtn = document.getElementById('select-all-btn');
    const deselectAllBtn = document.getElementById('deselect-all-btn');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const clearStorageBtn = document.getElementById('clear-storage-btn');
    const selectAllCheckbox = document.getElementById('select-all-checkbox');

    let csvData = [];
    let selectedRows = new Set();

    // LocalStorage functions
    function saveToLocalStorage() {
        try {
            localStorage.setItem('bc_generator_data', JSON.stringify(csvData));
            localStorage.setItem('bc_generator_timestamp', new Date().toISOString());
        } catch (e) {
            console.warn('Could not save to localStorage:', e);
        }
    }

    function loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('bc_generator_data');
            const timestamp = localStorage.getItem('bc_generator_timestamp');

            if (savedData) {
                csvData = JSON.parse(savedData);
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
        } catch (e) {
            console.warn('Could not load from localStorage:', e);
        }
    }

    function clearLocalStorage() {
        try {
            localStorage.removeItem('bc_generator_data');
            localStorage.removeItem('bc_generator_timestamp');
        } catch (e) {
            console.warn('Could not clear localStorage:', e);
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

        // Show/hide delete button based on selection
        if (count > 0) {
            deleteSelectedBtn.style.display = 'inline-block';
        } else {
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

    clearStorageBtn.addEventListener('click', function() {
        const confirmMessage = 'Are you sure you want to clear all saved data from memory? This will remove all topics and cannot be undone.';

        if (confirm(confirmMessage)) {
            clearLocalStorage();
            csvData = [];
            selectedRows.clear();
            populateTable();
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

    // Load data from localStorage on page load
    loadFromLocalStorage();
    updateSelectionCount();
});