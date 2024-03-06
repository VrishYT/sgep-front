import { PYTHON_URL } from '$env/static/private';

export async function process_noslides(project_folder: string): Promise<string> {
	const response = await fetch(`${PYTHON_URL}/process_noslides`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ project_folder })
	});
	const transcript = await response.text();
	return transcript;
}

export async function process_slides(project_folder: string) {
	const response = await fetch(`${PYTHON_URL}/process_slides`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ project_folder })
	});
	const data = await response.json();
	return data;
}

export async function process_genslides(project_folder: string) {
	const response = await fetch(`${PYTHON_URL}/process_genslides`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(project_folder)
	});
	const data = await response.json();
	return data;
}
