# RanChat-Server
* REST 방식으로 모든 요청을 처리함
* 통신 링크 : 15.164.126.18

## DATABASE Scheme
> User Scheme

| Field | Type | Nullable | Key | Extra |
| ------ | ------ | ------ | ------ | ------ |
| nickname | varchar(50) | NO | PRI |  |
| id | varchar(50) | NO | PRI |  |
| pw | varchar(50) | NO | PRI |  |
| sex | varchar(50) | NO | PRI |  |
| age | varchar(50) | NO | PRI |  |
| region | varchar(50) | NO | PRI |  |
| profile | varchar(50) | YES | PRI | 프로필 이미지 저장 경로입니다. |
| introduce | varchar(50) | YES | PRI |  |
| star | varchar(50) | NO | PRI | 소유한 별 개수입니다. |
| signdate | varchar(50) | NO | PRI | 회원 가입 일시를 나타냅니다. |
| salt | varchar(50) | NO | PRI | 회원 가입시 내부적으로 저장되는 암호화 키 입니다. |

