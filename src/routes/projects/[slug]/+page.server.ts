import type { Session } from '@auth/core/types';
import type { PageServerLoad } from '../../$types';
import { redirect, error } from '@sveltejs/kit';
import { prisma } from '$lib/server/prisma';
import type { Project } from '@prisma/client'
import { addToTemplate } from '$lib/server/latex_generation';
import type { PrismaBasicData } from '$lib/types/Prisma';
import { OutputType, output } from '$lib/server/output_engine';
import { PATH_TO_DATA, PATH_TO_DOWNLOAD } from '$env/static/private';
import { fstat, readFile, readFileSync } from 'fs';
import { upload } from '$lib/object_storage/upload';
import { download } from '$lib/object_storage/download';

export const load: PageServerLoad = async (event) => {
    const session: Session | null = await event.locals.auth();
    if (!session?.user) throw redirect(303, "/");

    const pageNoParam: string | null = event.url.searchParams.get('page');
    const pageNo: number = pageNoParam ? Number(pageNoParam) : 0;

    const slug = event.params.slug;

    if (isNaN(Number(slug))) error(404, "Error: Project not found.");

    const project: Project | null = await prisma.project.findUnique({
        where: {
            id: Number(slug)
        }
    });

    if (project == null) error(503, "Unable to fetch project details. Please try again later.");

    return { pageNo, project }
};

export const actions = {
    download: async ({ request, params, locals }) => {
        try{
        const form = await request.formData();

        let type = form.get('type')?.toString();

        if (!type) error(400, "Invalid form data.");

        const session: Session | null = await locals.auth();
        const userId: string | undefined = session?.user.id;

        const data = await prisma.project.findUnique({
            where: {
                id: Number(params.slug)
            }
        });

        if (!data) error(503, "No project found");
        if (data.userId != userId) redirect(303, `/dashboard`);

        if (data.hasSlides) {
            //TODO
            
        } else {
            const latex: string = addToTemplate(data.title, session?.user.name??"", (JSON.parse(JSON.stringify(data.data)) as PrismaBasicData).summary);
            const outputType: OutputType = OutputType[type.toUpperCase()]
            
            const path = `${PATH_TO_DATA}/output.${type}`;
            await output(latex, `${PATH_TO_DATA}/output`, outputType);
            
            upload(path, `summaries/output.${type}`);
            download(`summaries/output.${type}`, `${PATH_TO_DOWNLOAD}/summary.${type}`);

           //const file = readFileSync(path, 'utf8');
           
           // console.log("tipi i file " + (typeof file));
        
            //return file;
        }
    } catch (error) {
        console.error("Error downloading file:", error.message);
        return new Response({ error: error.message }, { status: 500 });
    }
    }
}