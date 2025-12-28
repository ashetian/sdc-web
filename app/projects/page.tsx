import { Metadata } from "next";
import connectDB from "../lib/db";
import Project, { IProject } from "../lib/models/Project";
import Member from "../lib/models/Member";
import ProjectsClient from "./ProjectsClient";

export const metadata: Metadata = {
    title: "Projeler | KTU Yazilim Gelistirme Kulubu",
    description: "KTU Yazilim Gelistirme Kulubu uyeleri tarafindan gelistirilen projeler.",
    alternates: {
        canonical: "https://ktusdc.com/projects",
    },
    openGraph: {
        title: "Projeler | KTU Yazilim Gelistirme Kulubu",
        description: "KTU Yazilim Gelistirme Kulubu uyeleri tarafindan gelistirilen projeler.",
        url: "https://ktusdc.com/projects",
        type: "website",
    },
};

async function getProjects() {
    await connectDB();

    const projects = await Project.find({
        status: 'approved',
        isDeleted: { $ne: true },
    })
        .sort({ createdAt: -1 })
        .populate('memberId', 'nickname department fullName')
        .lean();

    return projects.map((project: any) => ({
        _id: project._id.toString(),
        title: project.title,
        titleEn: project.titleEn,
        description: project.description,
        descriptionEn: project.descriptionEn,
        githubUrl: project.githubUrl,
        demoUrl: project.demoUrl,
        technologies: project.technologies,
        author: project.memberId ? {
            nickname: project.memberId.nickname,
            department: project.memberId.department,
        } : undefined,
    }));
}

export default async function ProjectsPage() {
    const projects = await getProjects();

    return <ProjectsClient projects={projects} />;
}
