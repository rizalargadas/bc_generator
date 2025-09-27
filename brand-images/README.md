# Brand Images Directory

This directory contains brand images that are automatically copied to each video's image folder during processing.

## Required Files

Please place the following files in this directory:

### 1. black-chapter-watermark.png
- **Purpose**: Watermark overlay for all videos
- **Used in**: Both Long and Shorts videos
- **Description**: The Black Chapter watermark that appears on all generated videos

### 2. long-black-chapter-logo.png
- **Purpose**: Logo/branding for Long format videos
- **Used in**: ONLY Long videos
- **Description**: The Black Chapter logo optimized for long-form YouTube videos (16:9 aspect ratio)

### 3. shorts-black-chapter-logo.png
- **Purpose**: Logo/branding for Shorts format videos
- **Used in**: ONLY Shorts videos
- **Description**: The Black Chapter logo optimized for YouTube Shorts (9:16 vertical format)

## File Format Requirements

- **Format**: PNG with transparency support
- **Resolution**: High quality (at least 1920x1080 for Long, 1080x1920 for Shorts)
- **File names**: Must match exactly as listed above

## How It Works

When images are generated for a video:
1. All scene images are created/copied first
2. The appropriate brand images are automatically copied to the video's image folder
3. The watermark is added to all videos
4. The correct logo is added based on video type (Long or Shorts)

## Note

If any of these files are missing, the system will log a warning but continue processing the video.