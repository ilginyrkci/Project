import numpy as np
import pandas as pd


EPS = 1e-9


APPLICATIONS = [
    "Wound Dressing",
    "Drug Delivery System",
    "Bone Tissue Scaffold",
    "Dental Implant",
    "Implant Coating"
]


def to_bool(x):
    if isinstance(x, bool):
        return x

    if pd.isna(x):
        return False

    value = str(x).strip().lower()

    return value in [
        "true", "1", "yes", "y", "mandatory", "zorunlu"
    ]


def normalize_weight_vector(weights):
    weights = np.array(weights, dtype=float)
    weights = np.nan_to_num(weights, nan=0.0)

    if weights.sum() <= EPS:
        return np.ones_like(weights) / len(weights)

    return weights / weights.sum()


def normalize_single_value(value, direction="benefit", target=None, min_ref=0.0, max_ref=1.0):
    """
    Tek kriter değerini 0–1 arası uygunluk skoruna çevirir.

    Eğer kullanıcı zaten fuzzy skor girdiyse, yani 0–1 arasıysa,
    doğrudan kullanılır.

    direction:
        benefit → yüksek iyi
        cost    → düşük iyi
        target  → hedefe yakınlık iyi
    """

    if pd.isna(value):
        return np.nan

    value = float(value)

    # Fuzzy skor zaten 0–1 arasıysa doğrudan kullan.
    if 0.0 <= value <= 1.0 and 0.0 <= max_ref <= 1.0:
        return np.clip(value, 0.0, 1.0)

    direction = str(direction).strip().lower()

    if direction == "benefit":
        denom = max(abs(max_ref), EPS)
        score = value / denom

    elif direction == "cost":
        denom = max(abs(value), EPS)
        score = min_ref / denom

    elif direction == "target":
        if target is None or pd.isna(target):
            raise ValueError("Target-based kriter için target değeri zorunludur.")

        denom = max(max_ref, target) - min(min_ref, target)
        denom = max(abs(denom), EPS)
        score = 1.0 - abs(value - target) / denom

    else:
        raise ValueError(f"Geçersiz direction: {direction}")

    return float(np.clip(score, 0.0, 1.0))


def build_material_profile_from_decision_matrix(decision_df, material_name):
    """
    Bilinen malzeme veri tabanında varsa, farklı uygulama satırlarındaki
    kriter değerlerini tek profile toplar.
    """

    rows = decision_df[
        decision_df["Material"].astype(str).str.lower() == str(material_name).lower()
    ].copy()

    if rows.empty:
        return {}

    profile = {}

    reserved_cols = {"Application", "Material", "Class"}

    for _, row in rows.iterrows():
        for col in decision_df.columns:
            if col in reserved_cols:
                continue

            value = row.get(col, np.nan)

            if pd.notna(value):
                profile[col] = float(value)

    return profile


def get_prior_evidence(material_map_df, material_name, application):
    """
    MATERIAL / MALZEME tablosundaki X işaretlerini kanıt etiketi olarak kullanır.
    Skorun kendisi yapmaz. Çünkü yeni malzemelerde X matrisi zaten olmayacak.
    """

    if material_map_df is None or material_map_df.empty:
        return "No knowledge-base evidence"

    if "Material" not in material_map_df.columns:
        return "No knowledge-base evidence"

    rows = material_map_df[
        material_map_df["Material"].astype(str).str.lower() == str(material_name).lower()
    ]

    if rows.empty:
        return "New or unknown material"

    if application not in material_map_df.columns:
        return "Application not found in material map"

    value = rows.iloc[0].get(application, "")

    if str(value).strip().upper() == "X":
        return "Known application in knowledge base"

    return "No prior use indicated in knowledge base"


def score_application(
    material_profile,
    app_meta,
    gamma=1.15,
    fail_gate=0.35,
    top_n=4
):
    """
    Tek malzemenin tek uygulama için uygunluk skorunu hesaplar.
    """

    criteria = app_meta["Criterion"].astype(str).tolist()

    weights = app_meta["Weight"].fillna(1.0).astype(float).values
    weights = normalize_weight_vector(weights)

    total_weight = float(np.sum(weights))

    rows = []
    mandatory_failures = []
    missing_criteria = []

    available_weight = 0.0
    weighted_score_sum = 0.0

    for idx, (_, meta_row) in enumerate(app_meta.iterrows()):
        criterion = str(meta_row["Criterion"])
        direction = str(meta_row.get("Direction", "benefit")).lower()

        weight = float(weights[idx])

        target = meta_row.get("Target", np.nan)
        min_allowed = meta_row.get("MinAllowed", np.nan)
        max_allowed = meta_row.get("MaxAllowed", np.nan)

        min_ref = meta_row.get("MinRef", 0.0)
        max_ref = meta_row.get("MaxRef", 1.0)

        mandatory = to_bool(meta_row.get("Mandatory", False))

        raw_value = material_profile.get(criterion, np.nan)

        if pd.isna(raw_value):
            missing_criteria.append({
                "criterion": criterion,
                "weight": weight,
                "mandatory": mandatory
            })

            rows.append({
                "Criterion": criterion,
                "RawValue": np.nan,
                "Suitability": np.nan,
                "Weight": weight,
                "Contribution": 0.0,
                "Gap": weight,
                "Mandatory": mandatory,
                "Status": "Missing"
            })

            if mandatory:
                mandatory_failures.append(f"{criterion}: missing")

            continue

        suitability = normalize_single_value(
            value=raw_value,
            direction=direction,
            target=target,
            min_ref=min_ref if pd.notna(min_ref) else 0.0,
            max_ref=max_ref if pd.notna(max_ref) else 1.0
        )

        status = "OK"

        if mandatory:
            if pd.notna(min_allowed) and raw_value < float(min_allowed):
                status = "Mandatory failed"
                mandatory_failures.append(
                    f"{criterion}: {raw_value:.3f} < {float(min_allowed):.3f}"
                )

            if pd.notna(max_allowed) and raw_value > float(max_allowed):
                status = "Mandatory failed"
                mandatory_failures.append(
                    f"{criterion}: {raw_value:.3f} > {float(max_allowed):.3f}"
                )

        contribution = weight * suitability
        gap = weight * (1.0 - suitability)

        available_weight += weight
        weighted_score_sum += contribution

        rows.append({
            "Criterion": criterion,
            "RawValue": raw_value,
            "Suitability": suitability,
            "Weight": weight,
            "Contribution": contribution,
            "Gap": gap,
            "Mandatory": mandatory,
            "Status": status
        })

    if available_weight <= EPS:
        base_score = 0.0
    else:
        base_score = weighted_score_sum / available_weight

    data_coverage = available_weight / total_weight
    data_penalty = data_coverage ** gamma

    gate = 1.0 if len(mandatory_failures) == 0 else fail_gate

    final_score = 100.0 * gate * base_score * data_penalty
    final_score = float(np.clip(final_score, 0.0, 100.0))

    detail_df = pd.DataFrame(rows)

    positive_factors = (
        detail_df[detail_df["Status"] != "Missing"]
        .sort_values("Contribution", ascending=False)
        .head(top_n)
    )

    limiting_factors = (
        detail_df[detail_df["Status"] != "Missing"]
        .sort_values("Gap", ascending=False)
        .head(top_n)
    )

    missing_sorted = sorted(
        missing_criteria,
        key=lambda x: x["weight"],
        reverse=True
    )[:top_n]

    if final_score >= 85:
        label = "Highly suitable"
    elif final_score >= 70:
        label = "Suitable"
    elif final_score >= 55:
        label = "Conditionally suitable"
    elif final_score >= 40:
        label = "Weak suitability"
    else:
        label = "Not recommended / insufficient evidence"

    return {
        "score": final_score,
        "label": label,
        "base_score": base_score * 100.0,
        "data_coverage": data_coverage * 100.0,
        "gate": gate,
        "mandatory_failures": mandatory_failures,
        "positive_factors": positive_factors,
        "limiting_factors": limiting_factors,
        "missing_criteria": missing_sorted,
        "detail_df": detail_df
    }


def evaluate_material_for_all_applications(
    material_name,
    material_profile,
    criteria_meta,
    material_map_df=None
):
    """
    Tek malzemeyi 5 uygulama alanına göre değerlendirir.
    """

    results = []

    detailed_outputs = {}

    for app in APPLICATIONS:
        app_meta = criteria_meta[
            criteria_meta["Application"].astype(str) == app
        ].copy()

        if app_meta.empty:
            continue

        result = score_application(
            material_profile=material_profile,
            app_meta=app_meta
        )

        prior_evidence = get_prior_evidence(
            material_map_df=material_map_df,
            material_name=material_name,
            application=app
        )

        results.append({
            "Application": app,
            "SuitabilityScore": round(result["score"], 2),
            "Interpretation": result["label"],
            "BaseScoreWithoutPenalty": round(result["base_score"], 2),
            "DataCoverage": round(result["data_coverage"], 2),
            "MandatoryGate": result["gate"],
            "PriorEvidence": prior_evidence,
            "MandatoryFailures": "; ".join(result["mandatory_failures"])
        })

        detailed_outputs[app] = result

    results_df = pd.DataFrame(results)
    results_df = results_df.sort_values(
        "SuitabilityScore",
        ascending=False
    ).reset_index(drop=True)

    return results_df, detailed_outputs


def generate_turkish_explanation(application, result):
    """
    Dashboard için kısa Türkçe açıklama üretir.
    """

    score = result["score"]
    label = result["label"]
    data_coverage = result["data_coverage"]

    positives = []
    for _, row in result["positive_factors"].iterrows():
        positives.append(
            f"{row['Criterion']} ({row['Suitability']:.2f})"
        )

    limiters = []
    for _, row in result["limiting_factors"].iterrows():
        limiters.append(
            f"{row['Criterion']} ({row['Suitability']:.2f})"
        )

    missing = [
        item["criterion"]
        for item in result["missing_criteria"]
    ]

    text = f"{application} için uygunluk skoru %{score:.1f} olarak hesaplanmıştır. "
    text += f"Bu sonuç '{label}' düzeyine karşılık gelmektedir. "
    text += f"Veri kapsama oranı %{data_coverage:.1f}'dir. "

    if positives:
        text += "Skoru yukarı taşıyan başlıca faktörler: "
        text += "; ".join(positives) + ". "

    if limiters:
        text += "Sınırlayıcı faktörler: "
        text += "; ".join(limiters) + ". "

    if missing:
        text += "Eksik veya girilmemiş kritik veriler: "
        text += "; ".join(missing) + ". "

    return text


def generate_english_explanation(application, result):
    """
    Produces a concise English explanation for the dashboard.
    """
    score = result["score"]
    label = result["label"]
    data_coverage = result["data_coverage"]

    positives = [f"{row['Criterion']} ({row['Suitability']:.2f})" for _, row in result["positive_factors"].iterrows()]
    limiters = [f"{row['Criterion']} ({row['Suitability']:.2f})" for _, row in result["limiting_factors"].iterrows()]
    missing = [item["criterion"] for item in result["missing_criteria"]]

    text = f"The suitability score for {application} is calculated as {score:.1f}%. "
    text += f"This result corresponds to the '{label}' level. "
    text += f"The data coverage rate is {data_coverage:.1f}%. "

    if positives:
        text += "Key positive contributing factors: " + "; ".join(positives) + ". "
    if limiters:
        text += "Limiting factors: " + "; ".join(limiters) + ". "
    if missing:
        text += "Missing critical criteria: " + "; ".join(missing) + ". "
    if result["mandatory_failures"]:
        text += "Issues in mandatory pre-suitability criteria: " + "; ".join(result["mandatory_failures"]) + ". "

    return text