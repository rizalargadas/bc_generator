import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import https from 'https';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// Handle saving thumbnail image to topic root folder
ipcMain.handle('save-thumbnail', async (event, { imageUrl, outputDir, fileName }) => {
    return new Promise((resolve) => {
        try {
            // Ensure output directory exists
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }

            const thumbnailPath = path.join(outputDir, fileName);
            const file = fs.createWriteStream(thumbnailPath);

            https.get(imageUrl, (response) => {
                response.pipe(file);

                file.on('finish', () => {
                    file.close();
                    resolve({ success: true, thumbnailPath });
                });

                file.on('error', (err) => {
                    fs.unlink(thumbnailPath, () => {}); // Delete the file on error
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

            // Extract scene numbers from existing images (numbered files only)
            status.existingImages = imageFiles.map(f => {
                const nameWithoutExt = f.replace(/\.(png|jpg|jpeg)$/i, '');
                const sceneNum = parseInt(nameWithoutExt);
                return isNaN(sceneNum) ? null : sceneNum;
            }).filter(n => n !== null);

            // Count only scene images (numbered files), not brand images
            status.sceneImageCount = status.existingImages.length;
            // Keep total count for reference
            status.imageCount = imageFiles.length;

            console.log(`Images found: ${status.imageCount} total files (${status.sceneImageCount} scene images), scenes: [${status.existingImages.join(', ')}]`);
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

// Copy brand images to the video's images folder
ipcMain.handle('copy-brand-images', async (event, { outputDir, topicId, videoType }) => {
    try {
        console.log(`Copying brand images for ${videoType} video: ${topicId}`);

        const imagesDir = path.join(outputDir, `${topicId}-images`);
        const brandImagesDir = path.join(__dirname, 'brand-images');

        // Ensure images directory exists
        if (!fs.existsSync(imagesDir)) {
            fs.mkdirSync(imagesDir, { recursive: true });
        }

        // Check if brand-images directory exists
        if (!fs.existsSync(brandImagesDir)) {
            console.error(`Brand images directory not found: ${brandImagesDir}`);
            return { success: false, error: 'Brand images directory not found' };
        }

        const copiedFiles = [];
        const errors = [];

        // Always copy watermark for both Long and Shorts
        const watermarkSource = path.join(brandImagesDir, 'black-chapter-watermark.png');
        const watermarkTarget = path.join(imagesDir, 'black-chapter-watermark.png');

        if (fs.existsSync(watermarkSource)) {
            try {
                fs.copyFileSync(watermarkSource, watermarkTarget);
                copiedFiles.push('black-chapter-watermark.png');
                console.log(`Copied watermark to ${videoType} folder`);
            } catch (error) {
                errors.push(`Failed to copy watermark: ${error.message}`);
            }
        } else {
            errors.push('Watermark file not found');
        }

        // Copy appropriate logo based on video type
        if (videoType === 'Long') {
            const logoSource = path.join(brandImagesDir, 'long-black-chapter-logo.png');
            const logoTarget = path.join(imagesDir, 'long-black-chapter-logo.png');

            if (fs.existsSync(logoSource)) {
                try {
                    fs.copyFileSync(logoSource, logoTarget);
                    copiedFiles.push('long-black-chapter-logo.png');
                    console.log(`Copied Long logo to folder`);
                } catch (error) {
                    errors.push(`Failed to copy Long logo: ${error.message}`);
                }
            } else {
                errors.push('Long logo file not found');
            }
        } else if (videoType === 'Shorts') {
            const logoSource = path.join(brandImagesDir, 'shorts-black-chapter-logo.png');
            const logoTarget = path.join(imagesDir, 'shorts-black-chapter-logo.png');

            if (fs.existsSync(logoSource)) {
                try {
                    fs.copyFileSync(logoSource, logoTarget);
                    copiedFiles.push('shorts-black-chapter-logo.png');
                    console.log(`Copied Shorts logo to folder`);
                } catch (error) {
                    errors.push(`Failed to copy Shorts logo: ${error.message}`);
                }
            } else {
                errors.push('Shorts logo file not found');
            }
        }

        console.log(`Brand images copy completed. Copied: ${copiedFiles.length} files`);
        if (errors.length > 0) {
            console.warn('Errors during copy:', errors);
        }

        return {
            success: copiedFiles.length > 0,
            copiedFiles,
            errors,
            targetDir: imagesDir
        };
    } catch (error) {
        console.error('Error copying brand images:', error);
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

// Check for thumbnail file in topic folder
ipcMain.handle('check-thumbnail', async (event, { outputDir }) => {
    try {
        const thumbnailPng = path.join(outputDir, 'thumbnail.png');
        const thumbnailJpg = path.join(outputDir, 'thumbnail.jpg');

        const hasThumbnail = fs.existsSync(thumbnailPng) || fs.existsSync(thumbnailJpg);

        return {
            success: true,
            hasThumbnail,
            thumbnailPath: fs.existsSync(thumbnailPng) ? thumbnailPng :
                          fs.existsSync(thumbnailJpg) ? thumbnailJpg : null
        };
    } catch (error) {
        console.error('Error checking thumbnail:', error);
        return { success: false, error: error.message };
    }
});

// Get available Edge TTS voices
ipcMain.handle('get-edge-voices', async (event) => {
    try {
        console.log('Fetching available Edge TTS voices...');

        // Return predefined list of voices
        const voices = [
            { ShortName: 'en-US-AvaMultilingualNeural', Gender: 'Female', Locale: 'en-US' },
            { ShortName: 'en-US-AndrewMultilingualNeural', Gender: 'Male', Locale: 'en-US' },
            { ShortName: 'en-US-AmandaMultilingualNeural', Gender: 'Female', Locale: 'en-US' },
            { ShortName: 'en-US-AdamMultilingualNeural', Gender: 'Male', Locale: 'en-US' },
            { ShortName: 'en-US-SteffanMultilingualNeural', Gender: 'Male', Locale: 'en-US' },
            { ShortName: 'en-US-ChristopherNeural', Gender: 'Male', Locale: 'en-US' },
            { ShortName: 'en-US-OnyxTurboMultilingualNeural', Gender: 'Male', Locale: 'en-US' }
        ];

        console.log(`Found ${voices.length} Edge TTS voices`);

        return {
            success: true,
            voices: voices
        };
    } catch (error) {
        console.error('Error fetching Edge TTS voices:', error);
        return {
            success: false,
            error: error.message
        };
    }
});

// Generate voice using Edge TTS (Free)
ipcMain.handle('generate-voice', async (event, { text, voiceId, sceneNumber }) => {
    try {
        console.log(`Generating voice for scene ${sceneNumber} using Edge TTS (voice: ${voiceId})`);

        // Extract locale from voice name or default to en-US
        // If voiceId doesn't match Edge TTS pattern (e.g., it's an old ElevenLabs ID), use default
        const edgeTTSPattern = /^[a-z]{2}-[A-Z]{2}-/;
        const voiceName = (voiceId && edgeTTSPattern.test(voiceId))
            ? voiceId
            : 'en-US-AvaMultilingualNeural';

        console.log(`Voice: ${voiceName}`);

        // Create temp directory if it doesn't exist
        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        // Generate unique filename for this audio
        const tempFile = path.join(tempDir, `tts_${Date.now()}_${sceneNumber}.mp3`);

        console.log('Calling Python script to generate audio...');

        // Call Python script to generate audio
        await new Promise((resolve, reject) => {
            const pythonScript = path.join(__dirname, 'edge_tts_generate.py');
            const python = spawn('python', [pythonScript, tempFile, voiceName, text]);

            let stdout = '';
            let stderr = '';

            python.stdout.on('data', (data) => {
                stdout += data.toString();
                console.log('Python stdout:', data.toString());
            });

            python.stderr.on('data', (data) => {
                stderr += data.toString();
                console.error('Python stderr:', data.toString());
            });

            python.on('close', (code) => {
                if (code === 0) {
                    console.log('Python script completed successfully');
                    resolve();
                } else {
                    reject(new Error(`Python script failed with code ${code}: ${stderr}`));
                }
            });

            python.on('error', (err) => {
                reject(new Error(`Failed to start Python script: ${err.message}`));
            });
        });

        // Read the generated audio file
        const buffer = fs.readFileSync(tempFile);

        // Clean up temp file
        fs.unlinkSync(tempFile);

        console.log(`Voice generated successfully for scene ${sceneNumber}: ${buffer.length} bytes`);

        return {
            success: true,
            audioBuffer: Array.from(buffer), // Convert to array for IPC transfer
            fileSize: buffer.length
        };

    } catch (error) {
        console.error('Edge TTS voice generation error:', error);
        return {
            success: false,
            error: error.message,
            details: error.stack
        };
    }
});

// Delete folder and all its contents
ipcMain.handle('delete-folder', async (event, { folderPath }) => {
    try {
        console.log(`Attempting to delete folder: ${folderPath}`);

        // Check if folder exists
        if (!fs.existsSync(folderPath)) {
            console.log(`Folder does not exist: ${folderPath}`);
            return {
                success: true,
                message: 'Folder does not exist (already deleted)'
            };
        }

        // Delete the folder recursively
        fs.rmSync(folderPath, { recursive: true, force: true });

        console.log(`Successfully deleted folder: ${folderPath}`);
        return {
            success: true,
            message: 'Folder deleted successfully'
        };

    } catch (error) {
        console.error('Folder deletion error:', error);
        return {
            success: false,
            error: error.message,
            details: error.stack
        };
    }
});