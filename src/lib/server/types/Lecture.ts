import { PATH_TO_DATA } from '$env/static/private';
import { formatDate } from '$lib/utils';
import { randomUUID } from 'node:crypto';
import { VideoURLHandler } from './URLHandler';
import path from 'node:path';
import { writeFile } from 'node:fs/promises';

// TODO: complete definition
export class Lecture {
	readonly userId: string | undefined;
	video: Video;
	slides: string | undefined;
	info: { title: string, date: string } | undefined;
	customisation: { summaryLevel: number, questions: boolean };

	public constructor(video: Video, userId: string | undefined) {
		this.video = video;
		this.userId = userId;
		this.customisation = { summaryLevel: 2, questions: false };
	}

	public async withSlidesFromFile(slides: File): Promise<Lecture> {
		const path: string = `${PATH_TO_DATA}/${randomUUID()}.pdf`;
		await writeFile(path, Buffer.from(await slides.arrayBuffer()));
		this.slides = path;
		return this;
	}

	public async withSlidesFromURL(url: string): Promise<Lecture> {
		// TODO: download from url and write to filesys
		this.slides = url;
		return this;
	}

	public async getTitleDate(): Promise<{ title: string; date: string }> {
		return this.info ? this.info : await this.video.getTitleDate();
	}

	// public abstract toFilePath(): Promise<string>;
	// public abstract saveToUrl(): URL;

	// public async cleanup(): Promise<void> {
	// 	if (this.video) await rm(this.video);
	// 	if ()
	// }

	public static async fromLectureForm(form: FormData): Promise<Lecture> {
		let video: Video;
		if (form.get('lectureFromFile') === 'true') {
			video = await VideoFromFile.from(form.get(`lectureFile`) as File);
		} else {
			const data = form.get('lectureURL');
			if (!data) throw new Error('Invalid URL');
			video = VideoFromUrl.from(new URL(data.toString()));
		}

		return new Lecture(video, form.get('userId')?.toString());
	}

	public static fromJSON(json: string): Lecture {
		const data: {
			video: string,
			slides: string,
			userId: string,
			info: { title: string, date: string },
			customisation: { summaryLevel: number, questions: boolean }
		} = JSON.parse(json);
		const lecture = new Lecture(new Video(data.video), data.userId);
		lecture.slides = data.slides;
		lecture.info = data.info;
		lecture.customisation = data.customisation;
		return lecture;
	}

	public async toJSON(): Promise<string> {
		return JSON.stringify({
			video: this.video.path,
			slides: this.slides,
			userId: this.userId,
			info: this.info ? this.info : await this.video.getTitleDate(),
			customisation: this.customisation
		});
	}
}

class Video {

	readonly path: string;

	public constructor(path: string) {
		this.path = path;
	}

	public async getTitleDate(): Promise<{ title: string; date: string }> {
		return { title: 'Lecture', date: formatDate(new Date()) };
	};

	// public saveToUrl();

}

class VideoFromFile extends Video {

	private readonly file: File;

	private constructor(path: string, file: File) {
		super(path);
		this.file = file;
	}

	static async from(file: File): Promise<VideoFromFile> {
		const path: string = `${PATH_TO_DATA}/${randomUUID()}.mp4`;
		await writeFile(path, Buffer.from(await file.arrayBuffer()));
		return new VideoFromFile(path, file);
	}

	// public async toFilePath(): Promise<string> {
	// 	await writeFile(this.video, Buffer.from(await this.file.arrayBuffer()));
	// 	return this.video;
	// }

	public async getTitleDate(): Promise<{ title: string; date: string }> {

		const date = new Date();

		return {
			title: path.parse(this.file.name).
				name.
				replaceAll(/[^a-zA-Z\d]/g, ' ').
				split(" ").
				map(word => word[0].toUpperCase() + word.substring(1)).
				join(" "),
			date: formatDate(date)
		};
	}

	// public saveToUrl(): URL {
	//     throw new Error("Method not implemented.");
	// }
}

// TODO: check if can be combined with URLHandler
class VideoFromUrl extends Video {

	private readonly handler: VideoURLHandler;

	static from(url: URL): VideoFromUrl {
		return new VideoFromUrl(VideoURLHandler.create(url));
	}

	private constructor(urlHandler: VideoURLHandler) {
		super(urlHandler.download().name);
		this.handler = urlHandler;
	}

	public getTitleDate(): Promise<{ title: string; date: string }> {
		return this.handler.getTitleDate();
	}

	// public async toFilePath(): Promise<string> {
	// 	this.urlHandler.download();
	// 	return this.video;
	// }

	// public saveToUrl(): URL {
	//     throw new Error("Method not implemented.");
	// }
}
