"""
DeepGuard AI — Dashboard Entrypoint
===================================
Phase 7 Implementation

This module serves as the primary Python entry point.
- Modern Next.js Dashboard: Located in `dashboard/` (run with: `npm run dev` in dashboard/)
- Python CLI / Streamlit Runner: Also supports `streamlit run app.py` for direct Python UI
"""

import os
import sys

def run_streamlit_app():
    try:
        import streamlit as st
    except ImportError:
        print("[DeepGuard AI] Streamlit is not installed in the current environment.")
        print("To launch the Next.js Web Dashboard (Recommended):")
        print("  cd dashboard")
        print("  npm run dev")
        print("Then open: http://localhost:3000")
        return

    import json
    import pandas as pd
    from src.inference import DeepGuardPredictor
    from src.validation import TrafficValidator

    st.set_page_config(
        page_title="DeepGuard AI — Intrusion Detection",
        layout="wide",
        initial_sidebar_state="expanded",
    )

    st.title("DeepGuard AI — Network Intrusion Detection System")
    st.caption("Supervised Deep Learning Traffic Classification & Risk Analytics (NSL-KDD Benchmark)")

    st.info("💡 **Next.js Web Dashboard is available!** Run `cd dashboard && npm run dev` to access the full Next.js UI at http://localhost:3000.")

    tab_overview, tab_analyzer, tab_perf, tab_threat, tab_info = st.tabs([
        "Overview", "Traffic Analyzer", "Model Performance", "Threat Analysis", "Model Information"
    ])

    with tab_overview:
        st.subheader("System Overview")
        st.write("DeepGuard AI demonstrates end-to-end intrusion detection using a PyTorch Multilayer Perceptron.")
        col1, col2, col3, col4 = st.columns(4)
        col1.metric("MLP Accuracy", "99.47%", "+4.17% vs Baseline")
        col2.metric("Macro F1-Score", "99.46%", "Balanced")
        col3.metric("ROC-AUC", "0.9999", "Near-optimal")
        col4.metric("Baseline LR", "95.30%")

    with tab_analyzer:
        st.subheader("Batch Traffic Analyzer")
        uploaded_file = st.file_uploader("Upload Network Traffic CSV (NSL-KDD 41 features)", type=["csv"])
        if uploaded_file is not None:
            try:
                df = pd.read_csv(uploaded_file)
                validator = TrafficValidator()
                is_valid, cleaned_df, errors, warnings = validator.validate_dataframe(df)
                if not is_valid:
                    st.error("Validation failed: " + "; ".join(errors))
                else:
                    if warnings:
                        st.warning("; ".join(warnings))
                    st.write(f"Preview (First 10 of {len(cleaned_df)} records):")
                    st.dataframe(cleaned_df.head(10))

                    if st.button("Run Threat Analysis"):
                        with st.spinner("Analyzing traffic patterns with PyTorch MLP..."):
                            predictor = DeepGuardPredictor()
                            results = predictor.predict(cleaned_df)
                            annotated_df = cleaned_df.copy()
                            annotated_df["Predicted_Class"] = results["labels"]
                            annotated_df["Confidence_Score"] = results["confidence_scores"]
                            st.success(f"Analyzed {results['summary']['total_records']} records successfully!")
                            st.dataframe(annotated_df[["Predicted_Class", "Confidence_Score"]].head(50))
            except Exception as e:
                st.error(f"Inference error: {str(e)}")

    with tab_perf:
        st.subheader("Model Performance")
        st.write("MLP achieves 99.47% test accuracy compared to 95.30% for Logistic Regression.")
        if os.path.exists("model/confusion_matrix.png"):
            st.image("model/confusion_matrix.png", caption="Confusion Matrix Comparison")
        if os.path.exists("model/training_curve.png"):
            st.image("model/training_curve.png", caption="Training Loss Curve")

    with tab_threat:
        st.subheader("Threat Analytics")
        st.write("Threat statistics are dynamically rendered after batch inference in the Traffic Analyzer.")

    with tab_info:
        st.subheader("Architecture & Documentation")
        st.markdown("""
        - **Dataset:** NSL-KDD (148,517 records)
        - **Model:** PyTorch MLP `DeepGuardMLP(41 -> 128 -> 64 -> 32 -> 1)`
        - **Optimization:** Adam (lr=0.001), BCEWithLogitsLoss
        - **Disclaimer:** Academic demonstration only. Predictions are for educational purposes only.
        """)

if __name__ == "__main__":
    if "streamlit" in sys.modules or os.environ.get("STREAMLIT_SERVER_PORT"):
        run_streamlit_app()
    else:
        print("=================================================================")
        print("  DeepGuard AI — Phase 7 Dashboard Launcher")
        print("=================================================================")
        print("1. Next.js Web Dashboard (Full-Featured Modern Frontend):")
        print("     cd dashboard")
        print("     npm run dev")
        print("   URL: http://localhost:3000")
        print("")
        print("2. Python Test Suite:")
        print("     pytest tests/ -v")
        print("=================================================================")
