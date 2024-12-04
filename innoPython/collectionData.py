import requests
from bs4 import BeautifulSoup

# 타겟 URL
url = "https://www.visitbusan.net/schedule/list.do?boardId=BBS_0000009&menuCd=DOM_000000204012000000&contentsSid=447"

# 요청 보내기
response = requests.get(url)

# 응답 확인
if response.status_code == 200:
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # 축제 정보를 담고 있는 div 태그 선택
    festival_div = soup.find('div', class_='newcalendar festival')
    festival_list = festival_div.find('ul', id='playlist').find_all('li')

    # 데이터 추출
    for festival in festival_list:
        title = festival.find('p', class_='tit').text.strip()  # 축제 제목
        date = festival.find('p', class_='cont').text.strip()  # 축제 날짜
        image_url = festival.find('p', class_='imgwrap').find('img')['src']  # 이미지 URL
        detail_url = "https://www.visitbusan.net" + festival.find('a')['href']  # 상세 페이지 링크

        # 출력
        print(f"축제 제목: {title}")
        print(f"축제 날짜: {date}")
        print(f"이미지 URL: {image_url}")
        print(f"상세 페이지 링크: {detail_url}")
        print("-" * 50)
else:
    print(f"요청 실패: {response.status_code}")

