# RanChat-Server
* REST 방식으로 모든 요청을 처리함
* 로그인은 세션 방식을 사용
* 통신 링크 : 15.164.126.18

## DATABASE Scheme
> User Scheme

| Field | Type | Nullable | Key | Extra |
| ------ | ------ | ------ | ------ | ------ |
| nickname | varchar(50) | NO | PRI | 닉네임 |
| id | varchar(30) | NO |  | ID |
| pw | varchar(30) | NO |  | PW |
| sex | varchar(10) | NO |  | 성별 |
| age | tinyint(4) | NO |  | 나이 |
| region | varchar(50) | NO |  | 지역 |
| profile | varchar(50) | YES |  | 프로필 이미지 서버 저장 경로 |
| introduce | varchar(50) | YES |  | 소개 |
| star | int(10) UNSIGNED | NO |  | 소유한 별 개수 |
| signdate | datetime | NO |  | 회원 가입 일시 |
| salt | varchar(100) | NO |  | 회원 가입시 내부적으로 저장되는 암호화 키 |

## API Document

### Auth (회원가입, 로그인, 로그아웃, 탈퇴)

#### 회원가입
> <code>POST</code> /user/signup
>> Requiring Params

    userNickname : nickname (String)
    userID : id (String)
    userPW : pw (String)
    userSex : sex (String)
    userAge : age (tinyint) //0~255
    userRegion : region (String)
    userIntroduce : introduce (String)
    userImage : Image File (Data)
    
    
    
    
    
    
