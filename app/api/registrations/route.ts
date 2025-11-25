import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import { Registration } from '@/app/lib/models/Registration';
import { Event } from '@/app/lib/models/Event';
import { writeFile } from 'fs/promises';
import path from 'path';
import { sendRegistrationEmail } from '@/app/lib/email/client';

export async function POST(request: Request) {
    try {
        await connectDB();

        const contentType = request.headers.get('content-type') || '';
        let body: any;
        let paymentReceiptUrl: string | undefined;

        // Handle file upload (FormData) or regular JSON
        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData();

            // Extract form fields
            body = {
                eventId: formData.get('eventId'),
                studentNumber: formData.get('studentNumber'),
                name: formData.get('name'),
                phone: formData.get('phone'),
                department: formData.get('department'),
                email: formData.get('email'),
            };

            // Handle file upload
            const file = formData.get('paymentReceipt') as File | null;
            if (file) {
                const bytes = await file.arrayBuffer();
                const buffer = Buffer.from(bytes);

                // Create unique filename
                const timestamp = Date.now();
                const fileName = `${timestamp}-${file.name.replace(/\s+/g, '-')}`;
                const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
                const filePath = path.join(uploadDir, fileName);

                // Ensure directory exists
                const fs = require('fs');
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                // Write file
                await writeFile(filePath, buffer);
                paymentReceiptUrl = `/uploads/receipts/${fileName}`;
            }
        } else {
            body = await request.json();
        }

        const { eventId, studentNumber } = body;

        // Check if event exists and is open
        const event = await Event.findById(eventId);
        if (!event) {
            return NextResponse.json({ error: 'Etkinlik bulunamadı.' }, { status: 404 });
        }
        if (!event.isOpen) {
            return NextResponse.json({ error: 'Bu etkinlik için başvurular kapalı.' }, { status: 400 });
        }

        // Check for duplicate registration
        const existingRegistration = await Registration.findOne({
            eventId,
            $or: [{ studentNumber }, { email: body.email }]
        });
        if (existingRegistration) {
            return NextResponse.json({ error: 'Bu öğrenci numarası veya e-posta ile zaten kayıt olunmuş.' }, { status: 400 });
        }

        // Create registration with appropriate payment status
        const registrationData = {
            ...body,
            paymentReceiptUrl,
            paymentStatus: event.isPaid ? 'pending' : 'verified',
        };

        const registration = await Registration.create(registrationData);

        // Send registration confirmation email
        try {
            await sendRegistrationEmail({
                name: body.name,
                email: body.email,
                eventTitle: event.title,
                eventDate: event.eventDate,
                studentNumber: body.studentNumber,
                isPaid: event.isPaid,
                fee: event.fee,
                paymentIBAN: event.paymentIBAN,
                paymentDetails: event.paymentDetails,
            });
        } catch (emailError) {
            console.error('Failed to send registration email:', emailError);
            // Don't fail the registration if email fails
        }

        return NextResponse.json(registration, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Kayıt oluşturulamadı.' }, { status: 500 });
    }
}
