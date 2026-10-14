import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'benign';

    const filenameMap = {
      benign: 'sample_benign.csv',
      attack: 'sample_attack.csv',
      mixed: 'sample_mixed_batch.csv',
    };

    const targetFile = filenameMap[type] || 'sample_benign.csv';
    const filePath = path.join(process.cwd(), 'public', targetFile);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: `Sample file ${targetFile} not found.` },
        { status: 404 }
      );
    }

    const csvText = fs.readFileSync(filePath, 'utf-8');
    return NextResponse.json({
      success: true,
      type,
      filename: targetFile,
      csvText,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to read sample data' },
      { status: 500 }
    );
  }
}
