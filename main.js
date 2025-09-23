const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');

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
            scriptPath: null,
            scriptSize: 0,
            imageCount: 0,
            audioCount: 0,
            hasVideo: false,
            existingImages: [],
            existingAudio: [],
            videoFiles: [],
            directoryStructure: {
                mainDir: fs.existsSync(outputDir),
                imagesDir: false,
                audioDir: false,
                videoDir: false
            }
        };

        console.log(`Checking status for ${topicId} in ${outputDir}`);

        // Check for CSV script with detailed info
        const csvPath = path.join(outputDir, `${topicId}.csv`);
        if (fs.existsSync(csvPath)) {
            status.hasScript = true;
            status.scriptPath = csvPath;
            const stats = fs.statSync(csvPath);
            status.scriptSize = stats.size;
            console.log(`Script found: ${csvPath} (${stats.size} bytes)`);
        } else {
            console.log(`Script not found: ${csvPath}`);
        }

        // Check for images with detailed file info
        const imagesDir = path.join(outputDir, `${topicId}-images`);
        status.directoryStructure.imagesDir = fs.existsSync(imagesDir);
        if (status.directoryStructure.imagesDir) {
            const imageFiles = fs.readdirSync(imagesDir).filter(f =>
                f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')
            );
            status.imageCount = imageFiles.length;
            // Extract scene numbers from existing images
            status.existingImages = imageFiles.map(f => {
                const nameWithoutExt = f.replace(/\.(png|jpg|jpeg)$/i, '');
                const sceneNum = parseInt(nameWithoutExt);
                return isNaN(sceneNum) ? null : sceneNum;
            }).filter(n => n !== null);
            console.log(`Images found: ${status.imageCount} files, scenes: [${status.existingImages.join(', ')}]`);
        } else {
            console.log(`Images directory not found: ${imagesDir}`);
        }

        // Check for audio files with detailed info
        const audioDir = path.join(outputDir, `${topicId}-audio`);
        status.directoryStructure.audioDir = fs.existsSync(audioDir);
        if (status.directoryStructure.audioDir) {
            const audioFiles = fs.readdirSync(audioDir).filter(f =>
                f.endsWith('.mp3') || f.endsWith('.wav') || f.endsWith('.m4a')
            );
            status.audioCount = audioFiles.length;
            status.existingAudio = audioFiles.map(f => {
                const nameWithoutExt = f.replace(/\.(mp3|wav|m4a)$/i, '');
                const sceneNum = parseInt(nameWithoutExt);
                return isNaN(sceneNum) ? null : sceneNum;
            }).filter(n => n !== null);
            console.log(`Audio found: ${status.audioCount} files, scenes: [${status.existingAudio.join(', ')}]`);
        } else {
            console.log(`Audio directory not found: ${audioDir}`);
        }

        // Check for final video with detailed info
        const videoDir = path.join(outputDir, `${topicId}-final-video`);
        status.directoryStructure.videoDir = fs.existsSync(videoDir);
        if (status.directoryStructure.videoDir) {
            const videoFiles = fs.readdirSync(videoDir).filter(f =>
                f.endsWith('.mp4') || f.endsWith('.mov') || f.endsWith('.avi') || f.endsWith('.mkv')
            );
            status.hasVideo = videoFiles.length > 0;
            status.videoFiles = videoFiles;
            console.log(`Video found: ${videoFiles.length} files: [${videoFiles.join(', ')}]`);
        } else {
            console.log(`Video directory not found: ${videoDir}`);
        }

        console.log(`Status check complete for ${topicId}:`, status);
        return { success: true, status };
    } catch (error) {
        console.error('Error checking status:', error);
        return { success: false, error: error.message };
    }
});

// Copy images from Long video to Shorts video
ipcMain.handle('copy-images-long-to-shorts', async (event, { longOutputDir, longTopicId, shortsOutputDir, shortsTopicId }) => {
    try {
        console.log(`Copying images from Long (${longTopicId}) to Shorts (${shortsTopicId})`);

        const sourceImagesDir = path.join(longOutputDir, `${longTopicId}-images`);
        const targetImagesDir = path.join(shortsOutputDir, `${shortsTopicId}-images`);

        // Check if source directory exists
        if (!fs.existsSync(sourceImagesDir)) {
            return { success: false, error: 'Source images directory not found' };
        }

        // Create target directory if it doesn't exist
        if (!fs.existsSync(targetImagesDir)) {
            fs.mkdirSync(targetImagesDir, { recursive: true });
        }

        // Get all image files from source
        const imageFiles = fs.readdirSync(sourceImagesDir).filter(f =>
            f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')
        );

        if (imageFiles.length === 0) {
            return { success: false, error: 'No images found in source directory' };
        }

        // Copy each image file
        let copiedCount = 0;
        for (const imageFile of imageFiles) {
            const sourcePath = path.join(sourceImagesDir, imageFile);
            const targetPath = path.join(targetImagesDir, imageFile);

            try {
                fs.copyFileSync(sourcePath, targetPath);
                copiedCount++;
                console.log(`Copied: ${imageFile}`);
            } catch (copyError) {
                console.error(`Failed to copy ${imageFile}:`, copyError);
            }
        }

        console.log(`Successfully copied ${copiedCount}/${imageFiles.length} images from Long to Shorts`);
        return {
            success: true,
            copiedCount,
            totalFiles: imageFiles.length,
            targetDir: targetImagesDir
        };

    } catch (error) {
        console.error('Error copying images:', error);
        return { success: false, error: error.message };
    }
});

// Save audio file from ElevenLabs
ipcMain.handle('save-audio', async (event, { audioBuffer, outputDir, topicId, sceneNumber }) => {
    try {
        console.log(`Saving audio for scene ${sceneNumber} in ${topicId}`);

        const audioDir = path.join(outputDir, `${topicId}-audio`);

        // Ensure audio directory exists
        if (!fs.existsSync(audioDir)) {
            fs.mkdirSync(audioDir, { recursive: true });
        }

        const audioPath = path.join(audioDir, `${sceneNumber}.mp3`);

        // Convert array buffer back to Buffer and save
        const buffer = Buffer.from(audioBuffer);
        fs.writeFileSync(audioPath, buffer);

        console.log(`Audio saved successfully: ${audioPath} (${buffer.length} bytes)`);

        return {
            success: true,
            audioPath: audioPath,
            fileSize: buffer.length
        };

    } catch (error) {
        console.error('Error saving audio:', error);
        return { success: false, error: error.message };
    }
});

// Open folder in file explorer
ipcMain.handle('open-folder', async (event, { folderPath }) => {
    try {
        // Check if folder exists
        if (!fs.existsSync(folderPath)) {
            return { success: false, error: 'Folder does not exist' };
        }

        // Open folder in default file manager
        await shell.openPath(folderPath);

        return { success: true };
    } catch (error) {
        console.error('Error opening folder:', error);
        return { success: false, error: error.message };
    }
});

// Generate voice using ElevenLabs SDK
ipcMain.handle('generate-voice', async (event, { text, apiKey, voiceId, sceneNumber }) => {
    try {
        console.log(`Generating voice for scene ${sceneNumber} using ElevenLabs SDK`);

        // Create ElevenLabs client
        const elevenlabs = new ElevenLabsClient({
            apiKey: apiKey
        });

        // Generate audio using the SDK
        const audio = await elevenlabs.textToSpeech.convert(
            voiceId,
            {
                text: text,
                modelId: 'eleven_multilingual_v2',
                outputFormat: 'mp3_44100_128'
            }
        );

        // Convert audio stream to buffer
        const chunks = [];
        for await (const chunk of audio) {
            chunks.push(chunk);
        }
        const buffer = Buffer.concat(chunks);

        console.log(`Voice generated successfully for scene ${sceneNumber}: ${buffer.length} bytes`);

        return {
            success: true,
            audioBuffer: Array.from(buffer), // Convert to array for IPC transfer
            fileSize: buffer.length
        };

    } catch (error) {
        console.error('ElevenLabs voice generation error:', error);
        return {
            success: false,
            error: error.message,
            details: error.stack
        };
    }
});