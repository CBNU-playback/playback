import json
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
import joblib
import os
from sklearn.metrics import confusion_matrix
from collections import defaultdict
import matplotlib.pyplot as plt
import seaborn as sns

# 시간 문자열 변환 함수
def time_str_to_sec(tstr):
    parts = tstr.split(":")
    try:
        if len(parts) == 1:
            return float(parts[0])
        elif len(parts) == 2:
            m, s = parts
            return int(m) * 60 + float(s)
        elif len(parts) == 3:
            h, m, s = parts
            return int(h) * 3600 + int(m) * 60 + float(s)
        else:
            raise ValueError(f"지원하지 않는 시간 포맷: {tstr}")
    except Exception as e:
        raise ValueError(f"시간 파싱 오류: '{tstr}' → {e}")

# 자막 범위 추출
def extract_subtitles(subs, start_sec, end_sec):
    return " ".join([
        s["text"] for s in subs
        if s["start"] < end_sec and s["end"] > start_sec
    ])

# Confusion Matrix 저장 함수
def save_confusion_matrix(y_true, y_pred, labels, save_path="confusion_matrix.png"):
    cm = confusion_matrix(y_true, y_pred, labels=labels)
    plt.figure(figsize=(10, 8))
    sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
                xticklabels=labels, yticklabels=labels)
    plt.xlabel("Predicted Label")
    plt.ylabel("True Label")
    plt.title("Confusion Matrix")
    plt.tight_layout()
    plt.savefig(save_path)
    plt.close()

# 모델 로드
MODEL_DIR = "./results_20250515_v1"
tokenizer = AutoTokenizer.from_pretrained(MODEL_DIR)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_DIR)
label_encoder = joblib.load(os.path.join(MODEL_DIR, "label_encoder.pkl"))

# 자막 및 라벨 파일명
subtitle_file = "AS_L_sub2.json"
label_file = "AS_L_lab.json"
video_title = os.path.splitext(os.path.basename(subtitle_file))[0]
output_txt = f"{video_title}_predict.txt"
output_confmat = f"{video_title}_confusion_matrix.png"

# 자막 및 라벨 로드
with open(subtitle_file, "r", encoding="utf-8") as f:
    subtitles = json.load(f)

with open(label_file, "r", encoding="utf-8") as f:
    label_data = json.load(f)

results = []
y_true = []
y_pred = []

for i, event in enumerate(label_data["replay_logos"], 1):
    start_sec = max(0, time_str_to_sec(event["start"]) - 30)
    end_sec = time_str_to_sec(event["end"])
    snippet = extract_subtitles(subtitles, start_sec, end_sec)

    true_label = event["event"]

    if not snippet:
        results.append(f"❗ {event['start']} ~ {event['end']} ({true_label}) 범위에 자막이 없습니다.\n")
        continue

    inputs = tokenizer(snippet, return_tensors="pt", truncation=True)
    with torch.no_grad():
        outputs = model(**inputs)
    pred_id = outputs.logits.argmax().item()
    pred_label = label_encoder.inverse_transform([pred_id])[0]

    y_true.append(true_label)
    y_pred.append(pred_label)

    result = (
        f"🕒 {event['start']} ~ {event['end']} ({true_label})\n"
        f"📘 자막: {snippet}\n"
        f"🔍 예측 액션: {pred_label}\n"
    )
    results.append(result)

# 예측 결과 텍스트 저장
with open(output_txt, "w", encoding="utf-8") as f:
    f.write("\n".join(results))

# Confusion Matrix 저장
unique_labels = list(label_encoder.classes_)
save_confusion_matrix(y_true, y_pred, unique_labels, save_path=output_confmat)

print(f"✅ 예측 결과: {output_txt}")
print(f"📊 Confusion Matrix 저장 완료: {output_confmat}")
