# "개발자를 위한 컴퓨터공학 1 - 혼자 공부하는 컴퓨터구조 + 운영체제" CPU 실습

- [강의](https://www.inflearn.com/course/%ED%98%BC%EC%9E%90-%EA%B3%B5%EB%B6%80%ED%95%98%EB%8A%94-%EC%BB%B4%ED%93%A8%ED%84%B0%EA%B5%AC%EC%A1%B0-%EC%9A%B4%EC%98%81%EC%B2%B4%EC%A0%9C/dashboard)

- [개발 일지](https://www.inflearn.com/blogs/9185)

- 구조
    - `src` 폴더에서 확인할 수 있습니다.
        - 테스트 파일은 소스 파일과 같은 디렉터리 내에 두었으며,
          빠른 파악을 위해서라면 테스트 코드에서 가상 cpu의 명령어 코드의 예시들을 확인하는 것을 권장드립니다.

- 디자인 결정들

    - 32비트의 고정된 길이의 명령어, 1비트 opcode, 1bit register operand, 2bit data operand
        - 초기에 가변 길이 명령어를 사용하였으나, fetch, decode, execute 각 단계마다 명령어 종류에 
          따라 switch문을 실행하는 것이 번거로울 것 같아 고정된 길이를 사용하였습니다.
        - 가변 길이 명령어를 사용하는 일부 CISC CPU들이 마이크로코드를 사용한다는 것을 확인하였기 때문에,
          실제 CPU의 작동 방식과 점점 멀어지고 자료 조사 과정에서 학습의 어려움이 있었습니다.

    - ~~32비트 워드, 16비트 주소공간~~ 아래에 수정
        - 기존에 16비트 워드, 16비트 주소공간, 32비트 길이 명령어를 만들었습니다.
          그런데 fetch 한 번을 위해 메모리에 여러 번 접근하는 것이 아쉬웠습니다.
        - 명령어 크기를 32비트로 만들 경우 Immediate addressing mode에서 사용할 수 있는 값이 16비트로
          한정되어 있다는 것이 새로운 고려 대상이었습니다.
          그래서 기존의 LOAD_IMMEDIATE 명령어를 LOAD_IMMEDIATE_1, LOAD_IMMEDIATE_2로 바꾸어 각각
          {least, most} significant 16비트를 세팅할 수 있도록 하였습니다.
        - fetch, decode, execute을 분리하여 구현하기 더 편해졌습니다.
        - 참고 자료
            - [ARM](https://developer.arm.com/documentation/dui0473/m/writing-arm-assembly-language/load-immediate-values)
    
    - 32비트 워드, 32비트 주소공간
        - 기존의 16비트 주소공간을 indirect addressing을 통해 32비트 주소공간을 사용할 수 있도록 수정하였습니다.

- 소스코드의 모듈화에 관하여
    - `Cpu` 클래스 하나에 담고 싶었으나, 내용이 너무 많아 다른 클래스들에 일부분을 떼어냈습니다.
    - 'CPU의 구성요소와 instruction cycle 살펴보기'와 '코드를 읽기 편하게 모듈화하기'의 두 가지를 신경썼지만,
      결론적으로 둘 다 약간 아쉽게 된 것 같습니다.
