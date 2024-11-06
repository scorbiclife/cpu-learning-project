# "개발자를 위한 컴퓨터공학 1 - 혼자 공부하는 컴퓨터구조 + 운영체제" CPU 실습

- [강의](https://www.inflearn.com/course/%ED%98%BC%EC%9E%90-%EA%B3%B5%EB%B6%80%ED%95%98%EB%8A%94-%EC%BB%B4%ED%93%A8%ED%84%B0%EA%B5%AC%EC%A1%B0-%EC%9A%B4%EC%98%81%EC%B2%B4%EC%A0%9C/dashboard)

- [개발 일지](https://www.inflearn.com/blogs/9185)

- 디자인 결정들

    - 32비트의 고정된 길이의 명령어, 1비트 opcode, 1bit register operand, 2bit data operand
        - 초기에 가변 길이 명령어를 사용하였으나, fetch, decode, execute 각 단계마다 명령어 종류에 
          따라 switch문을 실행하는 것이 번거로울 것 같아 고정된 길이를 사용하였습니다.
        - 가변 길이 명령어를 사용하는 CPU들이 마이크로코드를 사용한다는 것을 확인하였기 때문에,
          실제 CPU의 작동 방식과 점점 멀어지고 자료 조사 시 어려울 것 같았습니다.

    - 32비트 워드, 16비트 주소공간
        - 기존에 16비트 워드, 16비트 주소공간, 32비트 길이 명령어를 만들었습니다.
          그런데 fetch 한 번을 위해 메모리에 여러 번 접근하는 것이 아쉬웠습니다.
        - 워드 크기를 32비트로 만들 경우 Immediate addressing mode에서 사용할 수 있는 값이 16비트로
          한정되어 있다는 것이 새로운 고려 대상입니다.
          그래서 기존의 LOAD_IMMEDIATE 명령어를 LOAD_IMMEDIATE_1, LOAD_IMMEDIATE_2로 바꾸어 각각
          {least, most} significant 16비트를 세팅할 수 있도록 하였습니다.
