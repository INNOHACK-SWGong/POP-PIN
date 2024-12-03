import pandas as pd
import random

# 데이터 생성 파라미터
NUM_SAMPLES = 10000  # 생성할 데이터 샘플 수
time_of_day = ["morning", "afternoon", "evening", "night"]

def generate_signal_durations(lane_A, lane_B):
    """
    차량 수를 기반으로 신호 지속 시간을 동적으로 생성.
    """
    total_cars = lane_A + lane_B
    if total_cars == 0:  # 차량이 없으면 기본값
        return 50, 50
    signal_A = int((lane_A / total_cars) * 100)
    signal_B = 100 - signal_A
    return signal_A, signal_B

# 데이터 생성
data = []
for _ in range(NUM_SAMPLES):
    time = random.choice(time_of_day)
    # 시간대별 차량 수 범위 설정
    if time == "morning":
        lane_A = random.randint(30, 150)
        lane_B = random.randint(20, 120)
    elif time == "afternoon":
        lane_A = random.randint(50, 180)
        lane_B = random.randint(40, 150)
    elif time == "evening":
        lane_A = random.randint(70, 200)
        lane_B = random.randint(60, 180)
    else:  # night
        lane_A = random.randint(0, 50)
        lane_B = random.randint(0, 50)

    lane_C = random.randint(10, 100)
    lane_D = random.randint(10, 100)
    
    # 신호 지속 시간 계산
    signal_A, signal_B = generate_signal_durations(lane_A, lane_B)
    
    # 데이터 추가
    data.append([time, lane_A, lane_B, lane_C, lane_D, signal_A, signal_B])

# 데이터프레임 생성
columns = ["time_of_day", "lane_A_cars", "lane_B_cars", "lane_C_cars", "lane_D_cars", "signal_duration_A", "signal_duration_B"]
df = pd.DataFrame(data, columns=columns)

# CSV 파일로 저장
df.to_csv("train_data.csv", index=False)
print(f"{NUM_SAMPLES}개의 샘플이 포함된 train_data.csv 파일이 생성되었습니다!")
