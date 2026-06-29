import os
import sys
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, Optional

# Add parent directory to sys.path to import biomaterial_engine directly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from biomaterial_engine import (
    evaluate_material_for_all_applications,
    build_material_profile_from_decision_matrix,
    generate_turkish_explanation,
    APPLICATIONS
)

app = FastAPI(title="BioMat DSS Serverless API")

DATA_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "mcdm_input_template_filled_fuzzy.xlsx")

def clean_obj(obj):
    if isinstance(obj, dict):
        return {k: clean_obj(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_obj(v) for v in obj]
    elif isinstance(obj, pd.DataFrame):
        df = obj.replace({np.nan: None})
        return df.to_dict(orient="records")
    elif pd.isna(obj):
        return None
    elif isinstance(obj, (np.integer, np.floating)):
        return obj.item()
    return obj

@app.get("/api/materials")
def get_materials():
    try:
        decision_df = pd.read_excel(DATA_PATH, sheet_name="DECISION_MATRIX")
        criteria_meta = pd.read_excel(DATA_PATH, sheet_name="CRITERIA_META")
        
        decision_df.columns = decision_df.columns.astype(str).str.strip()
        criteria_meta.columns = criteria_meta.columns.astype(str).str.strip()

        materials = sorted(decision_df["Material"].dropna().astype(str).unique().tolist())
        
        apps_meta = {}
        for app in APPLICATIONS:
            app_meta = criteria_meta[criteria_meta["Application"].astype(str) == app].copy()
            apps_meta[app] = app_meta["Criterion"].dropna().astype(str).tolist()

        return {
            "materials": materials,
            "applications": APPLICATIONS,
            "criteria_by_app": apps_meta
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ProfileRequest(BaseModel):
    material_name: str

@app.post("/api/material-profile")
def get_profile(req: ProfileRequest):
    try:
        decision_df = pd.read_excel(DATA_PATH, sheet_name="DECISION_MATRIX")
        decision_df.columns = decision_df.columns.astype(str).str.strip()
        profile = build_material_profile_from_decision_matrix(decision_df, req.material_name)
        return {"profile": clean_obj(profile)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class EvaluateRequest(BaseModel):
    material_name: str
    material_profile: Dict[str, float]

@app.post("/api/evaluate")
def evaluate(req: EvaluateRequest):
    try:
        decision_df = pd.read_excel(DATA_PATH, sheet_name="DECISION_MATRIX")
        criteria_meta = pd.read_excel(DATA_PATH, sheet_name="CRITERIA_META")
        try:
            material_map_df = pd.read_excel(DATA_PATH, sheet_name="CLEAN_MATERIALS")
        except Exception:
            material_map_df = pd.DataFrame()

        decision_df.columns = decision_df.columns.astype(str).str.strip()
        criteria_meta.columns = criteria_meta.columns.astype(str).str.strip()
        if not material_map_df.empty:
            material_map_df.columns = material_map_df.columns.astype(str).str.strip()

        results_df, detailed_outputs = evaluate_material_for_all_applications(
            material_name=req.material_name,
            material_profile=req.material_profile,
            criteria_meta=criteria_meta,
            material_map_df=material_map_df
        )

        results_list = results_df.to_dict(orient="records")
        cleaned_details = {}
        for app_name, detail in detailed_outputs.items():
            explanation = generate_turkish_explanation(app_name, detail)
            cleaned_detail = clean_obj(detail)
            cleaned_detail["turkish_explanation"] = explanation
            cleaned_details[app_name] = cleaned_detail

        return {
            "results": results_list,
            "detailed_outputs": cleaned_details
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
