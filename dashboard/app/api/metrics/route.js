import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

  // 1. If backend URL is configured (e.g., Render deployment), forward request to FastAPI
  if (backendUrl) {
    try {
      const cleanUrl = backendUrl.replace(/\/$/, '');
      const res = await fetch(`${cleanUrl}/metrics`, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data);
      }
    } catch (remoteErr) {
      console.warn(`[DeepGuard API] Failed to fetch metrics from backend (${backendUrl}):`, remoteErr.message);
      // Fall through to local fallback if available
    }
  }

  // 2. Local filesystem fallback (for offline local development)
  try {
    const rootDir = path.resolve(process.cwd(), '..');
    const modelDir = path.join(rootDir, 'model');

    if (!fs.existsSync(modelDir)) {
      if (backendUrl) {
        return NextResponse.json(
          {
            success: false,
            error: `Could not reach backend at ${backendUrl}. Check if your Render Web Service is starting up (cold start may take 30-50s).`,
          },
          { status: 503 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: 'Model directory not found and BACKEND_URL is not set. For Vercel, set BACKEND_URL in project environment variables.',
        },
        { status: 500 }
      );
    }

    const readJsonSafe = (filename) => {
      const p = path.join(modelDir, filename);
      if (fs.existsSync(p)) {
        try {
          return JSON.parse(fs.readFileSync(p, 'utf-8'));
        } catch (e) {
          return null;
        }
      }
      return null;
    };

    const evaluationMetrics = readJsonSafe('evaluation_metrics.json');
    const modelMetadata = readJsonSafe('model_metadata.json');
    const trainingHistory = readJsonSafe('training_history.json');
    const labelMapping = readJsonSafe('label_mapping.json');
    const featureSchema = readJsonSafe('feature_schema.json');

    const expectedArtifacts = [
      'deepguard_model.pth',
      'preprocessor.joblib',
      'feature_schema.json',
      'label_mapping.json',
      'model_metadata.json',
      'evaluation_metrics.json',
      'training_history.json',
      'confusion_matrix.png',
      'baseline_model.joblib',
      'training_curve.png',
    ];

    const artifactStatus = expectedArtifacts.map((name) => {
      const filePath = path.join(modelDir, name);
      const exists = fs.existsSync(filePath);
      const sizeBytes = exists ? fs.statSync(filePath).size : 0;
      return {
        name,
        exists,
        sizeBytes,
        status: exists && sizeBytes > 0 ? 'verified' : 'missing',
      };
    });

    const verifiedCount = artifactStatus.filter((a) => a.exists && a.sizeBytes > 0).length;
    const readiness =
      verifiedCount === expectedArtifacts.length
        ? 'ready'
        : verifiedCount > 0
        ? 'partial'
        : 'unready';

    return NextResponse.json({
      success: true,
      readiness,
      verifiedCount,
      totalExpected: expectedArtifacts.length,
      artifacts: artifactStatus,
      evaluationMetrics,
      modelMetadata,
      trainingHistory,
      labelMapping,
      featureSchemaSummary: featureSchema
        ? {
            featureCount: featureSchema.feature_count,
            categoricalColumns: featureSchema.categorical_columns,
            numericalCount: (featureSchema.numerical_columns || []).length,
          }
        : null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to load model metrics',
      },
      { status: 500 }
    );
  }
}
