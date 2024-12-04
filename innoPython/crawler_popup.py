from playwright.sync_api import sync_playwright
import re
from datetime import datetime
import json

def scrape_popup_info():
    with sync_playwright() as p:
        # 브라우저 실행
        browser = p.chromium.launch(headless=True)  # headless=True로 하면 브라우저 화면을 표시하지 않음
        page = browser.new_page()

        # 페이지 열기
        page.goto("https://www.popply.co.kr/popup/search?query=%EB%B6%80%EC%82%B0&status=all&fromDate=2024-12-04&toDate=2024-12-04")

        # 페이지가 완전히 로드될 때까지 대기
        page.wait_for_selector('.popup-name')  # 팝업 이름이 로드될 때까지 대기

        details = []
        popups = []

        popup_details = page.query_selector_all('a.popup-img-wrap') # 모든 팝업의 상세 페이지 주소
        for i in range(len(popup_details)):
            detail_url = popup_details[i].get_attribute('href')  # href 속성 추출

            details.append(detail_url)
        
        id = 1
        for i in range(len(details)):
            # 페이지 열기
            page.goto(f"https://www.popply.co.kr{details[i]}")

            # 페이지가 완전히 로드될 때까지 대기
            page.wait_for_selector('.tit')  # 팝업 이름이 로드될 때까지 대기

            # 팝업 정보 크롤링
            popup_names = page.query_selector('.tit').inner_text()  # 팝업 이름 추출
            popup_locations = page.query_selector('.location').inner_text()  # 팝업 위치 추출
            popup_dates = page.query_selector('.date').inner_text()  # 팝업 날짜 추출
            image_url = page.query_selector('.slide-img-wrap img').get_attribute('src')
            
            # 날짜 형식: 24.11.01 - 25.01.01, 24.12.01 - 24.12.31와 같은 날짜 범위
            match = re.match(r'(\d{2})\.(\d{2})\.(\d{2})\s*-\s*(\d{2})\.(\d{2})\.(\d{2})', popup_dates)
            if match:
                # 시작일과 종료일을 각각 날짜 객체로 변환
                start_date = f"20{match.group(1)}-{match.group(2)}-{match.group(3)}"
                end_date = f"20{match.group(4)}-{match.group(5)}-{match.group(6)}"

                start_date_obj = datetime.strptime(start_date, "%Y-%m-%d")
                end_date_obj = datetime.strptime(end_date, "%Y-%m-%d")

                # 12월에 포함된 날짜인지 확인
                if start_date_obj.month == 12 or end_date_obj.month == 12 or (start_date_obj.month < 12 < end_date_obj.month):
                    popups.append({
                        "id" : id,
                        "title" : popup_names,
                        "date": popup_dates,
                        "start_date": start_date_obj.strftime("%Y-%m-%d") if start_date_obj else None,
                        "end_date": end_date_obj.strftime("%Y-%m-%d") if end_date_obj else None,
                        "location": popup_locations,
                        "image_url": image_url,
                        
                    })
                    id += 1
                

        # JSON 파일 저장
        with open("popups.json", "w", encoding="utf-8") as f:
            json.dump(popups, f, ensure_ascii=False, indent=4)

        print("팝업 정보가 popups.json 파일에 저장되었습니다.")
        # 브라우저 종료
        browser.close()

# 실행
scrape_popup_info()
