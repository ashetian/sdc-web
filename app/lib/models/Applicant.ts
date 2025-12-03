import mongoose from 'mongoose';

export interface IApplicant {
    // Personal Information
    fullName: string;
    faculty: string;
    department: string;
    classYear: string;
    phone: string;
    email: string;
    github?: string;
    linkedin?: string;

    // Department Selection
    selectedDepartment: 'Proje Departmanı' | 'Teknik Departman' | 'Medya Departmanı' | 'Kurumsal İletişim Departmanı';

    // General Questions
    motivation: string;
    hasExperience: boolean;
    experienceDescription?: string;

    // Department-Specific Answers (stored as JSON for flexibility)
    departmentSpecificAnswers: Record<string, string>;

    // Additional Notes
    additionalNotes?: string;

    // KVKK Consent
    kvkkConsent: boolean;
    communicationConsent: boolean;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

const applicantSchema = new mongoose.Schema<IApplicant>(
    {
        fullName: {
            type: String,
            required: true,
        },
        faculty: {
            type: String,
            required: true,
        },
        department: {
            type: String,
            required: true,
        },
        classYear: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        github: {
            type: String,
            required: false,
        },
        linkedin: {
            type: String,
            required: false,
        },
        selectedDepartment: {
            type: String,
            required: true,
            enum: ['Proje Departmanı', 'Teknik Departman', 'Medya Departmanı', 'Kurumsal İletişim Departmanı'],
        },
        motivation: {
            type: String,
            required: true,
        },
        hasExperience: {
            type: Boolean,
            required: true,
        },
        experienceDescription: {
            type: String,
            required: false,
        },
        departmentSpecificAnswers: {
            type: Map,
            of: String,
            required: true,
        },
        additionalNotes: {
            type: String,
            required: false,
        },
        kvkkConsent: {
            type: Boolean,
            required: true,
        },
        communicationConsent: {
            type: Boolean,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Applicant = mongoose.models.Applicant || mongoose.model<IApplicant>('Applicant', applicantSchema);
