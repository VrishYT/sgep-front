import { test, expect } from 'vitest';
//import {Transcript} from "../src/lib/transcript";
import {transcribe} from "../src/lib/transcriber";

test('able to split video from audio', async () => {
	const transcript = await transcribe("./static/test");
    expect((transcript == null ? "" : transcript).length).toBeGreaterThan(0);
}, 300000);

// test('errors with no video', async () => {
// 	const transcript = await transcribe("./static/video_no_sound");
//     expect(transcript).toBe(null);
// }, 300000);