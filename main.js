const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        },
        icon: path.join(__dirname, 'assets/icon.png') // Optional: add an icon
    });

    win.loadFile('index.html');

    // Open DevTools in development
    if (process.env.NODE_ENV === 'development') {
        win.webContents.openDevTools();
    }
}

// Handle file saving with new directory structure
ipcMain.handle('save-csv-file', async (event, { topicId, topicName, content }) => {
    try {
        // Clean topic name for folder naming (remove special characters)
        const cleanTopicName = topicName
            .replace(/[^a-zA-Z0-9\s-]/g, '') // Remove special characters
            .replace(/\s+/g, '_') // Replace spaces with underscores
            .substring(0, 50); // Limit length

        const folderName = `${topicId}_${cleanTopicName}`;
        const outputDir = path.join(__dirname, 'output', folderName);

        // Create main output directory and subdirectories
        const directories = [
            outputDir,
            path.join(outputDir, `${topicId}-images`),
            path.join(outputDir, `${topicId}-audio`),
            path.join(outputDir, `${topicId}-final-video`)
        ];

        directories.forEach(dir => {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        });

        // Save CSV file in the main topic directory
        const csvFilePath = path.join(outputDir, `${topicId}.csv`);
        fs.writeFileSync(csvFilePath, content, 'utf8');

        return {
            success: true,
            filePath: csvFilePath,
            outputDir: outputDir
        };
    } catch (error) {
        console.error('Error saving file:', error);
        return { success: false, error: error.message };
    }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// Handle reading CSV file
ipcMain.handle('read-csv-file', async (event, { outputDir, topicId }) => {
    try {
        const csvPath = path.join(outputDir, `${topicId}.csv`);

        if (!fs.existsSync(csvPath)) {
            return { success: false, error: 'CSV file not found' };
        }

        const content = fs.readFileSync(csvPath, 'utf8');
        return { success: true, content };
    } catch (error) {
        console.error('Error reading CSV:', error);
        return { success: false, error: error.message };
    }
});

// Handle saving image from URL
ipcMain.handle('save-image', async (event, { imageUrl, outputDir, topicId, sceneNumber }) => {
    return new Promise((resolve) => {
        try {
            const imagesDir = path.join(outputDir, `${topicId}-images`);

            // Ensure images directory exists
            if (!fs.existsSync(imagesDir)) {
                fs.mkdirSync(imagesDir, { recursive: true });
            }

            const imagePath = path.join(imagesDir, `${sceneNumber}.png`);
            const file = fs.createWriteStream(imagePath);

            https.get(imageUrl, (response) => {
                response.pipe(file);

                file.on('finish', () => {
                    file.close();
                    resolve({ success: true, imagePath });
                });

                file.on('error', (err) => {
                    fs.unlink(imagePath, () => {}); // Delete the file on error
                    resolve({ success: false, error: err.message });
                });
            }).on('error', (err) => {
                resolve({ success: false, error: err.message });
            });
        } catch (error) {
            resolve({ success: false, error: error.message });
        }
    });
});

// Check processing status
ipcMain.handle('check-processing-status', async (event, { outputDir, topicId }) => {
    try {
        const status = {
            hasScript: false,
            imageCount: 0,
            audioCount: 0,
            hasVideo: false,
            existingImages: []
        };

        // Check for CSV script
        const csvPath = path.join(outputDir, `${topicId}.csv`);
        status.hasScript = fs.existsSync(csvPath);

        // Check for images
        const imagesDir = path.join(outputDir, `${topicId}-images`);
        if (fs.existsSync(imagesDir)) {
            const imageFiles = fs.readdirSync(imagesDir).filter(f => f.endsWith('.png'));
            status.imageCount = imageFiles.length;
            // Extract scene numbers from existing images
            status.existingImages = imageFiles.map(f => parseInt(f.replace('.png', ''))).filter(n => !isNaN(n));
        }

        // Check for audio files
        const audioDir = path.join(outputDir, `${topicId}-audio`);
        if (fs.existsSync(audioDir)) {
            const audioFiles = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3') || f.endsWith('.wav'));
            status.audioCount = audioFiles.length;
        }

        // Check for final video
        const videoDir = path.join(outputDir, `${topicId}-final-video`);
        if (fs.existsSync(videoDir)) {
            const videoFiles = fs.readdirSync(videoDir).filter(f =>
                f.endsWith('.mp4') || f.endsWith('.mov') || f.endsWith('.avi')
            );
            status.hasVideo = videoFiles.length > 0;
        }

        return { success: true, status };
    } catch (error) {
        console.error('Error checking status:', error);
        return { success: false, error: error.message };
    }
});