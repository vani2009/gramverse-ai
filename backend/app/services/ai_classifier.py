from typing import Tuple, List, Dict, Any

CATEGORY_KEYWORDS = {
    "Road": ["road", "pothole", "asphalt", "tar", "path", "street", "bridge", "culvert", "pavement"],
    "Water": ["water", "pipe", "tap", "leak", "handpump", "well", "tank", "drinking", "supply", "borewell"],
    "Sanitation": ["garbage", "drain", "sewage", "trash", "waste", "toilet", "filth", "cleanliness", "stagnant"],
    "Electricity": ["electric", "power", "light", "transformer", "wire", "pole", "outage", "blackout", "voltage"],
    "School": ["school", "teacher", "classroom", "student", "desk", "blackboard", "education", "books", "midday"],
    "Health": ["hospital", "clinic", "doctor", "nurse", "medicine", "health", "ambulance", "vaccine", "dispensary"]
}


def classify_complaint_text(text: str) -> Tuple[str, float, str]:
    """
    NLP complaint classifier implementing rule/keyword matching with confidence metric.
    Returns: (predicted_category, confidence_score, model_version)
    """
    clean_text = text.lower()
    matches: Dict[str, int] = {}

    for category, keywords in CATEGORY_KEYWORDS.items():
        count = sum(1 for kw in keywords if kw in clean_text)
        if count > 0:
            matches[category] = count

    if not matches:
        return ("General", 0.50, "nlp-keyword-v1.0")

    # Pick category with highest matches
    best_cat = max(matches.items(), key=lambda x: x[1])
    score = min(0.95, 0.70 + (best_cat[1] * 0.10))
    return (best_cat[0], score, "nlp-keyword-v1.0")


def analyze_complaint_image(filename: str, category_hint: str) -> Tuple[List[Dict[str, Any]], float, str]:
    """
    Simulates / wraps the Computer Vision inference model for uploaded evidence photos.
    Detects visible defects: potholes, waterlogging, garbage accumulation, structural cracks.
    """
    defects = []
    if category_hint == "Road":
        defects.append({"label": "pothole", "confidence": 0.89, "bounding_box": [0.25, 0.30, 0.65, 0.75]})
    elif category_hint in ["Water", "Sanitation"]:
        defects.append({"label": "waterlogging_or_sewage", "confidence": 0.84, "bounding_box": [0.15, 0.20, 0.80, 0.70]})
    elif category_hint == "Electricity":
        defects.append({"label": "damaged_wire_or_pole", "confidence": 0.82, "bounding_box": [0.30, 0.10, 0.70, 0.90]})
    else:
        defects.append({"label": "infrastructure_defect", "confidence": 0.75, "bounding_box": [0.20, 0.20, 0.80, 0.80]})

    return (defects, defects[0]["confidence"], "cv-defect-v1.0")
