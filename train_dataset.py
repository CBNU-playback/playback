import json
import os

def time_str_to_sec(tstr):
    parts = tstr.split(":")
    if len(parts) == 2:  # MM:SS.ss
        m, s = parts
        return int(m) * 60 + float(s)
    elif len(parts) == 3:  # HH:MM:SS
        h, m, s = parts
        return int(h) * 3600 + int(m) * 60 + float(s)
    else:
        raise ValueError(f"잘못된 시간 포맷: {tstr}")

def extract_subtitles(subs, start_sec, end_sec):
    texts = []
    for s in subs:
        try:
            if s['start'] < end_sec and s['end'] > start_sec:
                text = s.get('text')
                if isinstance(text, str):
                    print(f"🟢 매칭 자막: {s['start']} ~ {s['end']} → {text}")
                    texts.append(text)
                else:
                    print(f"⚠️ 유효하지 않은 자막 텍스트 무시됨: {text}")
        except (KeyError, TypeError):
            print("❌ 자막 파싱 오류:", s)
            continue
    return " ".join(texts)

# ✅ 자막 파일 로드
with open("AN_CP_sub.json", "r", encoding="utf-8") as f:
    data = json.load(f)
    if isinstance(data, list):
        subtitles = data
    else:
        print("❗ 예상과 다른 자막 JSON 구조입니다.")
        exit()

print(f"🎬 자막 범위: {subtitles[0]['start']}초 ~ {subtitles[-1]['end']}초")

# ✅ 라벨링 파일 로드
with open("AN_CP_lab.json", "r", encoding="utf-8") as f:
    label_data = json.load(f)

output_dataset = []

# ✅ 불필요한 라벨 정의
invalid_labels = ["", "nothing", None]

for i, event in enumerate(label_data["replay_logos"]):
    label = event["event"]

    # ❌ 무효 라벨은 건너뛴다
    if label is None or str(label).strip().lower() in invalid_labels:
        print(f"⛔ 무시된 이벤트 {i+1}: '{label}'")
        continue

    start_str = event["start"]
    end_str = event["end"]
    start_sec = max(0, time_str_to_sec(start_str) - 30)
    end_sec = time_str_to_sec(end_str)

    print(f"\n🎯 이벤트 {i+1}: {label} | 범위: {start_str} ~ {end_str} → {start_sec} ~ {end_sec}")

    snippet = extract_subtitles(subtitles, start_sec, end_sec).strip()
    
    if snippet:
        output_dataset.append({
            "text": snippet,
            "label": label
        })
    else:
        print("⚠️ 해당 범위에 자막이 없습니다.")

# ✅ 기존 학습 데이터 불러오기
if os.path.exists("train_dataset.json"):
    with open("train_dataset.json", "r", encoding="utf-8") as f:
        existing_dataset = json.load(f)
else:
    existing_dataset = []

# ✅ 새 데이터 추가 및 저장
combined_dataset = existing_dataset + output_dataset

with open("train_dataset.json", "w", encoding="utf-8") as f:
    json.dump(combined_dataset, f, ensure_ascii=False, indent=2)

print(f"\n✅ 총 {len(combined_dataset)}개의 누적 학습 샘플이 저장되었습니다.")
