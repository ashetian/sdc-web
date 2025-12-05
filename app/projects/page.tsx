'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '../_context/LanguageContext';

interface Project {
    _id: string;
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    githubUrl: string;
    demoUrl?: string;
    technologies: string[];
    viewCount: number;
    createdAt: string;
    author: {
        nickname: string;
        fullName?: string;
        department?: string;
    };
}

export default function ProjectsPage() {
    const { language } = useLanguage();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const labels = {
        tr: {
            title: 'Proje Galerisi',
            subtitle: 'Üyelerimizin projeleri',
            noProjects: 'Henüz proje bulunmuyor',
            views: 'görüntülenme',
            viewProject: 'İncele',
            demo: 'Demo',
            by: 'Geliştirici',
        },
        en: {
            title: 'Project Gallery',
            subtitle: 'Projects by our members',
            noProjects: 'No projects available',
            views: 'views',
            viewProject: 'View',
            demo: 'Demo',
            by: 'Developer',
        },
    };

    const l = labels[language];

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (err) {
            console.error('Projects fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    // GitHub OpenGraph preview URL
    const getGithubPreview = (githubUrl: string) => {
        const match = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
        if (match) {
            return `https://opengraph.githubassets.com/1/${match[1]}/${match[2]}`;
        }
        return '/sdclogo.png';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-neo-yellow flex items-center justify-center pt-24">
                <div className="text-xl font-bold">Yükleniyor...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neo-yellow py-20 pt-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="inline-block text-4xl sm:text-6xl font-black text-black mb-6 bg-white border-4 border-black shadow-neo-lg px-8 py-4 transform -rotate-2 uppercase" lang={language}>
                        {l.title}
                    </h1>
                    <p className="text-xl font-bold text-black max-w-3xl mx-auto mt-6 bg-neo-blue border-4 border-black p-4 shadow-neo transform rotate-1">
                        {l.subtitle}
                    </p>
                </div>

                {projects.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="bg-white border-4 border-black shadow-neo p-8 inline-block">
                            <p className="text-xl font-bold text-gray-600">{l.noProjects}</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project) => (
                            <div
                                key={project._id}
                                className="bg-white border-4 border-black shadow-neo hover:shadow-neo-lg transition-all transform hover:-translate-y-2 overflow-hidden"
                            >
                                {/* GitHub Preview Image */}
                                <div className="relative h-48 border-b-4 border-black">
                                    <Image
                                        src={getGithubPreview(project.githubUrl)}
                                        alt={project.title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>

                                <div className="p-6">
                                    <h3 className="text-xl font-black text-black mb-2">
                                        {language === 'en' && project.titleEn ? project.titleEn : project.title}
                                    </h3>

                                    <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                                        {language === 'en' && project.descriptionEn ? project.descriptionEn : project.description}
                                    </p>

                                    {/* Technologies */}
                                    {project.technologies.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {project.technologies.slice(0, 3).map((tech, i) => (
                                                <span key={i} className="px-2 py-1 bg-neo-purple text-white text-xs font-bold border border-black">
                                                    {tech}
                                                </span>
                                            ))}
                                            {project.technologies.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-200 text-black text-xs font-bold border border-black">
                                                    +{project.technologies.length - 3}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Author */}
                                    <div className="text-sm text-gray-600 mb-4">
                                        <span className="font-bold">{l.by}:</span> {project.author.nickname}
                                        {project.author.department && ` • ${project.author.department}`}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <Link
                                            href={`/projects/${project._id}`}
                                            className="flex-1 text-center bg-black text-white py-2 font-bold border-2 border-black hover:bg-white hover:text-black transition-all text-sm uppercase"
                                        >
                                            {l.viewProject}
                                        </Link>
                                        {project.demoUrl && (
                                            <a
                                                href={project.demoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-4 py-2 bg-neo-green text-black font-bold border-2 border-black hover:shadow-neo transition-all text-sm uppercase"
                                            >
                                                {l.demo}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
