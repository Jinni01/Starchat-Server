# StarChat-Server
* <code>POST</code> <code>x-www-form-urlencoded</code> 방식으로 대부분의 요청을 처리함
* 통신 링크 : 15.164.126.18

## DATABASE TABLE 
> User

| Field | Type | Nullable | Key | Extra |
| ------ | ------ | ------ | ------ | ------ |
| email | varchar(30) | NO | PRI | 이메일 |
| id | varchar(30) | NO |  | ID |
| pw | varchar(300) | NO |  | 암호화된 PW | 
| nickname | varchar(50) | NO |  | 닉네임 |
| sex | varchar(10) | NO |  | 성별 |
| age | tinyint(4) | NO |  | 나이 (0~255) |
| region | varchar(50) | NO |  | 지역 |
| introduce | varchar(200) | YES |  | 소개 |
| profile | varchar(100) | YES |  | 프로필 이미지 서버 저장 경로 |
| star | int(10) UNSIGNED | NO |  | 소유한 별 개수 |
| signdate | datetime | NO |  | 회원 가입 일시 |
| salt | varchar(100) | NO |  | 회원 가입시 내부적으로 저장되는 암호화 키 |

## API Document

### 목차
1. [Auth](#auth)
2. [Chat](#chat)


### Auth (회원가입, 로그인, 로그아웃, 탈퇴) <span id="auth"></span>
* 로그인 방식 : 세션

#### Email/ID 중복체크
> /user/signup
>> Requiring Params

    "userEmail" : "email" (String),
    "userID" : "id" (String),
    "userPW" : "pw" (String)
    
>> Return Value

    >>> Success
        
        return HTTP 200, { success: true, message: "가입할 수 있는 정보입니다" }
        
    >>> Fail
    
        return HTTP 400, { success: false, message: "이미 가입된 이메일입니다"}
        return HTTP 400, { success: false, message: "이미 가입된 ID입니다"}


#### 유저 정보 등록
<code>multipart/form-data</code> 방식으로 요청
> /user/create-profile
>> Requiring Params

    "userEmail": "email" (String),
    "userID": "id" (String),
    "userPW": "pw" (String),
    "userNickname": "nickname" (String),
    "userSex": "sex" (String),
    "userAge": "age" (tinyint),
    "userRegion": "region" (String),
    "userIntroduce": "introduce" (String),
    "userProfile": "profile" (file)
    
>> Return Value

    >>> Success
    
        return HTTP 201, { success: true, message: "회원 가입 성공" }
        
    >>> Fail
    
        return HTTP 204
        return HTTP 500, { success: false, message: "DB에러" }
    
#### 로그인
> /user/login
>> Requiring Params 

    "userID": "id" (String),
    "userPW": "pw" (String)

>> Return Value

    >>> Success
    
        return HTTP 200, User Scheme
        {
            "email": "email" (String)
            "id": "id" (String),
            "nickname": "nickname" (String),
            "sex": "sex" (String),
            "age": "age" (tinyint),
            "region": "region" (String),
            "introduce": "introduce" (String),
            "profile": "profile" (String),
            "star": "star" (int UNSIGNED) 
        }
        
     >>> Fail
     
        FailureRedirect "/user/login-fail"

> /user/login-fail
>> Return Value

    return HTTP 401, { success: false, message: "존재하지 않는 ID 입니다" }
    return HTTP 401, { success: false, message: "잘못된 비밀번호입니다" }
        

#### 로그아웃
> /user/logout
>> Requiring Params

    NO Param
    
>> Return Value

    >>> Success
    
        { return HTTP 200, success: true, message: "로그아웃 성공" }
        
    >>> Fail
    
        { return HTTP 400, success: false, message: "로그인되어 있지 않습니다" }
        

#### 회원탈퇴
> /user/leave
>> Requiring Params

    NO Param
    
>> Return Value

    >>> Success
    
        return HTTP 200, { success: true, message: "유저 정보 삭제 성공" }
        
    >>> Fail
    
        return HTTP 204
        return HTTP 500, { success: false, message: "DB에러" }
    
    
### Chat (온라인 상태 등록, 온라인 유저 목록, 채팅 초대/응답, 접속, 채팅, 종료) <span id="chat"></span>
* 이벤트명은 <code>emit</code>|<code>on</code> eventName 과 같이 표기함
* on을 통한 반환시 (data) 와 같은 값을 받아줄 변수가 필요함 (<code>ex</code> { success: true } 반환시 data.true 로 접근 )

> 미리 선언해야 할 변수
    
    String room_id;

#### 온라인 상태 등록
> <code>emit</code> reqOnline
>> Requiring Params

    "email": "userEmail"

> <code>on</code> resOnline, (data) 
>> Return Value

    >>> Success
    
        return { success: true, message: "접속 성공" }
        
    >>> Fail
    
        None
        
        
#### 온라인 유저 목록
> <code>emit</code> reqOnlineUser
>> Requiring Params

    NO Param

> <code>on</code> resOnlineUser, (data) 
>> Return Value

    >>> Success
    
        return userList [
        {
            "email": "userEmail",
            "id": "userID",
            "nickname": "userNickname",
            "sex": "userSex",
            "age": "userAge",
            "region": "userRegion",
            "introduce": "userIntroduce",
            "profile": "userProfile" 
        }
        {
            ...
        }
        ]
        
    >>> Fail
    
        None
        
        
#### 채팅 초대 
> <code>emit</code> reqInviteUser
>> Requiring Params

    "to": "otherUserEmail",
    "from": "userEmail"

> <code>on</code> resInviteUser, (data) 
>> Return Value

    >>> Success
    
        return { from: "from-Email", sid: "from-SocketID" }
        
        action
        - 수락: reqAcceptInvite
        - 거절: None 
        
    >>> Fail
    
        None
        

#### 초대 수락
> 필요 작업
>> <code>room_id</code> 변수 초기화
  
    room_id = data.from + "-" + 초대를 받은 유저의 userEmail;
    
    
> <code>emit</code> reqAcceptInvite
>> Requiring Params

    "sid": "(resInviteUser의)data.sid",
    "roomname": room_id


> <code>on</code> resAcceptInvite, (data) 
>> Return Value

    >>> Success
    
        return { roomname: new-roomname }
        
        action
        - joinRoom
        
    >>> Fail
    
        None


> 필요 작업 
>> <code>room_id</code> 변수 초기화
  
    room_id = data.roomname;
     

#### 초대 거절
> <code>emit</code> reqRejectInvite
>> Requiring Params

    "sid": "(resInviteUser의)data.sid",


> <code>on</code> resRejectInvite, (data) 
>> Return Value

    >>> Success
    
        return { message: "상대방이 초대를 거부하였습니다" }
        
    >>> Fail
    
        None


#### 접속 
> <code>emit</code> joinRoom
>> Requiring Params

    "roomname": room_id


#### 채팅 내 알림
> <code>on</code> notice, (data) 
>> Return Value

    >>> Success
    
        return { message: "noticeMessage" }
        
    >>> Fail
    
        None
        
        
#### 채팅
* 채팅 보내기
> <code>emit</code> sendMessage
>> Requiring Params

    "contents": "sendContents",
    "roomname": room_id,
    "from": "userNickname"

* 채팅 받기 
> <code>on</code> receiveMessage, (data) 
>> Return Value

    >>> Success
    
        return { contents: "receivedContents", from: "from-Nickname" }
        
    >>> Fail
    
        None
        
        
#### 접속 종료
> <code>emit</code> reqExitRoom
>> Requiring Params

    "roomname": room_id


> <code>on</code> resExitRoom, (data) 
>> Return Value

    >>> Success
    
        return { message: "채팅방에서 나왔습니다" }
        
    >>> Fail
    
        None
        
        
