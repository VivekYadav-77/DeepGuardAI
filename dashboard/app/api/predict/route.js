import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { NextResponse } from 'next/server';

export async function POST(request) {
  let tempCsvPath = null;
  try {
    const body = await request.json();
    const rootDir = path.resolve(process.cwd(), '..');

    // Determine python executable: prefer .venv/Scripts/python.exe
    let pythonExecutable = 'python';
    const venvPythonWin = path.join(rootDir, '.venv', 'Scripts', 'python.exe');
    const venvPythonUnix = path.join(rootDir, '.venv', 'bin', 'python');

    if (fs.existsSync(venvPythonWin)) {
      pythonExecutable = venvPythonWin;
    } else if (fs.existsSync(venvPythonUnix)) {
      pythonExecutable = venvPythonUnix;
    }

    let csvContent = '';
    if (body.csvText && typeof body.csvText === 'string') {
      csvContent = body.csvText.trim();
    } else if (Array.isArray(body.records) && body.records.length > 0) {
      const headers = Object.keys(body.records[0]);
      const rows = body.records.map((rec) =>
        headers.map((h) => (rec[h] !== undefined ? String(rec[h]) : '')).join(',')
      );
      csvContent = [headers.join(','), ...rows].join('\n');
    } else {
      return NextResponse.json(
        { success: false, error: 'No CSV data or records provided in request payload.' },
        { status: 400 }
      );
    }

    if (!csvContent) {
      return NextResponse.json(
        { success: false, error: 'Uploaded CSV is empty (0 bytes).' },
        { status: 400 }
      );
    }

    // Write temp CSV file
    const tempDir = path.join(rootDir, 'dashboard', '.temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const timestamp = Date.now();
    tempCsvPath = path.join(tempDir, `inference_${timestamp}.csv`);
    fs.writeFileSync(tempCsvPath, csvContent, 'utf-8');

    // Run Python inference via child_process
    const runInferencePromise = new Promise((resolve, reject) => {
      const pyProcess = spawn(
        pythonExecutable,
        ['-m', 'src.inference', '--csv', tempCsvPath],
        {
          cwd: rootDir,
          env: { ...process.env, PYTHONIOENCODING: 'utf-8' },
        }
      );

      let stdout = '';
      let stderr = '';

      pyProcess.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      pyProcess.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      pyProcess.on('close', (code) => {
        if (code === 0) {
          try {
            // Find valid JSON in stdout
            const jsonStart = stdout.indexOf('{');
            const jsonEnd = stdout.lastIndexOf('}');
            if (jsonStart !== -1 && jsonEnd !== -1) {
              const cleanJson = stdout.slice(jsonStart, jsonEnd + 1);
              const parsed = JSON.parse(cleanJson);
              resolve(parsed);
            } else {
              reject(new Error(`Failed to parse Python response: ${stdout || stderr}`));
            }
          } catch (e) {
            reject(new Error(`JSON parse error from Python output: ${e.message}\nRaw: ${stdout}`));
          }
        } else {
          reject(new Error(stderr || stdout || `Python inference exited with code ${code}`));
        }
      });

      pyProcess.on('error', (err) => {
        reject(new Error(`Failed to start Python process: ${err.message}`));
      });
    });

    const result = await runInferencePromise;

    // Cleanup temp file
    if (tempCsvPath && fs.existsSync(tempCsvPath)) {
      try {
        fs.unlinkSync(tempCsvPath);
      } catch (_) {}
    }

    if (result.success === false) {
      return NextResponse.json(
        {
          success: false,
          error: result.errors ? result.errors.join('; ') : 'Validation failed',
          warnings: result.warnings || [],
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      row_count: result.row_count,
      warnings: result.warnings || [],
      predictions: result.results.predictions,
      confidence_scores: result.results.confidence_scores,
      labels: result.results.labels,
      summary: result.results.summary,
    });
  } catch (error) {
    if (tempCsvPath && fs.existsSync(tempCsvPath)) {
      try {
        fs.unlinkSync(tempCsvPath);
      } catch (_) {}
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Inference execution failed',
      },
      { status: 500 }
    );
  }
}
