import { prisma } from '../prisma';

export abstract class Project {
	// Basic information needed for a project.
	readonly title: string;
	readonly date: Date;
	readonly video: string;

	// Optional info.
	readonly userId: string | undefined;
	readonly customisation: { summaryLevel: number, questions: boolean };

	public constructor(
		title: string,
		date: Date,
		video: string,
		userId: string | undefined,
		customisation: { summaryLevel: number, questions: boolean }
	) {
		this.title = title;
		this.date = date;
		this.video = video;
		this.userId = userId;
		this.customisation = customisation;
	}

	public static async from(data: {
		video: string,
		slides: string,
		userId: string,
		info: { title: string; date: string },
		customisation: { summaryLevel: number, questions: boolean }
	}): Promise<Project> {
		return data.slides ?
			new SlidesProject(data.info.title, new Date(data.info.date), data.video, data.userId, data.customisation, data.slides) :
			new BasicProject(data.info.title, new Date(data.info.date), data.video, data.userId, data.customisation);
	}

	public abstract saveToDB(): Promise<number>;
}

class BasicProject extends Project {
	public async saveToDB(): Promise<number> {
		const record = await prisma.project.create({
			data: {
				title: this.title,
				date: this.date,
				userId: this.userId,
				video: this.video,
				status: 'SPLIT',
				customisation: this.customisation
			}
		});
		return record.id;
	}
}

class SlidesProject extends Project {
	readonly slides: string;

	public constructor(
		title: string,
		date: Date,
		video: string,
		userId: string | undefined,
		customisation: { summaryLevel: number, questions: boolean },
		slides: string
	) {
		super(title, date, video, userId, customisation);
		this.slides = slides;
	}

	public async saveToDB(): Promise<number> {
		const record = await prisma.project.create({
			data: {
				title: this.title,
				date: this.date,
				userId: this.userId,
				video: this.video,
				slides: this.slides,
				hasSlides: true,
				status: 'UNPROCESSED',
				customisation: this.customisation
			}
		});
		return record.id;
	}
}
