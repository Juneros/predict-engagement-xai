# 🎓 Explainable AI-Driven Active Learning Intervention System

An intelligent system that predicts student engagement levels and provides actionable, pedagogy-driven intervention recommendations. This project integrates **Active Learning** methodologies with **Explainable AI (XAI)** techniques to bridge the gap between black-box predictions and practical educational decision-making.

## 🌟 Key Features

- **🎓 Pedagogy-Aware Features**: Novel feature engineering that quantifies active learning strategies (Flipped Classroom, Peer Instruction, Project-Based Learning) from raw logistical data.
- **🤖 Robust Prediction**: A Neural Network (MLP) classifier validated via **5-Fold Stratified Cross-Validation**, achieving **98.9% ± 0.2%** accuracy.
- **💡 Explainability (XAI)**: Integrated **SHAP** analysis to provide global feature importance and local "What-If" simulations.
- **💻 Interactive Web App**: A Streamlit-based dashboard allowing educators to simulate interventions and visualize impacts in real-time.
- **📝 Executable Report**: A comprehensive Jupyter Notebook (`00_Project_Complete_Walkthrough.ipynb`) that reproduces the entire study from raw data to final charts.

## 🚀 Quick Start (macOS + Conda)

This project is designed to be fully reproducible. Due to file size limits, raw data and trained models are not included in this repository. Instead, you can regenerate everything by running the main notebook.

### 1. Prerequisites
- **Python**: 3.10 or higher
- **Conda**: Miniconda or Anaconda installed
- **Dataset**: Open University Learning Analytics Dataset (OULAD). 
  - *Note: Place the raw OULAD CSV files in the `data/raw/` folder before running.*

### 2. Clone the Repository
```bash
git clone https://github.com/Juneros/predict-engagement-xai.git
cd predict-engagement-xai

### 3. Setup Environment (Conda)

Create and activate the dedicated conda environment:

```bash
# Create environment with Python 3.10
conda create -n engagement_env python=3.10 -y

# Activate the environment
conda activate engagement_env

# Install core dependencies via pip
pip install pandas numpy scikit-learn matplotlib seaborn streamlit shap jupyter notebook

# ⚠️ Optional: Install XGBoost
# On macOS (Apple Silicon), XGBoost installation via pip may fail.
# It is optional for this project as the primary model is a Neural Network.
# If you wish to try installing it:
# conda install -c conda-forge xgboost -y
# OR skip it if you only want to run the Neural Network pipeline.
```

### 4. Run the Complete Walkthrough

The easiest way to reproduce all results is to run the main Jupyter Notebook. It will execute all data processing, model training, and evaluation scripts automatically.

```bash
# Launch Jupyter Notebook
jupyter notebook 00_Project_Complete_Walkthrough.ipynb
```

*Inside the notebook, click "Kernel" -> "Restart & Run All" to execute the full pipeline.*

### 5. Launch the Web Application

Once the models are trained (after running the notebook), you can launch the interactive dashboard:

```bash
streamlit run streamlit_app.py
```

## 📂 Project Structure

```text
.
├── 00_Project_Complete_Walkthrough.ipynb  # 🌟 Start here: Executable report
├── 01_build_pedagogy_features.py          # Feature engineering: Pedagogy indices
├── 02_build_features.py                   # Feature engineering: Student behaviors
├── 03_build_engagement.py                 # Target variable construction
├── 04_prepare_model_data.py               # Data merging and preprocessing
├── 05_Decision_Tree.py                    # Baseline model training
├── 06_Logistic_Regression.py              # Baseline model training
├── 07_Random_Forest.py                    # Ensemble model training
├── 08_XGBoost.py                          # Boosting model training (Optional)
├── 09_neural_networks.py                  # 🏆 Final model training (MLP)
├── 10_model_evaluation.py                 # Comparative analysis of all models
├── 11_shap_global_analysis.py             # Explainability analysis
├── 12_cross_validation.py                 # Robustness validation
├── streamlit_app.py                       # Interactive web interface
├── data/                                  # (Ignored) Place raw data here
├── models/                                # (Ignored) Trained models saved here
└── requirements.txt                       # Core dependencies
```

## 📊 Key Results

| Metric            | Value                                 |
| ----------------- | ------------------------------------- |
| **Best Model**    | Neural Network (MLP)                  |
| **CV Accuracy**   | 0.9892 ± 0.0016                       |
| **CV F1-Score**   | 0.9892 ± 0.0017                       |
| **Top Predictor** | `video_completion_rate` (SHAP: 0.655) |
| **Dataset Size**  | 29,229 student-course instances       |

## 🛠 Troubleshooting (macOS)

- **XGBoost Installation Fails**: 

  - This is common on Apple Silicon. Since the project's primary model is the Neural Network, you can safely skip installing XGBoost. The pipeline will still run; only the `08_XGBoost.py` script will fail, which does not affect the final results.
  - Alternatively, try: `conda install -c conda-forge xgboost`.

- **TensorFlow Warnings**: 

  - Some warnings about TensorFlow optimization on macOS are normal and can be ignored.

- **Jupyter Kernel Not Found**:

  - If the notebook doesn't show the 

    ```
    engagement_env
    ```

     kernel, run:

    ```bash
    conda activate engagement_env
    python -m ipykernel install --user --name=engagement_env --display-name "Python (engagement_env)"
    ```

