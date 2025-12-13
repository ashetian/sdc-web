'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useLanguage } from '../../_context/LanguageContext';
import { SkeletonForm, SkeletonPageHeader, SkeletonFullPage } from "@/app/_components/Skeleton";
import { Button } from '@/app/_components/ui';

// Local types - page-specific structure
interface Election {
    _id: string;
    title: string;
    description?: string;
    status: 'draft' | 'active' | 'completed' | 'suspended';
    useRankedChoice: boolean;
    isSuspended?: boolean;
    suspensionReason?: string;
}

interface Candidate {
    _id: string;
    name: string;
    photo?: string;
    bio?: string;
}

function SortableCandidate({ candidate, index }: { candidate: Candidate; index: number }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: candidate._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="flex items-center gap-4 p-4 bg-white border-4 border-black cursor-grab active:cursor-grabbing hover:shadow-neo transition-all"
        >
            <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-black text-xl">
                {index + 1}
            </div>
            {candidate.photo ? (
                <div className="w-16 h-16 border-2 border-black relative flex-shrink-0">
                    <Image src={candidate.photo} alt={candidate.name} fill className="object-cover" />
                </div>
            ) : (
                <div className="w-16 h-16 bg-gray-200 border-2 border-black flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-black">{candidate.name[0]}</span>
                </div>
            )}
            <div className="flex-1">
                <h3 className="font-black text-lg">{candidate.name}</h3>
                {candidate.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2">{candidate.bio}</p>
                )}
            </div>
            <div className="text-gray-400 text-2xl">☰</div>
        </div>
    );
}

export default function VotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [election, setElection] = useState<Election | null>(null);
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState<'verify' | 'otp' | 'vote' | 'success'>('verify');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { language } = useLanguage();

    // Form data
    const [studentNo, setStudentNo] = useState('');
    const [email, setEmail] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [maskedEmail, setMaskedEmail] = useState('');
    const [rankings, setRankings] = useState<Candidate[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const labels = {
        tr: {
            loading: 'Yükleniyor...',
            notFound: 'Seçim Bulunamadı',
            notStarted: 'Bu seçim henüz başlamamıştır.',
            ended: 'Bu seçim sona ermiştir.',
            rankedChoiceInfo: 'ⓘ Çok tercihli oylama sistemi - Adayları tercih sıranıza göre sıralayın',
            suspendedTitle: '⚠️ Seçim Askıya Alındı',
            suspendedDesc: 'Bu seçim olağanüstü bir durum nedeniyle askıya alınmıştır.',
            verifyTitle: 'Kimlik Doğrulama',
            studentNo: 'Öğrenci Numarası',
            studentNoPlaceholder: 'Örn: 445851',
            email: 'E-posta Adresi',
            emailPlaceholder: 'ornek@ktu.edu.tr',
            sendCode: 'Doğrulama Kodu Gönder',
            sending: 'Gönderiliyor...',
            verifyFail: 'Doğrulama başarısız',
            connectionError: 'Bağlantı hatası',
            otpTitle: 'Doğrulama Kodu',
            otpDesc: 'adresine gönderilen 6 haneli kodu girin.',
            continue: 'Devam Et',
            back: 'Geri Dön',
            dragInfo: '👆 Adayları sürükleyerek tercih sıranızı belirleyin (En üstteki 1. tercihiniz)',
            voteInfo: '👆 Oylamak istediğiniz adayı en üste taşıyın',
            submitVote: 'OYUMU GÖNDER',
            voteFail: 'Oy gönderilemedi',
            successTitle: 'Oyunuz Kaydedildi!',
            successDesc: 'Katılımınız için teşekkür ederiz. Seçim sonuçlandığında sonuçlar açıklanacaktır.'
        },
        en: {
            loading: 'Loading...',
            notFound: 'Election Not Found',
            notStarted: 'This election has not started yet.',
            ended: 'This election has ended.',
            rankedChoiceInfo: 'ⓘ Ranked choice voting system - Rank candidates in order of preference',
            suspendedTitle: '⚠️ Election Suspended',
            suspendedDesc: 'This election has been suspended due to an emergency.',
            verifyTitle: 'Identity Verification',
            studentNo: 'Student Number',
            studentNoPlaceholder: 'Ex: 445851',
            email: 'Email Address',
            emailPlaceholder: 'example@ktu.edu.tr',
            sendCode: 'Send Verification Code',
            sending: 'Sending...',
            verifyFail: 'Verification failed',
            connectionError: 'Connection error',
            otpTitle: 'Verification Code',
            otpDesc: 'Enter the 6-digit code sent to',
            continue: 'Continue',
            back: 'Go Back',
            dragInfo: '👆 Drag candidates to rank your preference (Top is your 1st choice)',
            voteInfo: '👆 Move the candidate you want to vote for to the top',
            submitVote: 'SUBMIT VOTE',
            voteFail: 'Failed to submit vote',
            successTitle: 'Vote Recorded!',
            successDesc: 'Thank you for participating. Results will be announced when the election concludes.'
        }
    };

    const l = labels[language];

    useEffect(() => {
        fetchElection();
    }, [id]);

    const fetchElection = async () => {
        try {
            const [electionRes, candidatesRes] = await Promise.all([
                fetch(`/api/elections/${id}`),
                fetch(`/api/elections/${id}/candidates`),
            ]);

            if (electionRes.ok) {
                setElection(await electionRes.json());
            }
            if (candidatesRes.ok) {
                const data = await candidatesRes.json();
                setCandidates(data);
                setRankings(data);
            }
        } catch (error) {
            console.error('Seçim yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch(`/api/elections/${id}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentNo, email }),
            });

            const data = await res.json();

            if (res.ok) {
                setMaskedEmail(data.email);
                setStep('otp');
            } else {
                setError(data.error || l.verifyFail);
            }
        } catch {
            setError(l.connectionError);
        } finally {
            setSubmitting(false);
        }
    };

    const handleVote = async () => {
        setError('');
        setSubmitting(true);

        try {
            const res = await fetch(`/api/elections/${id}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentNo,
                    code: otpCode,
                    rankings: rankings.map(c => c._id),
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setStep('success');
            } else {
                setError(data.error || l.voteFail);
            }
        } catch {
            setError(l.connectionError);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setRankings((items) => {
                const oldIndex = items.findIndex((i) => i._id === active.id);
                const newIndex = items.findIndex((i) => i._id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    if (loading) {
        return (
            <SkeletonFullPage>
                <SkeletonPageHeader />
                <SkeletonForm />
            </SkeletonFullPage>
        );
    }

    if (!election) {
        return (
            <div className="min-h-screen bg-neo-yellow flex items-center justify-center p-4">
                <div className="bg-white border-4 border-black shadow-neo p-8 text-center">
                    <h1 className="text-2xl font-black text-red-500">{l.notFound}</h1>
                </div>
            </div>
        );
    }

    if (election.status !== 'active' || election.isSuspended) {
        return (
            <div className="min-h-screen bg-neo-yellow flex items-center justify-center p-4">
                <div className="bg-white border-4 border-black shadow-neo p-8 text-center max-w-md">
                    <h1 className="text-2xl font-black mb-4">{election.title}</h1>
                    {election.isSuspended ? (
                        <>
                            <div className="text-5xl mb-4">⚠️</div>
                            <h2 className="text-xl font-black text-orange-600 mb-4">{l.suspendedTitle}</h2>
                            <p className="text-gray-600 font-bold mb-4">{l.suspendedDesc}</p>
                            {election.suspensionReason && (
                                <div className="bg-orange-100 border-2 border-orange-500 p-4 text-left">
                                    <p className="font-bold text-orange-800">
                                        {election.suspensionReason}
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="text-gray-600 font-bold">
                            {election.status === 'draft'
                                ? l.notStarted
                                : l.ended}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neo-yellow p-4 pt-24 pb-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white border-4 border-black shadow-neo p-6 mb-6 text-center">
                    <h1 className="text-2xl font-black uppercase">{election.title}</h1>
                    {election.description && (
                        <p className="text-gray-600 font-medium mt-2">{election.description}</p>
                    )}
                    {election.useRankedChoice && candidates.length > 2 && (
                        <p className="text-sm text-neo-purple font-bold mt-2">
                            {l.rankedChoiceInfo}
                        </p>
                    )}
                </div>

                {/* Step: Verify */}
                {step === 'verify' && (
                    <div className="bg-white border-4 border-black shadow-neo p-6">
                        <h2 className="text-xl font-black mb-4">{l.verifyTitle}</h2>
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div>
                                <label className="block text-sm font-black uppercase mb-1">{l.studentNo}</label>
                                <input
                                    type="text"
                                    value={studentNo}
                                    onChange={(e) => setStudentNo(e.target.value)}
                                    placeholder={l.studentNoPlaceholder}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-black uppercase mb-1">{l.email}</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={l.emailPlaceholder}
                                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:shadow-neo"
                                    required
                                />
                            </div>

                            {error && (
                                <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 font-bold">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={submitting}
                                isLoading={submitting}
                                fullWidth
                            >
                                {l.sendCode}
                            </Button>
                        </form>
                    </div>
                )}

                {/* Step: OTP */}
                {step === 'otp' && (
                    <div className="bg-white border-4 border-black shadow-neo p-6">
                        <h2 className="text-xl font-black mb-4">{l.otpTitle}</h2>
                        <p className="text-gray-600 mb-4">
                            <strong>{maskedEmail}</strong> {l.otpDesc}
                        </p>
                        <div className="space-y-4">
                            <div>
                                <input
                                    type="text"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    className="w-full px-4 py-4 border-4 border-black font-black text-2xl text-center tracking-widest focus:outline-none focus:shadow-neo"
                                    maxLength={6}
                                />
                            </div>

                            {error && (
                                <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 font-bold">
                                    {error}
                                </div>
                            )}

                            <Button
                                onClick={() => {
                                    if (otpCode.length === 6) {
                                        setStep('vote');
                                        setError('');
                                    }
                                }}
                                disabled={otpCode.length !== 6}
                                variant="success"
                                fullWidth
                            >
                                {l.continue}
                            </Button>

                            <Button
                                onClick={() => setStep('verify')}
                                variant="secondary"
                                fullWidth
                            >
                                {l.back}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Step: Vote */}
                {step === 'vote' && (
                    <div className="space-y-4">
                        <div className="bg-white border-4 border-black shadow-neo p-4">
                            <p className="font-bold text-center">
                                {election.useRankedChoice && candidates.length > 2
                                    ? l.dragInfo
                                    : l.voteInfo}
                            </p>
                        </div>

                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={rankings.map(c => c._id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <div className="space-y-3">
                                    {rankings.map((candidate, index) => (
                                        <SortableCandidate
                                            key={candidate._id}
                                            candidate={candidate}
                                            index={index}
                                        />
                                    ))}
                                </div>
                            </SortableContext>
                        </DndContext>

                        {error && (
                            <div className="bg-red-100 border-4 border-red-500 text-red-700 p-3 font-bold">
                                {error}
                            </div>
                        )}

                        <Button
                            onClick={handleVote}
                            disabled={submitting}
                            isLoading={submitting}
                            fullWidth
                        >
                            {l.submitVote}
                        </Button>

                        <Button
                            onClick={() => setStep('otp')}
                            variant="secondary"
                            fullWidth
                        >
                            {l.back}
                        </Button>
                    </div>
                )}

                {/* Step: Success */}
                {step === 'success' && (
                    <div className="bg-neo-green border-4 border-black shadow-neo p-8 text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <h2 className="text-2xl font-black uppercase mb-4">{l.successTitle}</h2>
                        <p className="font-bold text-gray-800">
                            {l.successDesc}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
