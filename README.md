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

### Auth (회원가입, 로그인, 로그아웃, 탈퇴)
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
    
    
    
    
    
    
