# RanChat-Server
* REST 방식으로 모든 요청을 처리함
* 로그인은 세션 방식을 사용
* 통신 링크 : 15.164.126.18

## DATABASE Scheme
> User Scheme

| Field | Type | Nullable | Key | Extra |
| ------ | ------ | ------ | ------ | ------ |
| nickname | varchar(50) | NO | PRI | 닉네임 |
| id | varchar(50) | NO | PRI | ID |
| pw | varchar(50) | NO | PRI | PW |
| sex | varchar(50) | NO | PRI | 성별 |
| age | varchar(50) | NO | PRI | 나이 |
| region | varchar(50) | NO | PRI | 지역 |
| profile | varchar(50) | YES | PRI | 프로필 이미지 서버 저장 경로 |
| introduce | varchar(50) | YES | PRI | 소개 |
| star | varchar(50) | NO | PRI | 소유한 별 개수 |
| signdate | varchar(50) | NO | PRI | 회원 가입 일시 |
| salt | varchar(50) | NO | PRI | 회원 가입시 내부적으로 저장되는 암호화 키 |

## API Document

### Auth (회원가입, 로그인, 로그아웃, 탈퇴)

> <code>POST</code> /user/signup
>> Requiring Params
    username
