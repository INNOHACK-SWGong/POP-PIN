import os
import pandas as pd
import json

file_path = './Haeundae.csv'

# 경로 확인
if not os.path.exists(file_path):
    raise FileNotFoundError(f"File does not exist: {os.path.abspath(file_path)}")

# CSV 파일 읽기
df = pd.read_csv(file_path)

# JSON 변환
json_data = df.to_dict(orient='records')

# JSON 저장 경로 설정
output_path = './Haeundae.json'
with open(output_path, 'w', encoding='utf-8') as json_file:
    json.dump({"records": json_data}, json_file, ensure_ascii=False, indent=4)

print(f"JSON 파일 저장 완료: {os.path.abspath(output_path)}")
