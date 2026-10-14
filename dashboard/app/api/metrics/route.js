import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const rootDir = path.resolve(process.cwd(), '..');
    const modelDir = path.join(rootDir, 'model');

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
