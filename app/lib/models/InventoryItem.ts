import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type InventoryStatus = 'available' | 'assigned' | 'maintenance' | 'lost' | 'broken';

export interface IInventoryItem extends Document {
    name: string;
    category: string;
    serialNumber?: string;
    description?: string;
    status: InventoryStatus;
    assignedTo?: Types.ObjectId;
    assignedToName?: string; // Cache mechanism for easier display
    assignedAt?: Date;
    dueDate?: Date; // Optional return deadline
    photo?: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const InventoryItemSchema = new Schema<IInventoryItem>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String, // Electronics, Furniture, etc.
            required: true,
            trim: true,
        },
        serialNumber: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            enum: ['available', 'assigned', 'maintenance', 'lost', 'broken'],
            default: 'available',
            index: true,
        },
        assignedTo: {
            type: Schema.Types.ObjectId,
            ref: 'Member',
        },
        assignedToName: { // Cached name for quick access
            type: String,
        },
        assignedAt: {
            type: Date,
        },
        dueDate: {
            type: Date,
        },
        photo: {
            type: String,
        },
        notes: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
InventoryItemSchema.index({ category: 1 });
InventoryItemSchema.index({ serialNumber: 1 });

const InventoryItem: Model<IInventoryItem> =
    mongoose.models.InventoryItem || mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);

export default InventoryItem;
