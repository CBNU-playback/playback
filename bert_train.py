import json
import os
from datetime import datetime
import numpy as np
import torch
import torch.nn.functional as F
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd

from datasets import Dataset
from transformers import (
    AutoTokenizer, AutoModelForSequenceClassification,
    Trainer, TrainingArguments, DataCollatorWithPadding
)
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, f1_score, classification_report, confusion_matrix
)
import joblib

# ✅ 버전 폴더 자동 생성 함수
def get_next_version_dir(base_name="results"):
    today = datetime.now().strftime("%Y%m%d")
    version = 1
    while True:
        dir_name = f"{base_name}_{today}_v{version}"
        if not os.path.exists(dir_name):
            os.makedirs(dir_name)
            return dir_name
        version += 1

# ✅ 학습 데이터 로딩
with open("train_dataset.json", "r", encoding="utf-8") as f:
    data = json.load(f)

texts = [d["text"] for d in data]
labels = [d["label"] for d in data]

# ✅ 라벨 인코딩
label_encoder = LabelEncoder()
encoded_labels = label_encoder.fit_transform(labels)

# ✅ Hugging Face Dataset 객체 생성 및 분할
dataset = Dataset.from_dict({
    "text": texts,
    "label": encoded_labels
}).train_test_split(test_size=0.2, seed=42)

# ✅ Tokenizer 및 모델 불러오기
model_name = "bert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)

def preprocess(example):
    return tokenizer(example["text"], truncation=True)

encoded_dataset = dataset.map(preprocess, batched=True)

model = AutoModelForSequenceClassification.from_pretrained(
    model_name,
    num_labels=len(label_encoder.classes_)
)

# ✅ 평가 함수 정의
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=1)
    return {
        "accuracy": accuracy_score(labels, preds),
        "f1": f1_score(labels, preds, average="weighted")
    }

# ✅ 결과 저장 디렉토리 생성
save_dir = get_next_version_dir()
print(f"✅ 모델 및 평가 결과 저장 폴더: {save_dir}")

# ✅ Trainer 설정
training_args = TrainingArguments(
    output_dir=save_dir,
    evaluation_strategy="epoch",
    num_train_epochs=5,
    per_device_train_batch_size=4,
    per_device_eval_batch_size=4,
    logging_dir=os.path.join(save_dir, "logs"),
    save_strategy="no",
    load_best_model_at_end=False
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=encoded_dataset["train"],
    eval_dataset=encoded_dataset["test"],
    tokenizer=tokenizer,
    data_collator=DataCollatorWithPadding(tokenizer),
    compute_metrics=compute_metrics
)

# ✅ 모델 학습
trainer.train()

# ✅ 테스트셋 예측
pred_output = trainer.predict(encoded_dataset["test"])
y_true = pred_output.label_ids
y_pred = np.argmax(pred_output.predictions, axis=1)

# ✅ 전체 클래스 인덱스 확보
labels_all = list(range(len(label_encoder.classes_)))

# ✅ 분류 리포트 저장
report = classification_report(
    y_true,
    y_pred,
    labels=labels_all,
    target_names=label_encoder.classes_,
    digits=4,
    zero_division=0
)

report_path = os.path.join(save_dir, "classification_report.txt")
with open(report_path, "w", encoding="utf-8") as f:
    f.write(report)

print(f"\n📄 Classification report 저장됨: {report_path}")
print(report)

# ✅ 혼동 행렬 시각화 및 저장
cm = confusion_matrix(y_true, y_pred, labels=labels_all)
plt.figure(figsize=(10, 8))
sns.heatmap(cm, annot=True, fmt="d", cmap="Blues",
            xticklabels=label_encoder.classes_,
            yticklabels=label_encoder.classes_)
plt.xlabel("Predicted Label")
plt.ylabel("True Label")
plt.title("Confusion Matrix")
plt.tight_layout()

cm_path = os.path.join(save_dir, "confusion_matrix.png")
plt.savefig(cm_path)
plt.close()
print(f"🖼️ Confusion matrix 이미지 저장됨: {cm_path}")

# ✅ 모델, 토크나이저, 라벨 인코더 저장
model.save_pretrained(save_dir)
tokenizer.save_pretrained(save_dir)
joblib.dump(label_encoder, os.path.join(save_dir, "label_encoder.pkl"))
print(f"✅ 모델 및 라벨 인코더 저장 완료: {save_dir}")
