from flask import Flask, Response
from bs4 import BeautifulSoup
import json
import re
from datetime import datetime
import aiohttp
import asyncio
from geopy.geocoders import Nominatim

app = Flask(__name__)

@app.route('/festivals', methods=['GET'])
async def get_festivals():
    base_url = "https://www.visitbusan.net/schedule/list.do"
    festivals = []  # 결과 저장 리스트
    geolocator = Nominatim(user_agent="geoapi")  # Geolocator 초기화

    async def fetch(session, url):
        async with session.get(url) as response:
            return await response.text()

    async def fetch_festival_details(session, detail_url):
        location = "정보 없음"
        lat, lon = None, None
        try:
            html = await fetch(session, detail_url)
            detail_soup = BeautifulSoup(html, 'html.parser')
            location_tags = detail_soup.find_all(text=True)
            for text in location_tags:
                text_str = str(text)
                if re.search(r"장\s*소\s*:(.+)", text_str):  # "장소:" 또는 "장 소:" 처리
                    location = re.search(r"장\s*소\s*:(.+)", text_str).group(1).strip()
                    break

            # Geopy를 사용하여 위도/경도 변환
            try:
                geo = geolocator.geocode("부산 " + location)  # "부산"을 추가하여 정확도 향상
                if geo:
                    lat, lon = geo.latitude, geo.longitude
            except Exception as e:
                print(f"위치 변환 실패: {e}")
        except Exception as e:
            print(f"상세 페이지 요청 실패: {e}")

        return location, lat, lon

    async def process_page(session, start_page):
        # URL에 startPage를 앞쪽에 배치
        list_url = f"{base_url}?startPage={start_page}&boardId=BBS_0000009&menuCd=DOM_000000204012000000&month=12&year=2024"
        print(f"요청 중: {list_url}")
        html = await fetch(session, list_url)
        soup = BeautifulSoup(html, 'html.parser')
        festival_div = soup.find('div', class_='newcalendar festival')
        if not festival_div:  # 데이터가 없는 페이지 감지
            return []
        
        festival_list = festival_div.find('ul', id='playlist').find_all('li')
        if not festival_list:  # 축제 리스트가 비어 있는 경우
            print(f"페이지 {start_page}에 데이터 없음. 크롤링 종료.")
            return []


        page_festivals = []
        tasks = []
        for festival in festival_list:
            title = festival.find('p', class_='tit').text.strip()  # 축제 제목
            date = festival.find('p', class_='cont').text.strip()  # 축제 날짜
            detail_url = "https://www.visitbusan.net" + festival.find('a')['href']  # 상세 페이지 링크
            image_url = "https://www.visitbusan.net" + festival.find('p', class_='imgwrap').find('img')['src']  # 이미지 URL

            # 날짜 처리
            try:
                start_date, end_date = date.split(" ~ ")
                start_date_obj = datetime.strptime(start_date.strip(), "%Y-%m-%d")
                end_date_obj = datetime.strptime(end_date.strip(), "%Y-%m-%d")
            except Exception as e:
                print(f"날짜 처리 실패: {e}")
                start_date_obj, end_date_obj = None, None

            # 상세 페이지 비동기 요청
            tasks.append(asyncio.create_task(fetch_festival_details(session, detail_url)))

            # 기본 정보 저장
            page_festivals.append({
                "title": title,
                "date" : date,
                "start_date": start_date_obj.strftime("%Y-%m-%d") if start_date_obj else None,
                "end_date": end_date_obj.strftime("%Y-%m-%d") if end_date_obj else None,
                "image_url": image_url
            })

        details = await asyncio.gather(*tasks)
        for i, detail in enumerate(details):
            location, lat, lon = detail
            page_festivals[i]["location"] = location
            page_festivals[i]["latitude"] = lat
            page_festivals[i]["longitude"] = lon

        return page_festivals

    async def fetch_all():
        async with aiohttp.ClientSession() as session:
            tasks = []
            start_page = 1
            while True:
                task = process_page(session, start_page)
                result = await task  # 현재 페이지 결과
                if not result:  # 데이터가 없으면 종료
                    break
                festivals.extend(result)
                start_page += 1  # 다음 페이지로 이동

    await fetch_all()

    # JSON 데이터 UTF-8로 반환
    return Response(json.dumps(festivals, ensure_ascii=False, indent=4), content_type="application/json; charset=utf-8")


if __name__ == '__main__':
    app.run(debug=True)
