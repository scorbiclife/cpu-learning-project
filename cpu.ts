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

export enum Opcode {
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

const INSTRUCTION_OPERAND_SIZES: Record<Opcode, number[]> = {
    [Opcode.NOP]: [],
    [Opcode.LOAD]: [1, 1, 2],
    [Opcode.STORE]: [1, 1, 2],
    [Opcode.MOV]: [1, 1],
    [Opcode.ADD]: [1, 1],
    [Opcode.SUB]: [1, 1],
    [Opcode.MUL]: [1, 1],
    [Opcode.JMP]: [2],
    [Opcode.JNZ]: [2],
    [Opcode.END]: [], // unused
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

    decode(operation: Opcode) {
        switch (operation) {
            case Opcode.NOP: {
                this.nextProgramCounter = this.programCounter + 1;
                break;
            }
            case Opcode.LOAD: {
                this.nextProgramCounter = this.programCounter + 5;
                break;
            }
            case Opcode.STORE: {
                this.nextProgramCounter = this.programCounter + 5;
                break;
            }
            case Opcode.MOV: {
                this.nextProgramCounter = this.programCounter + 3;
                break;
            }
            case Opcode.ADD: {
                this.nextProgramCounter = this.programCounter + 3;
                break;
            }
            case Opcode.SUB: {
                this.nextProgramCounter = this.programCounter + 3;
                break;
            }
            case Opcode.MUL: {
                this.nextProgramCounter = this.programCounter + 3;
                break;
            }
            case Opcode.JMP: {
                this.nextProgramCounter = this.programCounter + 3;
                break;
            }
            case Opcode.JNZ: {
                this.nextProgramCounter = this.programCounter + 3;
                break;
            }
            case Opcode.END: {
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
