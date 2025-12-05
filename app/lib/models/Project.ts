import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProject extends Document {
    memberId: mongoose.Types.ObjectId;
    title: string;
    titleEn?: string;
    description: string;
    descriptionEn?: string;
    githubUrl: string;
    demoUrl?: string;
    technologies: string[];
    status: 'pending' | 'approved' | 'rejected';
    rejectionReason?: string;
    viewCount: number;
    isDeleted: boolean;
    deletedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
    {
        memberId: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
            required: true,
            index: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        titleEn: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            required: true,
            maxlength: 1000,
        },
        descriptionEn: {
            type: String,
            maxlength: 1000,
        },
        githubUrl: {
            type: String,
            required: true,
            validate: {
                validator: function (v: string) {
                    return /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+\/?$/.test(v);
                },
                message: 'Geçerli bir GitHub repo URL\'si girin',
            },
        },
        demoUrl: {
            type: String,
            validate: {
                validator: function (v: string) {
                    if (!v) return true;
                    return /^https?:\/\/.+/.test(v);
                },
                message: 'Geçerli bir URL girin',
            },
        },
        technologies: {
            type: [String],
            default: [],
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
            index: true,
        },
        rejectionReason: {
            type: String,
            maxlength: 500,
        },
        viewCount: {
            type: Number,
            default: 0,
        },
        isDeleted: {
            type: Boolean,
            default: false,
            index: true,
        },
        deletedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for soft-deleted projects
ProjectSchema.index({ isDeleted: 1, deletedAt: 1 });

// GitHub URL'den owner/repo bilgisini çıkar
ProjectSchema.methods.getGithubInfo = function () {
    const match = this.githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (match) {
        return { owner: match[1], repo: match[2].replace(/\/$/, '') };
    }
    return null;
};

// OpenGraph preview URL'si oluştur
ProjectSchema.methods.getPreviewUrl = function () {
    const info = this.getGithubInfo();
    if (info) {
        return `https://opengraph.githubassets.com/1/${info.owner}/${info.repo}`;
    }
    return null;
};

const Project: Model<IProject> =
    mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);

export default Project;
