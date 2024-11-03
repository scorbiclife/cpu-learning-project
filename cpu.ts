export enum Register {
    START,
    R0 = START,
    R1,
    R2,
    R3,
    R4,
    R5,
    R6,
    R7,
    END,
}

export enum Operation {
    START,
    NOP = START,
    LOAD,
    STORE,
    MOV,
    ADD,
    SUB,
    MUL,
    JMP,
    JNZ,
    END,
}

export enum AddressingMode {
    START,
    IMMEDIATE = START,
    DIRECT,
    INDIRECT,
    STACK,
    BASE,
    END
}

export type Byte = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type Word = number; // 2 bytes

const OPCODE_SIZE = 1;

const INSTRUCTION_OPERAND_SIZES: Record<Operation, number[]> = {
    [Operation.NOP]: [],
    [Operation.LOAD]: [1, 1, 2],
    [Operation.STORE]: [1, 1, 2],
    [Operation.MOV]: [1, 1],
    [Operation.ADD]: [1, 1],
    [Operation.SUB]: [1, 1],
    [Operation.MUL]: [1, 1],
    [Operation.JMP]: [2],
    [Operation.JNZ]: [2],
    [Operation.END]: [], // unused
};

const INSTRUCTION_LENGTH = {} as Record<Operation, number>;
for (let ins = Operation.START; ins != Operation.END; ++ins) {
    INSTRUCTION_LENGTH[ins] =
        INSTRUCTION_OPERAND_SIZES[ins].reduce((a, b) => a + b, 0) + OPCODE_SIZE;
}

type FlagsRegister = {
    sign: boolean;
    zero: boolean;
    // carry vs overflow: https://stackoverflow.com/questions/69124873/understanding-the-difference-between-overflow-and-carry-flags
    carry: boolean;
    overflow: boolean;
    interrupt: boolean;
    supervisor: boolean;
};

export class Cpu {
    programCounter: Word;
    memoryAddressRegister: Word;
    memoryBufferRegister: Word;
    instructionRegister: Word;
    flagsResister: FlagsRegister;
    generalRegisters: Record<Register, Word>;
    stackPointer: Word;
    basePointer: Word;

    constructor(public program: Byte[], public stack: Byte[]) {
        this.programCounter = 0;
        this.stackPointer = 0;
        this.basePointer = 0;
    }

    handleClock() {
        this.fetch();
        this.decode();
        this.execute();
    }

    fetch() {
        this.memoryAddressRegister = this.programCounter;
        this.memoryBufferRegister = this.program[this.memoryAddressRegister];
    }

    decode() {
        this.instructionRegister = this.memoryBufferRegister;
        this.programCounter += INSTRUCTION_LENGTH[this.instructionRegister];
    }

    execute() {
        // TODO
    }
}
