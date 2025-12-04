import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/app/lib/db';
import ClubMember from '@/app/lib/models/ClubMember';
import * as XLSX from 'xlsx';

// GET - List members for an election
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        const members = await ClubMember.find({ electionId: id })
            .sort({ fullName: 1 });

        return NextResponse.json(members);
    } catch (error) {
        console.error('Error fetching members:', error);
        return NextResponse.json({ error: 'Üyeler alınamadı' }, { status: 500 });
    }
}

// POST - Upload Excel/CSV file and import members
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

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

            console.log('CSV Total lines:', lines.length);

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
            console.log('Excel range:', worksheet['!ref']);

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

        console.log('=== DATA DEBUG ===');
        console.log('Total data rows:', dataRows.length);
        for (let i = 0; i < Math.min(3, dataRows.length); i++) {
            console.log(`Row ${i}:`, dataRows[i]);
        }
        console.log('==================');

        // Clear existing members
        await ClubMember.deleteMany({ electionId: id });

        // Map columns: 0:ÖğrenciNo, 1:AdSoyad, 2:Bölüm, 3:Telefon, 4:Eposta
        const members = [];
        for (const row of dataRows) {
            const studentNo = String(row[0] || '').trim();
            if (!studentNo) continue;

            members.push({
                electionId: id,
                rowNo: '',
                clubName: '',
                studentNo: studentNo,
                fullName: String(row[1] || '').trim() || 'Bilinmiyor',
                department: String(row[2] || '').trim(),
                phone: String(row[3] || ''),
                email: String(row[4] || '').trim().toLowerCase() || `${studentNo}@ogrenci.ktu.edu.tr`,
                memberType: '',
                memberStatus: '',
                hasVoted: false,
            });
        }

        console.log('Members found:', members.length);

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

        const result = await ClubMember.insertMany(uniqueMembers, { ordered: false });

        return NextResponse.json({
            message: `${result.length} üye başarıyla yüklendi`,
            count: result.length
        }, { status: 201 });
    } catch (error) {
        console.error('Error uploading members:', error);
        return NextResponse.json({ error: 'Üyeler yüklenemedi: ' + (error as Error).message }, { status: 500 });
    }
}

// DELETE - Clear all members for an election
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;

        await ClubMember.deleteMany({ electionId: id });

        return NextResponse.json({ message: 'Üye listesi temizlendi' });
    } catch (error) {
        console.error('Error deleting members:', error);
        return NextResponse.json({ error: 'Üyeler silinemedi' }, { status: 500 });
    }
}
