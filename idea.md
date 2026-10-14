# DeepGuard AI — Master Project Implementation Prompt

## 1. Your Role

Act as a senior machine learning engineer, Python developer, QA engineer, UI designer, and academic project mentor.

Build a complete, functional, reproducible B.Tech academic project called **DeepGuard AI**.

You are responsible for implementing, testing, debugging, documenting, and preparing the project for deployment. Do not stop after generating code. Execute whatever checks are available in your current environment and provide exact manual execution instructions for anything that requires Google Colab.

## 2. Project Definition

**Project title:** Deep Learning-Based Network Intrusion Detection and Threat Classification System

**Project name:** DeepGuard AI

**Problem statement:** Network traffic records can contain patterns associated with legitimate activity and potentially malicious activity. The project uses supervised deep learning to classify labeled network traffic records and provides a dashboard for analyzing predictions and evaluating the model.

**Primary objective:** Build an academic demonstration of a complete machine learning pipeline, from dataset preprocessing and model training to evaluation, inference, visualization, and deployment.

The system must analyze supplied datasets or uploaded traffic-feature CSV files. Do not claim live network monitoring, packet inspection, or real-time attack prevention unless those capabilities are genuinely implemented and tested.

## 3. Hard Constraints

- Complete the usable project and submission materials today.
- Assume the developer has a low-spec local computer.
- Use Google Colab for data-intensive preprocessing, model training, and evaluation.
- Use Antigravity for project development, code generation, debugging, and documentation.
- Use free tools and services only.
- Do not require a dedicated GPU.
- Support CPU-only inference.
- Do not use paid APIs or services.
- Do not create unnecessary microservices or infrastructure.
- Do not require a database unless a concrete requirement justifies it.
- Do not assume that Antigravity can directly control or execute commands in Google Colab.
- Never fabricate datasets, training results, evaluation metrics, citations, or deployment URLs.
- Never declare a feature complete without implementing and checking it.
- Prefer a small, fully working project over a large, incomplete project.

## 4. Technology Stack

Use the following stack unless a genuine compatibility issue requires a documented change.

- Python
- PyTorch
- Pandas
- NumPy
- Scikit-learn
- Streamlit
- Plotly
- Joblib, when appropriate
- Matplotlib or Seaborn only when needed for report-quality plots

Use Google Colab to train and evaluate the model.

Use Streamlit for the primary application so the UI and inference pipeline can run together without unnecessary frontend/backend integration.

Use Hugging Face Spaces as the preferred free deployment target, subject to available resources, current service terms, and successful verification.

Do not add FastAPI, React, PostgreSQL, Redis, Docker, or authentication unless required for a clearly defined project feature.

## 5. Phase 0 — Inspect and Plan

Before implementing anything:

1. Inspect the current project directory.
2. Check available files, Python version, installed packages, and environment constraints.
3. Avoid overwriting existing user work.
4. Identify the shortest reliable path to a working submission.
5. Create a checklist of implementation tasks.
6. Identify risks involving dataset availability, download size, memory, package compatibility, and deployment.
7. Start implementation immediately after this inspection. Do not spend excessive time planning.

If a dependency or dataset is unavailable, identify a practical alternative and explain the trade-off.

## 6. Phase 1 — Dataset Selection

Select a legitimate, publicly accessible, labeled network intrusion detection dataset that can be processed within the available time.

Candidate datasets may include NSL-KDD, UNSW-NB15, or a suitable subset of CIC-IDS2017.

Do not assume that any particular dataset is small, immediately downloadable, or unrestricted.

Evaluate candidate datasets based on:

- Availability and download reliability.
- Dataset size.
- Label quality.
- Availability of benign and malicious examples.
- Suitability for binary classification.
- Preprocessing complexity.
- Suitability for academic demonstration.
- Dataset licensing and attribution requirements.

Prefer a manageable dataset or representative subset that can be processed using limited resources.

Do not waste the day downloading a huge dataset. If the preferred source fails or is too large, switch to a smaller legitimate alternative.

Document the exact dataset name, source URL, access date if known, original size if verified, selected subset, target labels, and limitations.

Do not generate synthetic data and present it as genuine network traffic.

## 7. Phase 2 — Data Preprocessing

Implement reproducible preprocessing.

Requirements:

1. Load the selected dataset.
2. Inspect the columns, data types, labels, missing values, duplicates, and class distribution.
3. Remove invalid records only when justified and documented.
4. Separate the target label from input features.
5. Remove identifiers or features that would cause target leakage or unrealistic shortcuts.
6. Handle categorical and numerical features appropriately.
7. Handle missing and infinite values.
8. Define a consistent feature schema.
9. Separate training, validation, and test data before fitting preprocessing transformations.
10. Fit scalers and encoders on training data only.
11. Apply the fitted transformations to validation and test data.
12. Preserve the exact input feature order for inference.
13. Set random seeds where applicable.
14. Save the preprocessing configuration and class mapping.

Choose the splitting strategy based on the dataset structure.

If records share sessions, hosts, duplicated examples, or related observations, investigate whether a random split would cause leakage. Prefer a group-aware or otherwise defensible split where feasible.

If the dataset has highly imbalanced classes, document this and choose appropriate evaluation metrics.

Do not silently drop difficult classes merely to improve reported accuracy.

## 8. Phase 3 — Train a Genuine Deep Learning Model

Implement a small supervised multilayer perceptron using PyTorch.

Requirements:

- Input dimension must match the processed feature count.
- Use appropriate hidden layers and activation functions.
- Use a suitable output layer and loss function.
- Handle binary classification correctly.
- Use an appropriate optimizer.
- Use a validation strategy.
- Use reasonable batch sizes and a bounded number of epochs.
- Use early stopping when practical.
- Use CPU when no GPU is available.
- If a Colab GPU is available, use it only when it provides a real benefit.
- Print or record the actual training configuration.
- Record training and validation loss.
- Detect non-finite losses or invalid outputs.
- Save the best model according to a documented validation criterion.

Do not train a large architecture unnecessarily.

The project must contain actual PyTorch model training, not merely an API call to a pretrained external model.

## 9. Phase 4 — Baseline and Evaluation

Train a simple conventional baseline classifier, such as logistic regression or a small tree-based model, using the same defensible data split.

Evaluate the neural network and baseline on the same held-out test data.

Calculate actual values for:

- Accuracy.
- Precision.
- Recall.
- F1-score.
- Confusion matrix.
- Per-class performance where applicable.

For imbalanced datasets, emphasize malicious-class recall, precision, F1-score, and false-positive behavior rather than accuracy alone.

Where feasible, include ROC-AUC or PR-AUC with a clearly defined positive class.

Ensure that all preprocessing is fitted without access to test data.

Record:

- Dataset split sizes.
- Class distributions.
- Model architecture.
- Training configuration.
- Actual measured metrics.
- Limitations and observed errors.

Do not invent impressive results or claim that the neural network is superior if the measured results do not support that conclusion.

## 10. Phase 5 — Artifact Export

Export everything needed for reproducible inference.

Recommended artifact structure:

- `deepguard_model.pth` — PyTorch model weights.
- `preprocessor.joblib` — fitted preprocessing pipeline, where appropriate.
- `feature_schema.json` — expected input feature names and order.
- `label_mapping.json` — label encoding and display names.
- `model_metadata.json` — architecture and training configuration.
- `evaluation_metrics.json` — actual evaluation results.
- `confusion_matrix.png` — optional report visualization.
- `training_history.json` — optional loss history.

The exact artifact names may change if the implementation has a documented reason.

Create a reliable model-loading function that reconstructs the correct architecture before loading the weights.

Use safe artifact-loading practices and avoid loading untrusted serialized files.

Test that the saved artifacts can be loaded in a fresh runtime and produce valid predictions.

Save a small artifact manifest that records the expected input schema and compatible package versions.

Do not make the final application depend on an active Colab session.

## 11. Phase 6 — Google Colab Training Notebook

Create a complete notebook named:

`notebooks/DeepGuard_AI_Training.ipynb`

The notebook must include executable cells for:

1. Environment inspection.
2. Dependency installation.
3. Dataset acquisition or upload.
4. Dataset inspection.
5. Preprocessing.
6. Train/validation/test separation.
7. Baseline training.
8. PyTorch model definition.
9. Model training.
10. Model evaluation.
11. Actual metric and chart generation.
12. Artifact export.
13. Artifact verification.
14. Artifact download.

Requirements:

- The notebook must run from top to bottom in a fresh Colab runtime.
- Avoid hidden dependencies on files existing only on the developer's computer.
- Do not require paid Colab features.
- Do not assume a GPU is available.
- Include a CPU fallback.
- Keep the data and training workload manageable.
- Use Google Drive only when helpful, with explicit user authorization.
- Do not embed access tokens, passwords, or API keys.
- Make dataset source and acquisition instructions clear.
- Save all required output artifacts to a single downloadable archive where practical.

Antigravity cannot assume it can execute notebook cells directly. Clearly mark which notebook cells the developer must run manually in Colab.

## 12. Phase 7 — Streamlit Dashboard

Create a polished, professional, responsive Streamlit dashboard.

The UI should look like a serious cybersecurity analytics application, not a default tutorial page.

Use a restrained dark cybersecurity visual style, consistent spacing, readable typography, and accessible chart labels.

Implement the following sections.

### A. Overview

Show:

- Project description.
- Dataset information.
- Model type.
- Test-set metrics.
- Class distribution.
- Model readiness or missing-artifact status.

### B. Traffic Analyzer

Allow users to upload a CSV containing the exact feature schema expected by the model.

Requirements:

- Validate file type.
- Validate column names.
- Handle missing and extra columns explicitly.
- Reorder features according to the saved schema when appropriate.
- Reject incompatible input safely.
- Prevent target labels and identifier columns from accidentally being treated as features.
- Limit upload size and record count to reasonable values.
- Display a sample of the uploaded data.
- Run inference using the saved model.
- Display predicted class and class probabilities when the model supports calibrated or otherwise appropriately interpreted probabilities.
- Label confidence values accurately; do not call uncalibrated outputs guaranteed probabilities.
- Allow users to download predictions as CSV.

Clearly distinguish model predictions from confirmed real-world attacks.

### C. Model Performance

Show:

- Actual accuracy, precision, recall, and F1-score.
- Confusion matrix.
- Per-class performance.
- Baseline-versus-neural-network comparison.
- Training history when available.

Load these results from generated artifacts. Never hardcode invented metrics.

### D. Threat Analysis

Display:

- Predicted class distribution.
- Counts of benign and suspicious records.
- Prediction summaries.
- Optional feature-level descriptive statistics.

Do not claim that the dashboard detects live threats or calculates validated attack severity unless such capabilities are genuinely implemented and evaluated.

### E. Model Information

Show:

- Dataset source.
- Preprocessing methodology.
- Model architecture.
- Training configuration.
- Evaluation methodology.
- Known limitations.
- Academic disclaimer.

### F. Error Handling

Provide helpful messages when:

- The model artifacts are missing.
- The model fails to load.
- The uploaded CSV is invalid.
- Required columns are missing.
- The dataset is empty.
- The number of records exceeds the supported limit.
- Prediction outputs are invalid.

The app must not crash with an unexplained traceback for ordinary user errors.

## 13. Phase 8 — Project Structure

Use a clean, maintainable structure similar to:

DeepGuard-AI/
├── app.py
├── requirements.txt
├── README.md
├── .gitignore
├── src/
│   ├── __init__.py
│   ├── model.py
│   ├── preprocessing.py
│   ├── inference.py
│   └── validation.py
├── notebooks/
│   └── DeepGuard_AI_Training.ipynb
├── model/
│   └── [generated artifacts]
├── reports/
│   ├── evaluation_metrics.json
│   ├── project_report.md
│   ├── presentation_outline.md
│   └── viva_questions.md
└── tests/
    ├── test_preprocessing.py
    ├── test_inference.py
    └── test_validation.py

Adapt this structure when necessary, but do not create unnecessary modules or placeholder files.

Keep generated datasets, temporary files, notebook checkpoints, caches, and secrets out of version control.

Include all required small artifacts in the deployment package. Document the handling of any large artifacts.

## 14. Phase 9 — Testing and Quality Assurance

Write and run meaningful tests.

At minimum, verify:

1. The model architecture can be instantiated.
2. Saved weights can be loaded.
3. The expected feature schema is valid.
4. The preprocessing pipeline transforms valid input correctly.
5. Inference returns the expected number of predictions.
6. Prediction outputs belong to the known label set.
7. Missing features are rejected with a clear message.
8. Empty CSV files are handled.
9. Invalid values are handled safely.
10. The dashboard starts successfully.
11. Evaluation metrics match the actual saved evaluation output.
12. The application works without an active Colab session.

Run available syntax checks, tests, and application startup checks.

Do not report tests as passed unless they were actually executed successfully.

If a test cannot run in the current environment, state why and provide the exact command the developer should run.

## 15. Phase 10 — Deployment

Target a free Hugging Face Space using Streamlit where currently supported.

Before deployment:

1. Verify the local application.
2. Verify the required files and dependencies.
3. Confirm the model artifacts are available to the deployed application.
4. Check artifact sizes and memory requirements.
5. Avoid downloading the training dataset at application startup.
6. Ensure startup performs inference initialization only, not training.
7. Ensure no credentials or private data are committed.
8. Add a clear README and application description.

Prepare the required deployment files and exact publishing instructions.

If deployment requires manual authentication or browser interaction, tell the developer precisely what to do.

Do not claim deployment succeeded until the public URL has been opened and the application has been verified.

If hosting fails because of time, resource limits, or service restrictions, preserve the complete locally runnable project and provide an honest deployment status.

## 16. Phase 11 — Academic Report and Presentation

Generate the following after the actual model results are available.

### Project report

Create `reports/project_report.md` with:

1. Title page information placeholders.
2. Abstract.
3. Introduction.
4. Problem statement.
5. Objectives.
6. Existing approach and motivation.
7. Proposed methodology.
8. System architecture.
9. Dataset description and source.
10. Data preprocessing.
11. Deep learning architecture.
12. Training configuration.
13. Evaluation methodology.
14. Actual results and visualizations.
15. Baseline comparison.
16. Application design.
17. Testing.
18. Limitations.
19. Future improvements.
20. Conclusion.
21. References.

Use only real sources and verified implementation details. Clearly mark any information that the developer must fill in.

### Presentation

Create `reports/presentation_outline.md` with a concise 10–12 slide presentation:

1. Title.
2. Problem statement.
3. Objectives.
4. Proposed solution.
5. Dataset.
6. System architecture.
7. Deep learning model.
8. Results and comparison.
9. Application demonstration.
10. Limitations.
11. Future scope.
12. Conclusion.

Provide suggested visuals and concise speaker notes.

### Viva preparation

Create `reports/viva_questions.md` containing clear answers to questions about:

- Why deep learning?
- What is an MLP?
- How does the model learn?
- What is the loss function?
- What is overfitting?
- Why use a train/test split?
- What is data leakage?
- What is class imbalance?
- Why use precision, recall, and F1-score?
- What does the confusion matrix show?
- Why compare with a baseline?
- How are preprocessing artifacts saved?
- How does inference work?
- What are the dataset limitations?
- Why is this not a live intrusion detection system?
- How would the system be scaled in production?
- What would be required for real-time monitoring?

Answers must reflect the actual implementation.

## 17. Phase 12 — README and Reproducibility

The README must explain:

- Project purpose.
- Features.
- Architecture.
- Dataset source and preparation.
- Training in Colab.
- Artifact download and integration.
- Local setup.
- Application execution.
- Testing commands.
- Deployment procedure.
- Project limitations.
- Screenshots or instructions for capturing them.
- Attribution and references.

Provide exact Windows-compatible commands where practical.

Use a virtual environment. Keep training dependencies separate from inference dependencies if doing so materially reduces deployment size.

Do not assume model artifacts already exist before the Colab training step has completed.

## 18. Required Development Workflow

Work in the following order.

### Milestone 1
Inspect the environment, choose the dataset, and create the project skeleton.

### Milestone 2
Create and validate the Colab notebook and training pipeline.

### Milestone 3
Train the real models, evaluate them, and export the artifacts.

### Milestone 4
Build the Streamlit dashboard and inference layer.

### Milestone 5
Run tests, fix defects, and verify integration.

### Milestone 6
Generate the academic report, presentation outline, and viva preparation using actual results.

### Milestone 7
Prepare and attempt deployment.

After each milestone:

- List files created or modified.
- List commands executed.
- Report actual test outcomes.
- Identify remaining blockers.
- Move to the next milestone without unnecessary discussion.

Do not wait for the developer to approve routine implementation details. Make reasonable, reversible decisions and continue.

Ask for user input only when an external action, credential, dataset choice, or genuinely blocking decision requires it.

If manual action is required, provide exact steps and continue with all independent work.

## 19. Definition of Done

The project is complete only when the following status is honestly documented:

- [ ] Legitimate dataset source documented.
- [ ] Preprocessing pipeline implemented.
- [ ] Deep learning model actually trained.
- [ ] Baseline model evaluated.
- [ ] Test metrics generated from real execution.
- [ ] Model and preprocessing artifacts exported.
- [ ] Fresh-runtime model loading verified.
- [ ] Streamlit dashboard implemented.
- [ ] CSV inference implemented and validated.
- [ ] Meaningful tests executed.
- [ ] README completed.
- [ ] Academic report completed with actual results.
- [ ] Presentation outline completed.
- [ ] Viva answers completed.
- [ ] Local application startup verified.
- [ ] Deployment attempted.
- [ ] Public deployment verified, if successful.
- [ ] Remaining limitations clearly documented.

Do not mark unfinished items as complete.

## 20. Start Now

First inspect the existing environment and create a short execution plan.

Then immediately implement Milestone 1.

Prioritize the shortest reliable path to a working project. Keep training and deployment reproducible, avoid unnecessary complexity, and use actual execution results throughout.

The objective is not to generate the most code. The objective is to deliver a functioning, tested, academically defensible deep learning project today.