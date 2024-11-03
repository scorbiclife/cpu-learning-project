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

    // possibly different from real cpus
    nextProgramCounter: Word;

    constructor(public memory: Byte[]) {
        this.programCounter = 0;
        this.stackPointer = memory.length - 1;
        this.basePointer = memory.length - 1;
    }

    handleClock() {
        this.fetch();
        this.decode(this.instructionRegister);
        this.execute();
        this.updateProgramCounter();
    }

    fetchByte(address: number) {
        this.memoryAddressRegister = address;
        this.memoryBufferRegister = this.memory[this.memoryAddressRegister];
    }

    fetchWord(address: number) {
        this.memoryAddressRegister = address;
        this.memoryBufferRegister =
            this.memory[this.memoryAddressRegister] +
            this.memory[this.memoryAddressRegister + 1] * 256;
    }

    fetch() {
        this.fetchByte(this.programCounter);
        this.instructionRegister = this.memoryBufferRegister;
    }

    decode(operation: Operation) {
        switch (operation) {
            case Operation.NOP: {
                this.nextProgramCounter = this.programCounter + 1;
                break;
            }
            case Operation.LOAD: {
                this.nextProgramCounter = this.programCounter + 5;
                break;
            }
            case Operation.STORE: {
                this.nextProgramCounter = this.programCounter + 5;
                break;
            }
            case Operation.MOV: {
                this.nextProgramCounter = this.programCounter + 3;
                break;
            }
            case Operation.ADD: {
                this.nextProgramCounter = this.programCounter + 3;
                break;
            }
            case Operation.SUB: {
                this.nextProgramCounter = this.programCounter + 3;
                break;
            }
            case Operation.MUL: {
                this.nextProgramCounter = this.programCounter + 3;
                break;
            }
            case Operation.JMP: {
                this.nextProgramCounter = this.programCounter + 3;
                break;
            }
            case Operation.JNZ: {
                this.nextProgramCounter = this.programCounter + 3;
                break;
            }
            case Operation.END: {
                this.nextProgramCounter = this.programCounter + 1;
                break;
            }
        }
    }

    execute() {
        // TODO
    }

    updateProgramCounter() {
        this.programCounter = this.nextProgramCounter;
    }
}
