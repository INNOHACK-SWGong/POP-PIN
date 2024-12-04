from playwright.sync_api import sync_playwright

def scrape_popup_info():
    with sync_playwright() as p:
        # 브라우저 실행
        browser = p.chromium.launch(headless=True)  # True로 하면 헤드리스 모드, False는 화면을 표시
        page = browser.new_page()

        # 페이지 열기
        page.goto("https://www.popply.co.kr/popup/search?query=%EB%B6%80%EC%82%B0&status=all&fromDate=2024-12-04&toDate=2024-12-04")

        # 페이지가 완전히 로드될 때까지 대기 (선택자에 맞춰 대기)
        page.wait_for_selector('.popup-name')  # 팝업 이름이 로드될 때까지 대기

        # 팝업 정보 크롤링
        popup_names = page.query_selector_all('.popup-name')  # 팝업 이름 추출
        popup_locations = page.query_selector_all('.popup-location')  # 팝업 위치 추출
        popup_dates = page.query_selector_all('.popup-date')  # 팝업 날짜 추출

        # 추출된 데이터를 출력
        for i in range(len(popup_names)):
            name = popup_names[i].inner_text().strip()  # 팝업 이름
            location = popup_locations[i].inner_text().strip()  # 팝업 위치
            date = popup_dates[i].inner_text().strip()  # 팝업 날짜

            # 출력
            print(f"팝업 이름: {name}")
            print(f"위치: {location}")
            print(f"날짜: {date}")
            print("-" * 40)  # 구분선

        # 브라우저 닫기
        browser.close()

# 실행
scrape_popup_info()
