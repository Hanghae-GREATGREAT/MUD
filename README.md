
![image](https://blog.kakaocdn.net/dn/vWLJL/btrUtF196jG/Pg4VPuoKuhvP1mvL1SrRJ1/img.png)
![image](https://blog.kakaocdn.net/dn/ltg7j/btrTzkSklWF/2x1jgJvjDp2ZixZk3yaVj1/img.png)

<h3 align="center"> Node.js의 장점인 동시I/O를 강조하기위한 텍스트형 온라인웹게임입니다. </h2>
<h3 align="center">동시접속자 기본 1000명 이상, 최대 5천명까지의 트래픽을 처리할 수 있습니다. </h3>

![image](https://postfiles.pstatic.net/MjAyMjEyMTZfMjgy/MDAxNjcxMTQ0Mzg4OTUw.hnqNNxWEtavH54M6zXUyIU5nBDOXuL5XSU7tUjnZGRog.wtckPYC01WFAwKuPbyKjsvMci0zMqwJS9JsWqGPZM6og.PNG.celloman1929/image.png?type=w773)

![image](https://postfiles.pstatic.net/MjAyMjEyMTZfMTQg/MDAxNjcxMTQ0MzQ3Nzg4.XnZ0I2BE1hIYvpivtFmXnyhQFO4qXfziIwsX3XH8hCQg.5UO4CboFGEueLAm2aYVewTPWqEPEeLsxtkQuVVzz_msg.PNG.celloman1929/image.png?type=w773)

<h3 align="center"> 자동전투와 3vs3 플레이어 대전 </h2>

<br><br>

# 💡 **프로젝트 소개**

### 팀 노션
팀 워크스페이스 바로가기 <br>
👉🏻 **[[Notion]](https://loving-skipjack-9c0.notion.site/TEAM-MUD-7c0b6eafff5042dc8520f0bc073f8f19)**

<br>

### 핵심 키워드

1. Socket.io
    - RestAPI는 1요청 1응답이라는 수동적인 한계가 있음
    - 전투 로그 등 서버의 처리 경과를 수시로 출력해야하기 때문에
      서버가 능동적으로 통신을 할 수 있는 웹소켓 기반의 서버 구축
    - 쉬운 WS 구현 및 자체적인 테스트 환경 제공하는 Socket.io
2. Microservice
    - 트래픽이 몰리는 서버의 부분만 유연하게 스케일링하기 위해 Microservice 도입
    - EKS&K8S vs EC2&ASG
    - 프로젝트 기간의 시간적 한계로 EC2 인스턴스 단위의 오토스케일링 적용
    - ASG, ELB, Route53, CloudWatch 등 AWS 서비스를 함께 사용하여 유지관리
3. Worker Thread
    - 전투연산 등 IO대비 CPU연산의 비중이 큰 작업들이 존재하며
      해당 작업들에 트래픽이 치중되는 상황이 예상
    - 따라서 멀티스레드 환경을 구성하여 메인 스레드에서는 IO처리에만 집중하고,
      전투연산 등의 작업은 Worker Thread에 할당하여 처리 

<br>

### 사용한 데이터

- 약 1만 건의 유저 데이터


<br><br>


# 아키텍쳐
![image](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FrDP1l%2FbtrTjGHUE0T%2FBulzP6tGktKcRyHv6Isl80%2Fimg.jpg)

<br><br>


# 기술스택
|분류|기술|
| :-: |:- |
|Language|<img src="https://img.shields.io/badge/JavaScript-yellow?style=for-the-badge&logo=javascript&logoColor=white"> <img src="https://img.shields.io/badge/TypeScript-blue?style=for-the-badge&logo=typescript&logoColor=white">|
|Framework|<img src="https://img.shields.io/badge/nodejs-green?style=for-the-badge&logo=node.js&logoColor=white"> <img src="https://img.shields.io/badge/express-yellow?style=for-the-badge&logo=express&logoColor=white"> <img src="https://img.shields.io/badge/socketio-black?style=for-the-badge&logo=socket.io&logoColor=white">|
|DB|<img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=MySQL&logoColor=white"> <img src="https://img.shields.io/badge/sequelize-blue?style=for-the-badge&logo=sequelize&logoColor=white"> <img src="https://img.shields.io/badge/redis-B71C1C?style=for-the-badge&logo=redis&logoColor=white">|
|Server|<img src="https://img.shields.io/badge/aws ec2-232F3E?style=for-the-badge&logo=AmazonAWS&logoColor=white"> <img src="https://img.shields.io/badge/aws%20asg-yellow?style=for-the-badge&logo=AmazonAWS&logoColor=white"> <img src="https://img.shields.io/badge/aws%20elb-ff6600?style=for-the-badge&logo=AmazonAWS&logoColor=white"> <img src="https://img.shields.io/badge/nginx-green?style=for-the-badge&logo=nginx&logoColor=white">|
|DevOps|<img src="https://img.shields.io/badge/docker-0066ff?style=for-the-badge&logo=docker&logoColor=white"> <img src="https://img.shields.io/badge/docker%20compose-0099ff?style=for-the-badge&logo=docker_compose&logoColor=white">  <img src="https://img.shields.io/badge/aws%20cloud%20watch-000000?style=for-the-badge&logo=AmazonAWS&logoColor=white">|


<br><br><br>


# 💡 **기술적인 도전 및 트러블 슈팅**

### 🔹 Worker Threads를 활용하여 방치형 자동 전투 구현 

![image](https://postfiles.pstatic.net/MjAyMjEyMTZfMjkg/MDAxNjcxMTQzNzgzMjAx.B5MX2yOHDvskf11yVLHa7OfosmWK8H4zggTw2dckReIg.PVA06fE86dN83Jo3e4jDdbRaT-5eE5TqLnJtz8YOCR0g.PNG.celloman1929/image.png?type=w773)
<h5 align="center">PVP대전 플로우(좌), 던전 자동사냥 플로우(우)</h5>

      -  문제:  개발초기 자동전투 실행 중 다른 동시접속자의 통신에 장애가 발생하는 것을 확인
                서버가 연산 중 블로킹이 발생하여 다른 IO요청이 방해 받는 것으로 추정하였고,
                게임이라는 서비스 특성상 CPU 연산 처리가 중요하기 때문에 멀티스레드 도입 결정

      -  해결: Worker Thread를 사용하여 I/O처리를 제외한 연산을 이관하여 관리하는 방법으로 해결
              워커스레드&이벤트로 스레드풀 구성
              

![image](https://postfiles.pstatic.net/MjAyMjEyMTZfMjUy/MDAxNjcxMTQyODc0NTQ2.ZR2teXq_JifVi3job_tQp1DM-AsPFof6bTEczJP1E1cg._0x2zPVcWslINofWodWTthmWk9-4XxaNLju1OLAOOLog.PNG.celloman1929/%EC%9B%8C%EC%BB%A4%ED%92%80.png?type=w773)

<h5 align="center">스레드풀 작동 플로우</h5>

<br>

### 🔹 PVP 플레이어 대전 실시간 전투 구현

      - 요구사항: 2:2 혹은 3:3 플레이어 간 실시간 대전 및 관전
      - 초기 구현: 턴제 전투 방식에서 착안하고,
                  서버 연산 부담을 줄이기 위해 입력 결과를 모아서 처리
                  

![image](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/2eb545a1-b471-433f-91a9-37e634dee776/Untitled.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20221223%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20221223T112958Z&X-Amz-Expires=86400&X-Amz-Signature=33ae077c6169c36dab8f893396a0a42f0e7e0b72813dc7ac0abac6d955bae351&X-Amz-SignedHeaders=host&response-content-disposition=filename%3D%22Untitled.png%22&x-id=GetObject)

<h5 align="center">초기대전플로우</h5>


      - 문제: 실시간이라는 요구사항에 맞지 않으며, 소켓의 장점을 활용하고 있지 못함
      - 해결: 워커스레드와 레디스를 사용해 전투 상황을 캐싱하고 집계하여
              플레이어 순서에 상관없이 자유롭게 전투 입력을 받고 언제든 실황을 알 수 있음


![image](https://postfiles.pstatic.net/MjAyMjEyMTZfMTEg/MDAxNjcxMTQyOTEzMTA3.gi7OqhKaJcS6K4d1Qz7ovHx4pyo2Jfc8DNJ1BQgOLQAg.76-wELZWVAf9V0lh4kVPConKwN5O955tmuUyfZoap8cg.PNG.celloman1929/image.png?type=w773)

<h5 align="center">최종대전플로우</h5>

<br>

### 🔹 Socket.io 기반 MSA 구현

![image](https://blog.kakaocdn.net/dn/bz6gKh/btrTtk5MUOV/4dBlgiFUqqv0zKqgkK3qK1/img.png)

<h5 align="center">적용 예시</h5>


      -  문제: 서버에서 처리된 경과를 수시로 클라이언트에 송신해줘야 하기 때문에
               양방향 소켓 통신을 하부 마이크로서비스까지 지속 유지해야할 필요성

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
                       

<br>

### 🔹 Load Balancing과 Socket Session

![image](https://blog.kakaocdn.net/dn/DZ16L/btrTvjx2apJ/0NqXn7lpRu6YSAXt4L1eT1/img.webp)

<h5 align="center">예시(전투 시작과 중단)</h5>

      -  문제: MSA화되어 서버 컨테이너가 증가하자 성능향상을 위해 서버 내부에서 맵핑하여 사용하던 데이터들로의 접근이 보장되지 않음
         클라이언트<>소켓서버는 초기에는 Nginx sticky session 설정, 
         나중에는 ELB로 세션이 보장 받으나 WAS 내부적으로는 보장되지 않는 문제

      -  대안: Kafka 등의 이벤트 스트리밍이나 메시지 브로커를 도입하여 사용하는 것이 최선책이었으나,
               1) 같은 WAS 인스턴스 내에서만 데이터 접근 및 교환이 가능하면 되고
               2) 개발 기간에 여유가 없었기 때문에 기존에 사용하던 기술 범위 내에서 해결하는 것이 차선책
               
      -  해결: 빠르고 잦은 접근이 필요한 데이터는 로컬 Redis에, 그 외에는 Redis Cloud를 NoSQL 로서 사용
      
<br>

### 🔹 Redis를 활용한 전투정보 캐싱

      -  서비스의 규모가 커짐에 따라 사용자 정보를 불러올 때 매번 DB에 접속하는 방식에서 성능적인 이슈 발생 가능성 ↑

      -  업데이트가 자주 일어나지 않고 반복적으로 동일한 결과를 출력하는 경우가 많음
         → 메모리에 저장(캐싱)해두면 DB의 부하는 감소하고 속도는 향상

<br>

### 🔹 유저 랜덤 테스트 시나리오 작성

      -  문제:
         복합적인 부하 테스트를 위해 사용자가 서비스내에서 경험할 수 있는 다양한 시나리오가 필요
         
      -  각각의 액션을 테스트 유닛으로 먼저 정의하고,
         게임 내 각 단계에서 이어질 수 있는 액션별로 정리
         
      - 유닛 테스트의 결과가 다음 유닛 테스트의 매개변수에 그대로 들어가는 순환식 코드
      
      - 빈도가 잦은 액션들도 반영하여 가능한 있을법한 시나리오 유도


<br><br>


# 💡 **테스트 및 성능개선 사항**

### 🔹 자동전투 연산 처리 속도

      -  문제: 
         초기 전투연산은 1회 연산을 위해 최대 5차례 데이터베이스 
         접근을 해야 했기에 응답속도가 150ms~350ms 소요

      -  1차 개선:
         자주 사용되는 데이터를 서버 내부적으로 캐싱하여 보관함으로서 DB 접근 횟수를 0~1회로 감소
         
      -  2차 개선:
         일반공격 > 스킬공격 > 결과확인
         3단계로 이루어진 전투 연산을 각각 스레드를 할당하여 병렬 연산
         

![image](https://s3.us-west-2.amazonaws.com/secure.notion-static.com/8e2efc27-f1d7-4f32-8c77-aa98b5348fdf/%EC%9E%90%EB%8F%99%EC%A0%84%ED%88%AC%28%EC%9B%8C%EC%BB%A4%29_-_%ED%94%BC%EA%B7%B8%EB%A7%88.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20221223%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20221223T141159Z&X-Amz-Expires=86400&X-Amz-Signature=6b0d0a0b5df6ca76b8320228978a0490d3477b5d6c791b16d838a2de9b2fc1c8&X-Amz-SignedHeaders=host&response-content-disposition=filename%3D%22%25EC%259E%2590%25EB%258F%2599%25EC%25A0%2584%25ED%2588%25AC%28%25EC%259B%258C%25EC%25BB%25A4%29%2520-%2520%25ED%2594%25BC%25EA%25B7%25B8%25EB%25A7%2588.png%22&x-id=GetObject)

<h5 align="center">병렬처리가 적용된 자동사냥 플로우</h5>


      -  전투연산의 처리속도는 평균 25ms로 처음대비 많이 빨라졌지만,
         1회 연산을 위해 3개의 스레드가 할당되며 이를 위해 메모리를 
         약 50mb 점유하는 등 서버 자원을 크게 소비
      
      -  3차개선: (동시처리 성능개선 함께 참고)
         전투 연산을 위해 서버 자원이 지나치게 사용되며 성능저하를 일으키는 것으로 예상되었기에,
         하나의 스레드에만 할당하되 스레드 내부에서 비동기적으로 처리
         
      - 처리속도가 다소 희생될 것으로 예상했으나 오히려 더 향상됨
      
      - 추정 이유:
         (1) 워커 스레드를 생성 및 관리하는데 사용되는 서버 작업 부담이 줄어서 
         (2) 혹은, 스레드간 결과를 보고하고 처리하는 속도보다 스레드 내부에서 
             비동기적으로 처리 보고를 받는 것이 더 빠르기 때문으로 추정


![image](https://blog.kakaocdn.net/dn/b33KLl/btrTu2iTrht/JqRY5F7B1pOkboM4qg5I9k/img.png)

<h5 align="center">프로젝트 단계별 전투연산 처리속도 비교</h5>


<br>

### 🔹 메모리 누수로 인하여 리팩토링 진행

      - 문제: 사람이 없는 채팅방, 종료가 된 전투 정보 및 지워지지 않는 timer

      - 스레드풀 제한이 없는 멀티스레드 구현으로인해 서버가 다운될때까지 스레드 생성
      
      - 리팩토링 및 스레드풀 구현
      
      - ASG 적용 이전 기준

      - 유저 200명: 시나리오 성공률 83%>93.5% / 응답속도 299.90ms>138.21ms
                    성공률 12.7% 증가, 응답속도 53.91% 감소

      - 유저 300명: 시나리오 성공률 76.7%>84.3% / 응답속도 540.68ms>474.13ms
                    성공률 9.9% 증가, 응답속도 12.30% 감소
                    
                    
![image](https://blog.kakaocdn.net/dn/bJ9J8G/btrTthBofgK/fcTKtpFaWJfGHHzMDsDFN0/img.gif)
![image](https://blog.kakaocdn.net/dn/cyIVRj/btrTt1Ltpsf/kB683kYqBYVcG126kkvhek/img.gif)

<h5 align="center">ASG 미적용 100명 동시접속 테스트 - 메모리 개선 전후 비교</h5>


<br>

### 🔹 동시처리 능력

      - 유저 랜섬 시나리오 테스트 목표 
        100ms이내, 최대 500ms 이내, 성공률 95% 이상을 목표로 설정
        
      - MVP 스펙
        0.1초 이내 처리가능한 요청 개수: 40개 이하
        
      - MSA 적용 이후
        80여개까지 늘었으나 서버 부하가 심하고 테스트 결과가 심하게 불안정함
        앞서서, 1연산을 위해 다수의 스레드가 사용되며 연산으로 이득보는 서버 자원 대비,
        연산 자체를 위해 생성 및 관리하는 스레드로 사용되는 자원이 더 커진 탓으로 추정
        
      - MSA 적용 이후 (전투연산 싱글 스레드화)
        예상대로 싱글 스레드 전환 이후 큰폭으로 동시처리 요청 능력이 향상
        
      - 오토스케일링과 로드밸런싱 적용
        인스턴스를 늘리는만큼 향상되었으며,
        인스턴스 2~3개에서 초당 약 600개를 100ms이내로 처리 가능
        
        

![image](https://postfiles.pstatic.net/MjAyMjEyMTZfNjkg/MDAxNjcxMTQyOTU2NDQ5.DAzVxDWud5z1WSaQQIjpfhK9N88WD3WNFhF39897rikg.cn_0ecCgzrigKJzfOCb7_zQYEQQJe0v0INnaIJVNj7Qg.PNG.celloman1929/image.png?type=w773)

<h5 align="center">프로젝트 단계별 가능한 동시처리 요청</h5>


<br>

### 🔹 동시접속자 테스트

      - 유저 랜덤 시나리오 테스트를 바탕으로 동시 접속 수용 능력 테스트
      
      - 테스트 서버 스펙
        Web Server: EC2 t2.micro
        Web Application Server: EC2 t2.xlarge x2~5
        Database: RDS t3.medium



![image](https://postfiles.pstatic.net/MjAyMjEyMTZfMTg1/MDAxNjcxMTQzMjI3ODI3.GYMIHe-sV1a0X0xI1u0NNs3gFNVnmr9QoGLFNo6F_wMg.NdyjHveuaGhX6P4mCA2bP8CdwqCdHInDXdqysK-6aLQg.PNG.celloman1929/image.png?type=w773)

<h5 align="center">동시접속자 수에 따른 응답속도 비교 - 스케일링 적용 전후</h5>


      - 단일 인스턴스에서는 약 1500명까지가 지연체감 없이 응답을 처리할 수 있는 한계
      
      - 스케일링 적용 이후 3000명 이상, 최대 5000명까지도 50ms이내 처리 가능
      
      - 정해놓은 서버 스펙에서는 5천명이 한계이나, 
        서버 스펙 혹은 인스턴스 개수를 늘리면 늘리는 만큼 추가 수용 가능

<br>

### 🔹 오토스케일링 적용 확인

![image](https://postfiles.pstatic.net/MjAyMjEyMTZfMTI2/MDAxNjcxMTQyODExMzM4.91BBGeqvvATwq2mlhb_zGZtrYQwWst5cd3Jly6Wqsbgg.LOOBPuAU0RLqXeJH_v1OoJcHGavm5Xvc-exErgd7mm8g.PNG.celloman1929/111.png?type=w773)

<h5 align="center">테스트 중 각 인스턴스의 CPU 사용량</h5>

      테스트 시나리오
      15분간 1000명 랜덤 테스트 기본으로 수행
      2~5분: 초당 100명씩 추가로 1000명 랜덤 테스트 추가
      7~13분: 초당 20명씩 추가로 3000명  랜덤 테스트 추가
      
      3000명의 접속자가 추가로 발생할 때 성공적으로 오토스케일링이 이루어지며 트래픽이 분산되는 것을 확인



<br><br><br>


# ERD
![image](https://img1.daumcdn.net/thumb/R1280x0/?scode=mtistory2&fname=https%3A%2F%2Fblog.kakaocdn.net%2Fdn%2FLQM3y%2FbtrTmYuuoFa%2FofPvJOnd27c03eGDHviBQk%2Fimg.png)

<br><br><br>


# 팀원

|이름|포지션|@ Email|Github|
|------|------|------|------|
|김세욱|BackEnd|ninthsun91@gmail.com|https://github.com/ninthsun91|
|왕준혁|BackEnd|fmonggle88@gmail.com|https://github.com/Monggle88|
|장용호|BackEnd|didlsdydgh@gmail.com|https://github.com/JangKroed|
