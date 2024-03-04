export interface PrismaUser {
	id: string;
	name: string;
	email: string;
}

export interface PrismaProject {
	id: number,
	title: string;
	userId: string | null;
	date: Date;
	createdAt: Date;
	hasSlides: boolean;
	video: string; // path of the video on the vm
	slides: string;
	data: PrismaBasicData | PrismaSlidesData[];
	status: PrismaProjectStatus;
	waiting: boolean;
	customisation: { summaryLevel: number, questions: boolean };
}

export interface PrismaSlidesData {
	slide: string; // path of the slide (as an img) on the vm
	transcripts: string[];
	summaries: string[];
	squashed: boolean;
}

export interface PrismaBasicData {
	transcript: string;
	summary: string;
}

export enum PrismaProjectStatus {
	UNPROCESSED,
	SPLIT,
	TRANSCRIBED,
	SUMMARISED,
	COMPLETED
}