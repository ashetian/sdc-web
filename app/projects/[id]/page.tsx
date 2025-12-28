import { Metadata } from "next";
import { notFound } from "next/navigation";
import connectDB from "../../lib/db";
import Project, { IProject } from "../../lib/models/Project";
import Member from "../../lib/models/Member";
import ProjectDetailClient from "./ProjectDetailClient";

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    await connectDB();

    // Validate ObjectId
    const mongoose = await import('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return { title: 'Proje Bulunamadi' };
    }

    const project = await Project.findOne({
        _id: id,
        status: 'approved',
        isDeleted: { $ne: true },
    }).lean();

    if (!project) {
        return { title: 'Proje Bulunamadi' };
    }

    const title = project.title;
    const description = project.description?.substring(0, 160) || '';

    // Get GitHub preview image
    const match = project.githubUrl?.match(/github\.com\/([^/]+)\/([^/]+)/);
    const previewImage = match
        ? `https://opengraph.githubassets.com/1/${match[1]}/${match[2]}`
        : 'https://ktusdc.com/sdclogo.png';

    return {
        title: `${title} | KTU SDC Projeler`,
        description: description,
        alternates: {
            canonical: `https://ktusdc.com/projects/${id}`,
        },
        openGraph: {
            title: title,
            description: description,
            url: `https://ktusdc.com/projects/${id}`,
            type: 'article',
            images: [previewImage],
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: description,
            images: [previewImage],
        },
    };
}

async function getProject(id: string) {
    await connectDB();

    // Validate ObjectId
    const mongoose = await import('mongoose');
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return null;
    }

    const project = await Project.findOneAndUpdate(
        { _id: id, status: 'approved', isDeleted: { $ne: true } },
        { $inc: { viewCount: 1 } },
        { new: true }
    )
        .populate('memberId', 'nickname department fullName')
        .lean();

    if (!project) return null;

    return {
        _id: (project as any)._id.toString(),
        title: project.title,
        titleEn: project.titleEn,
        description: project.description,
        descriptionEn: project.descriptionEn,
        githubUrl: project.githubUrl,
        demoUrl: project.demoUrl,
        technologies: project.technologies,
        viewCount: project.viewCount,
        createdAt: project.createdAt.toISOString(),
        author: (project as any).memberId ? {
            nickname: (project as any).memberId.nickname,
            fullName: (project as any).memberId.fullName,
            department: (project as any).memberId.department,
        } : undefined,
    };
}

export default async function ProjectDetailPage({ params }: Props) {
    const { id } = await params;
    const project = await getProject(id);

    if (!project) {
        notFound();
    }

    return <ProjectDetailClient project={project} />;
}
