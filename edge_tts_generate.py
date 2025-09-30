#!/usr/bin/env python3
"""
Simple script to generate Edge TTS audio
Usage: python edge_tts_generate.py <output_file> <voice> <text>
"""

import sys
import asyncio
import edge_tts

async def generate_speech(output_file, voice, text):
    """Generate speech using Edge TTS"""
    try:
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(output_file)
        print(f"SUCCESS: Generated audio file: {output_file}")
        return 0
    except Exception as e:
        print(f"ERROR: {str(e)}", file=sys.stderr)
        return 1

def main():
    if len(sys.argv) != 4:
        print("Usage: python edge_tts_generate.py <output_file> <voice> <text>", file=sys.stderr)
        sys.exit(1)

    output_file = sys.argv[1]
    voice = sys.argv[2]
    text = sys.argv[3]

    exit_code = asyncio.run(generate_speech(output_file, voice, text))
    sys.exit(exit_code)

if __name__ == "__main__":
    main()