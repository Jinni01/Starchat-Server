$(".button-login").click(() => {
    const id = $(".input-id").val();
    const pw = $(".input-pw").val();

    if(id == "" || id == undefined){
        $(".text-msg").val("아이디를 입력하세요");
    }

    if(pw == "" || pw == undefined){
        $(".text-msg").val("비밀번호를 입력하세요");
    }
});

$(".button-login").click(() => {
    console.log("왜 안돼 아");
});
