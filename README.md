![image](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FoR6nn%2FbtrTqgg8jQ3%2FZ3qNmXHdvsefTRJrVhueKK%2Fimg.png)

<h3 align="center"> Node.js의 장점인 동시 I/O를 활용하여 제작한 프로젝트 입니다. </h2>

<br><br>

# 💡 **프로젝트 소개**

### 팀 노션
팀 워크스페이스 바로가기 <br>
👉🏻 **[[Notion]](https://www.notion.so/4af95fa3549a44fda6863df00550a2cb)**

<br>

### 핵심 키워드

1. Socket.io
    - 서버의 능동적인 통신
    - vs REST api
    - 쉬운 ws 구현 및 자체적인 테스트 환경 제공
2. MSA
    - 트래픽 증가 대처
    - vs Monolithic
    - 기타 Auto Scaling, ASC, ELB, Nginx 등

<br>

### 사용한 데이터

- 약 200만 건의 유저 데이터


<br><br>


# 💡 **기술적인 도전 및 트러블 슈팅**

### 🔹 Worker Threads를 활용하여 방치형 자동 전투 구현 

      -  IO < CPU연산

      -  로직 소개

### 🔹 Redis를 활용한 전투정보 캐싱

      -  서비스의 규모가 커짐에 따라 사용자 정보를 불러올 때 매번 DB에 접속하는 방식에서 성능적인 이슈 발생 가능성 ↑

      -  업데이트가 자주 일어나지 않고 반복적으로 동일한 결과를 출력하는 경우가 많음 → 메모리에 저장(캐싱)해두면 DB의 부하는 감소하고,  속도는 향상됨 

### 🔹 Socket.io 기반 MSA 구현

      -  클라이언트<>요청송수신서버<>요청처리서버 소캣 연결 유지

      -  Socket Adapter, Socket Emitter, Redis PUB/SUB

      -  클라이언트 > 소켓서버(API게이트웨이) > 요청처리서버 > 클라이언트

### 🔹 Load Balancing과 Socket Session

      -  소켓서버 > 요청처리서버 Load Balancing이 이루어질 때 최초 클라이언트 정보가 없어, 연속적인 커맨드 입력이 요청처리서버 수에 따라 1/n로 이루어지는 상황

      -  Message Broker

      -  다른 WAS 인스턴스와 연결할 필요가 없고, 시간적인 한계로 WAS 인스턴스 내 로컬 REDIS에 처리 정보 캐싱

      -  ex) 전투 시작&중단


<br><br>


# 💡 **성능개선 사항**

### 🔹 자동전투 연산 처리 속도

      -  1사이클 3~5 DB조회

      -  캐싱 => 1사이클 0~1 DB조회

      -  멀티스레드 => 연산 병렬화

      -  but... 전투1 3워커 메모리 지나치게 점유(전투1당 50mb) => 전투1 1워커로 정리 및 풀 제한

### 🔹 메모리 누수로 인하여 리팩토링 진행

      -  사람이 없는 채팅방, 종료가 된 전투 정보 및 지워지지 않는 timer

      -  ASC 미적용 기준

      -  유저 200명: 시나리오 성공률 83%>93.5% / 응답속도 299.90ms>138.21ms

      -  유저 300명: 시나리오 성공률 76.7%>84.3% / 응답속도 540.68ms>474.13ms

### 🔹 동시처리 능력

      -  monolithic (MVP 스펙)

         - 응답속도

         - 동시처리 한계

      -  microservice

         - 응답속도

         - 동시처리 한계

         - 동시 접속 유저(IO 1초이내)

         - 동시 접속 유저(user scenario 0.5초이내)

      -  asc&lb

         - 응답속도

         - 동시처리 한계

         - 동시 접속 유저(IO 1초이내)

         - 동시 접속 유저(user scenario 0.5초이내)

### 🔹 Github Actions + Docker, Docker-compose를 활용한 CI/CD

      -  배포 자동화를 통해 효율적인 협업 및 작업 환경을 구축하기 위함

      -  간단한 CI/CD기능을 사용할 예정이라 Github Actions 로 결정

      -  ELK (Elastic Search, Logstash, Kibana)는 모두 연관되어 동작해야 함 → docker-compose로 묶어 구축함

<br><br><br>


# 아키텍쳐
![image](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FbEqmpI%2FbtrTltnXyNk%2FPSNRyqJzFH7IvKZAdXGDD1%2Fimg.jpg)

<br><br><br>

# 기술스택
|분류|기술|
| :-: |:- |
|Language|<img src="https://img.shields.io/badge/JavaScript-yellow?style=for-the-badge&logo=javascript&logoColor=white">|<img src="https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript&logoColor=white">|
|Framework|<img src="https://img.shields.io/badge/nodejs-green?style=for-the-badge&logo=node.js&logoColor=white">|<img src="https://img.shields.io/badge/express-yellow?style=for-the-badge&logo=express&logoColor=white">|
|Build Tool|<img src="https://img.shields.io/badge/ts_node-blue?style=for-the-badge&logo=tsnode&logoColor=white">|
|DB|<img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=MySQL&logoColor=white">|
|Server|<img src="https://img.shields.io/badge/aws ec2-232F3E?style=for-the-badge&logo=AmazonAWS&logoColor=white">|
|CI/CD|<img src="https://img.shields.io/badge/GitHub Actions-2088FF?style=for-the-badge&logo=GitHub Actions&logoColor=white"> <img src="https://img.shields.io/badge/docker-00A6E4?style=for-the-badge&logo=docker&logoColor=white">|
|Caching|<img src="https://img.shields.io/badge/redis-B71C1C?style=for-the-badge&logo=redis&logoColor=white">|


<br><br><br>


# 설계
<details>
    <summary> <b>📕 DB 설계 (ERD)</b> </summary>
    <img src="https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FLQM3y%2FbtrTmYuuoFa%2FofPvJOnd27c03eGDHviBQk%2Fimg.png">
    <div markdown="1">
        
> 자세히 보러 가기 👉🏻 [**[Notion] 📕 DB 설계**](https://)
>
        
<br>
        
</div>
</details>
<details>
    <summary> <b>📝 API 설계</b> </summary>
    <img src="https://">
    <div markdown="1">
        
> 자세히 보러 가기 👉🏻 [**[Notion] 📝 API 설계**](https://)
>
        
<br>
        
</div>
</details>

<br><br><br>


# 팀원

|이름|포지션|분담|@ Email|Github|
|------|------|------|------|------|
|김세욱|BackEnd|검색(쿼리 최적화)<br>부하 테스트<br>캐싱<br/>|ninthsun91@gmail.com|https://github.com/ninthsun91|
|왕준혁|BackEnd|검색(쿼리 최적화)<br>부하 테스트<br>동시성 제어|@gmail.com|https://github.com/Monggle88|
|장용호|BackEnd|검색(쿼리 최적화)<br>부하 테스트<br>로깅|didlsdydgh@gmail.com|https://github.com/JangKroed|
