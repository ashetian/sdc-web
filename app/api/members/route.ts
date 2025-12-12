import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import Member from '@/app/lib/models/Member';
import * as XLSX from 'xlsx';

// GET - List all members with optional search
export async function GET(request: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search') || '';
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const countOnly = searchParams.get('countOnly') === 'true';

        // If only count is needed
        if (countOnly) {
            const count = await Member.countDocuments({ isActive: true });
            return NextResponse.json({ count });
        }

        // Build query
        const query: Record<string, unknown> = { isActive: true };
        if (search) {
            query.$or = [
                { studentNo: { $regex: search, $options: 'i' } },
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;
        const [members, total] = await Promise.all([
            Member.find(query).sort({ isTestAccount: -1, fullName: 1 }).skip(skip).limit(limit),
            Member.countDocuments(query),
        ]);

        return NextResponse.json({
            members,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        return NextResponse.json({ error: 'Üyeler alınamadı' }, { status: 500 });
    }
}

// POST - Upload Excel/CSV file and import members
export async function POST(request: NextRequest) {
    try {
        await connectDB();

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const fileName = file.name.toLowerCase();

        let dataRows: string[][] = [];

        // Handle CSV files
        if (fileName.endsWith('.csv')) {
            const text = new TextDecoder('utf-8').decode(buffer);
            const lines = text.split(/\r?\n/).filter(line => line.trim());

            // Parse CSV
            dataRows = lines.map(line => {
                const row: string[] = [];
                let current = '';
                let inQuotes = false;

                for (const char of line) {
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if ((char === ',' || char === ';') && !inQuotes) {
                        row.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                row.push(current.trim());
                return row;
            });

            // Skip header row(s) - find first numeric row
            let startIndex = 0;
            for (let i = 0; i < Math.min(10, dataRows.length); i++) {
                const firstCell = dataRows[i][0]?.trim() || '';
                if (firstCell && /^\d+$/.test(firstCell)) {
                    startIndex = i;
                    break;
                }
            }
            dataRows = dataRows.slice(startIndex);

        } else {
            // Handle Excel files (.xlsx, .xls)
            const workbook = XLSX.read(buffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:G1');

            const getCellValue = (row: number, col: number): string => {
                const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
                const cell = worksheet[cellRef];
                return cell ? String(cell.v || '').trim() : '';
            };

            // Find data start row
            let dataStartRow = 2;
            for (let r = 0; r <= Math.min(10, range.e.r); r++) {
                const firstCell = getCellValue(r, 0);
                if (firstCell && /^\d+$/.test(firstCell)) {
                    dataStartRow = r;
                    break;
                }
            }

            // Read all rows
            for (let r = dataStartRow; r <= range.e.r; r++) {
                const row: string[] = [];
                for (let c = 0; c <= range.e.c; c++) {
                    row.push(getCellValue(r, c));
                }
                dataRows.push(row);
            }
        }

        console.log('Total data rows:', dataRows.length);

        // Map columns: 0:ÖğrenciNo, 1:AdSoyad, 2:Bölüm, 3:Telefon, 4:Eposta
        const members = [];
        for (const row of dataRows) {
            const studentNo = String(row[0] || '').trim();
            if (!studentNo) continue;

            members.push({
                studentNo: studentNo,
                fullName: String(row[1] || '').trim() || 'Bilinmiyor',
                department: String(row[2] || '').trim(),
                phone: String(row[3] || '').trim(),
                email: String(row[4] || '').trim().toLowerCase() || `${studentNo}@ogrenci.ktu.edu.tr`,
                isActive: true,
            });
        }

        // Remove duplicates
        const seen = new Set<string>();
        const uniqueMembers = members.filter(m => {
            if (seen.has(m.studentNo)) return false;
            seen.add(m.studentNo);
            return true;
        });

        console.log('Unique members:', uniqueMembers.length);

        if (uniqueMembers.length === 0) {
            return NextResponse.json({ error: 'Geçerli üye bulunamadı' }, { status: 400 });
        }

        // Upsert members using bulkWrite for much better performance
        // This processes all members in a single database operation instead of one-by-one
        const bulkOps = uniqueMembers.map(member => ({
            updateOne: {
                filter: { studentNo: member.studentNo },
                update: { $set: member },
                upsert: true
            }
        }));

        const bulkResult = await Member.bulkWrite(bulkOps, { ordered: false });
        const upsertCount = bulkResult.upsertedCount + bulkResult.modifiedCount;

        return NextResponse.json({
            message: `${upsertCount} üye yüklendi/güncellendi`,
            count: upsertCount
        }, { status: 201 });
    } catch (error) {
        console.error('Error uploading members:', error);
        return NextResponse.json({ error: 'Üyeler yüklenemedi: ' + (error as Error).message }, { status: 500 });
    }
}

// DELETE - Clear all non-registered members (registered members are protected)
export async function DELETE() {
    try {
        await connectDB();

        // Count protected members (registered users)
        const protectedCount = await Member.countDocuments({ isRegistered: true });

        // Only delete non-registered members
        const result = await Member.deleteMany({ isRegistered: { $ne: true } });

        const message = protectedCount > 0
            ? `Kayıtsız üyeler silindi. ${protectedCount} kayıtlı üye korundu.`
            : 'Tüm kayıtsız üyeler silindi';

        return NextResponse.json({
            message,
            deletedCount: result.deletedCount,
            protectedCount
        });
    } catch (error) {
        console.error('Error deleting members:', error);
        return NextResponse.json({ error: 'Üyeler silinemedi' }, { status: 500 });
    }
}
