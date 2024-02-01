import * as fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from 'ffmpeg-static';
import { createReadStream } from 'fs';
import { rm } from 'node:fs/promises';
import pkg from 'fluent-ffmpeg';

import { OPENAI_API_KEY } from '$env/static/private';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const { setFfmpegPath } = pkg;

const SPIN_TIMER_MS: number = 1000;
const MAX_SPINS = 10;

function extract_audio(filePath: string): boolean {
	if (!ffmpegPath) return false;

	try {
		setFfmpegPath(ffmpegPath);
		ffmpeg()
			.input(createReadStream(filePath + '.mp4'))
			.outputOptions('-ab', '192k')
			.on('progress', (progress) => {
				if (progress.percent) {
					console.log(`Processing: ${Math.floor(progress.percent)}% done`);
				}
			})
			.on('end', () => {
				console.log('FFmpeg has finished.');
			})
			.on('error', (error) => {
				console.error(error);
			})
			.format('mp3')
			.save(filePath + '.mp3');
	} catch (_) {
		return false;
	}

	return true;
}

async function get_transcription(filePath: string) {
	return await openai.audio.transcriptions.create({
		file: fs.createReadStream(filePath + '.mp3'),
		model: 'whisper-1'
	});
}

export async function transcribe(filePath: string): Promise<string | null> {
	try {
		if (!extract_audio(filePath)) return null;
		let attempts: number = 0;
		while (!fs.existsSync(filePath + '.mp3') && attempts <= MAX_SPINS) {
			// spin every 1000ms
			attempts++;
			await new Promise((resolve) => setTimeout(resolve, SPIN_TIMER_MS));
		}
		const transcription = await get_transcription(filePath);
		return transcription.text;
	} catch (error) {
		console.log(error);
		return null;
	} finally {
		await rm(filePath + '.mp3');
	}
}
