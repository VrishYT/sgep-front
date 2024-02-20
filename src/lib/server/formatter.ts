import { OPENAI_API_KEY } from '$env/static/private';
import OpenAI from 'openai';
import type { Customisation } from '$lib/server/types/Customisation';

// TODO: extract openai client to its own exported thing
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

// we assumed that transcript_code is a string of LaTeX code containing the summary
export async function format(transcript_code: string, customisations: Customisation) {
	let highlight_phrase = '';
	if (customisations.highlight_keywords) {
		highlight_phrase = ' highlight keywords ';
	}

	let questions_phrase = '';
	if (customisations.questions) {
		questions_phrase = ' with a revision question answer section';
	}

	// adds length prompt for length upper bound in pages, default set to 1
	let length_phrase = '';
	if (customisations.length != -1) {
		if (customisations.length == 1) {
			length_phrase = ' in 1 page ';
		} else {
			length_phrase = ' in ' + customisations.length + ' pages ';
		}
	}

	const prompt =
		'Plase give me this LaTeX code, ' +
		length_phrase +
		highlight_phrase +
		customisations.summary_format +
		questions_phrase +
		' :' +
		transcript_code;

	const completion = await openai.chat.completions.create({
		messages: [{ role: 'system', content: prompt }],
		model: 'gpt-3.5-turbo'
	});

	const summary = completion.choices[0]['message']['content'];

	console.log('Prompt : ');
	console.log(prompt);
	console.log('Customised Code : ');
	console.log(summary);

	return summary;
}
