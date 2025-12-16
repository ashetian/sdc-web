'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Github, Linkedin, Twitter, Globe, Instagram, MapPin, Mail, School, Phone } from 'lucide-react';
import { SkeletonList, SkeletonAvatar } from '@/app/_components/Skeleton';
import type { User } from '../lib/types/api';

interface UserProfileModalProps {
    userId: string;
    onClose: () => void;
}

// UserProfile is a subset of User for profile display
type UserProfile = User;

export default function UserProfileModal({ userId, onClose }: UserProfileModalProps) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch(`/api/users/${userId}/profile`);
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                } else {
                    setError('Profil yüklenemedi.');
                }
            } catch (err) {
                console.error(err);
                setError('Bir hata oluştu.');
            } finally {
                setLoading(false);
            }
        };

        if (userId) fetchProfile();
    }, [userId]);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
            <div className="bg-white border-4 border-black shadow-neo max-w-md w-full relative">
                {/* Header */}
                <div className="p-4 border-b-4 border-black flex justify-between items-center bg-neo-yellow">
                    <h2 className="text-xl font-black uppercase">Üye Profili</h2>
                    <button onClick={onClose} className="p-1 hover:bg-black hover:text-white transition-colors border-2 border-transparent hover:border-black rounded-full">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 relative">
                    {loading ? (
                        <div className="flex justify-center py-8">
                            <SkeletonList items={5} />
                        </div>
                    ) : error ? (
                        <div className="text-center py-8 text-red-600 font-bold">{error}</div>
                    ) : profile ? (
                        <div className="flex flex-col items-center text-center space-y-4">
                            {/* Nickname Badge (only if real name is shown) */}
                            {profile.fullName && (
                                <div className="absolute top-2 right-2 bg-black text-white text-xs font-black px-2 py-1 border-2 border-white shadow-neo-sm transform rotate-2">
                                    @{profile.nickname}
                                </div>
                            )}

                            {/* Avatar */}
                            <div className="relative w-32 h-32 border-4 border-black shadow-neo mb-2">
                                {profile.avatar ? (
                                    <Image
                                        src={profile.avatar}
                                        alt={profile.nickname}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-neo-purple text-white flex items-center justify-center text-5xl font-black">
                                        {profile.nickname.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>

                            {/* Name & Role */}
                            <div>
                                <h3 className="text-2xl font-black">{profile.fullName || profile.nickname}</h3>
                                {profile.department && (
                                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-gray-100 border-2 border-black text-xs font-bold">
                                        <School size={14} />
                                        {profile.department}
                                    </span>
                                )}
                            </div>

                            {/* Bio */}
                            {profile.bio && (
                                <div className="w-full bg-gray-50 p-4 border-2 border-dashed border-gray-300 italic text-gray-700">
                                    "{profile.bio}"
                                </div>
                            )}

                            {/* Contact Info (if visible) */}
                            {(profile.email || profile.phone) && (
                                <div className="w-full space-y-2 text-sm">
                                    {profile.email && (
                                        <div className="flex items-center justify-center gap-2 text-gray-600">
                                            <Mail size={16} />
                                            <span>{profile.email}</span>
                                        </div>
                                    )}
                                    {profile.phone && (
                                        <div className="flex items-center justify-center gap-2 text-gray-600">
                                            <Phone size={16} />
                                            <span>{profile.phone}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Social Links */}
                            {profile.socialLinks && Object.values(profile.socialLinks).some(v => v) && (
                                <div className="flex gap-3 mt-4 flex-wrap justify-center">
                                    {profile.socialLinks.github && (
                                        <a href={profile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="p-2 bg-black text-white hover:scale-110 transition-transform shadow-neo-sm border-2 border-black">
                                            <Github size={20} />
                                        </a>
                                    )}
                                    {profile.socialLinks.linkedin && (
                                        <a href={profile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#0077b5] text-white hover:scale-110 transition-transform shadow-neo-sm border-2 border-black">
                                            <Linkedin size={20} />
                                        </a>
                                    )}
                                    {profile.socialLinks.twitter && (
                                        <a href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="p-2 bg-black text-white hover:scale-110 transition-transform shadow-neo-sm border-2 border-black">
                                            <Twitter size={20} />
                                        </a>
                                    )}
                                    {profile.socialLinks.website && (
                                        <a href={profile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="p-2 bg-white text-black hover:scale-110 transition-transform shadow-neo-sm border-2 border-black">
                                            <Globe size={20} />
                                        </a>
                                    )}
                                    {profile.socialLinks.instagram && (
                                        <a href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-[#E1306C] text-white hover:scale-110 transition-transform shadow-neo-sm border-2 border-black">
                                            <Instagram size={20} />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
