![image](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FoR6nn%2FbtrTqgg8jQ3%2FZ3qNmXHdvsefTRJrVhueKK%2Fimg.png)

<h3 align="center"> Node.js의 장점인 동시 I/O를 활용하여 제작한 프로젝트 입니다. </h2>

<br><br>

# 💡 **프로젝트 소개**

### 팀 노션
팀 워크스페이스 바로가기 <br>
👉🏻 **[[Notion]](https://www.notion.so/TEAM-MUD-7c0b6eafff5042dc8520f0bc073f8f19)**

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

![image](https://blog.kakaocdn.net/dn/czBKFL/btrToC0v4YB/M9Yk8R9pMkjOxcI1rbhIek/img.png)

      -  문제:  IO 요청보다 CPU연산의 처리량이 높은 기능들이 다수 존재.

      -  해결: Worker Thread를 사용하여 I/O처리를 제외한 연산을 이관하여 관리하는 방법으로 해결.

### 🔹 Socket.io 기반 MSA 구현

![image](https://blog.kakaocdn.net/dn/bz6gKh/btrTtk5MUOV/4dBlgiFUqqv0zKqgkK3qK1/img.png)

      -  문제: 서버에서 처리된 경과를 수시로 클라이언트에 송신해줘야 하기 때문에 양방향 소켓 통신을 하부 마이크로서비스까지 지속 유지해야할 필요성이 있다고 판단.

      -  1) 첫번째 시도
            클라이언트 <> 메인서버만 웹소캣으로 두고, 요청 처리는 api로 각각의 마이크로서비스에 분배.
            단, 1요청 1응답이라는 API 한계가 있으며, 이를 극복하려면 메인 서버 단의 로직이 복잡해진다.
            따라서, 수동적인 요청-응답에서 벗어나기 위한 다른 방법이 필요하다

      -  2) 두번째 시도
            로컬에서 레디스로 이전된 소캣 어댑터를 통해 소캣 통신을 중계할 수 있는 기능을 구현하려했으나 
            실패했고 참고할 레퍼런스가 충분하지 않아 기술적으로 가능한지 의문
      
      -  2) 세번째 시도
            절충안으로 REST와 Socket.io를 혼용하는 방식으로 하되, Socket Adapter의 부가적인 기능인 
            Emitter를 사용하여 비소켓서버에서 클라이언트로의 자율적인 통신 해결.
            이를 통해, 멀티 스레드를 도입하면서 워커 스레드에 소캣 객체를 전달하지 못해 워커 스레드에서 
            처리되는 과정을 전투로그로 클라이언트에 출력하지 못하던 문제도 함께 해결

### 🔹 Load Balancing과 Socket Session

![image](https://blog.kakaocdn.net/dn/DZ16L/btrTvjx2apJ/0NqXn7lpRu6YSAXt4L1eT1/img.webp)

      -  문제: MSA화되어 서버 컨테이너가 증가하자 성능향상을 위해 서버 내부에서 맵핑하여 사용하던 데이터들로의 접근이 보장되지 않음
         클라이언트<>소켓서버는 초기에는 Nginx sticky session 설정, 
         나중에는 ELB로 세션이 보장 받으나 WAS 내부적으로는 보장되지 않는 문제

      -  대안: Kafka 등의 Message Broker를 도입하여 사용하는 것이 최선책이었으나,
               1) 같은 WAS 인스턴스 내에서만 데이터 접근 및 교환이 가능하면 되고
               2) 개발 기간에 여유가 없었기 때문에 기존에 사용하던 기술 범위 내에서 해결하는 것이 차선책
               
      -  해결: 빠르고 잦은 접근이 필요한 데이터는 로컬 Redis에, 그 외에는 Redis Cloud를 NoSQL 로서 사용

### 🔹 Redis를 활용한 전투정보 캐싱

      -  서비스의 규모가 커짐에 따라 사용자 정보를 불러올 때 매번 DB에 접속하는 방식에서 성능적인 이슈 발생 가능성 ↑

      -  업데이트가 자주 일어나지 않고 반복적으로 동일한 결과를 출력하는 경우가 많음 → 메모리에 저장(캐싱)해두면 DB의 부하는 감소하고,  속도는 향상됨 


<br><br>


# 💡 **테스트 및 성능개선 사항**

### 🔹 자동전투 연산 처리 속도

      -  1사이클 3~5 DB조회

      -  캐싱 => 1사이클 0~1 DB조회

      -  멀티스레드 => 연산 병렬화

      -  but... 전투1 3워커 메모리 지나치게 점유(전투1당 50mb) => 전투1 1워커로 정리 및 풀 제한
      
      -  250ms >> 15ms (94%) 감소
      
![image](https://blog.kakaocdn.net/dn/b33KLl/btrTu2iTrht/JqRY5F7B1pOkboM4qg5I9k/img.png)

### 🔹 메모리 누수로 인하여 리팩토링 진행

      -  사람이 없는 채팅방, 종료가 된 전투 정보 및 지워지지 않는 timer

      -  ASC 미적용 기준

      -  유저 200명: 시나리오 성공률 83%>93.5% / 응답속도 299.90ms>138.21ms
                    성공률 12.7% 증가, 응답속도 53.91% 감소

      -  유저 300명: 시나리오 성공률 76.7%>84.3% / 응답속도 540.68ms>474.13ms
                    성공률 9.9% 증가, 응답속도 12.30% 감소
                    
![image](https://blog.kakaocdn.net/dn/bJ9J8G/btrTthBofgK/fcTKtpFaWJfGHHzMDsDFN0/img.gif)
![image](https://blog.kakaocdn.net/dn/cyIVRj/btrTt1Ltpsf/kB683kYqBYVcG126kkvhek/img.gif)


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

<br><br><br>


# 아키텍쳐
![image](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FrDP1l%2FbtrTjGHUE0T%2FBulzP6tGktKcRyHv6Isl80%2Fimg.jpg)

<br><br><br>


# ERD
![image](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FLQM3y%2FbtrTmYuuoFa%2FofPvJOnd27c03eGDHviBQk%2Fimg.png)

<br><br><br>


# 기술스택
|분류|기술|
| :-: |:- |
|Language|<img src="https://img.shields.io/badge/JavaScript-yellow?style=for-the-badge&logo=javascript&logoColor=white"> <img src="https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript&logoColor=white">|
|Framework|<img src="https://img.shields.io/badge/nodejs-green?style=for-the-badge&logo=node.js&logoColor=white"> <img src="https://img.shields.io/badge/express-yellow?style=for-the-badge&logo=express&logoColor=white">|
|Build Tool|<img src="https://img.shields.io/badge/ts_node-blue?style=for-the-badge&logo=tsnode&logoColor=white">|
|DB|<img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=MySQL&logoColor=white">|
|Server|<img src="https://img.shields.io/badge/aws ec2-232F3E?style=for-the-badge&logo=AmazonAWS&logoColor=white">|
|Caching|<img src="https://img.shields.io/badge/redis-B71C1C?style=for-the-badge&logo=redis&logoColor=white">|


<br><br><br>

# 라이브러리
```json

"dependencies"

    "@socket.io/redis-adapter": "^7.2.0",
    "bcrypt": "^5.1.0",
    "dotenv": "^16.0.3",
    "express": "^4.18.2",
    "mysql2": "^2.3.3",
    "node-fetch": "^2.6.7",
    "redis": "^4.4.0",
    "sequelize": "^6.25.5",
    "socket.io": "^4.5.3"
    

"devDependencies": {
    "@babel/core": "^7.20.2",
    "@babel/preset-env": "^7.20.2",
    "@babel/preset-typescript": "^7.18.6",
    "@types/bcrypt": "^5.0.0",
    "@types/ejs": "^3.1.1",
    "@types/express": "^4.17.14",
    "@types/jest": "^29.2.2",
    "@types/node-fetch": "^2.6.2",
    "@types/sequelize": "^4.28.14",
    "@types/supertest": "^2.0.12",
    "jest": "^29.3.1",
    "nodemon": "^2.0.20",
    "socket.io-client": "^4.5.3",
    "supertest": "^6.3.1",
    "ts-jest": "^29.0.3",
    "ts-node": "^10.9.1",
    "typescript": "^4.8.4"
  }
  
```


<br><br><br>


# 팀원

|이름|포지션|@ Email|Github|
|------|------|------|------|
|김세욱|BackEnd|ninthsun91@gmail.com|https://github.com/ninthsun91|
|왕준혁|BackEnd|fmonggle88@gmail.com|https://github.com/Monggle88|
|장용호|BackEnd|didlsdydgh@gmail.com|https://github.com/JangKroed|
