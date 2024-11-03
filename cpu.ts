import { Word, Byte, getWordFromBytes } from "./lib";

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
    END,
}

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

function getInstructionLength(opcode: Opcode) {
    return (
        OPCODE_SIZE +
        INSTRUCTION_OPERAND_SIZES[opcode].reduce((a, b) => a + b, 0)
    );
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
        this.memoryBufferRegister = getWordFromBytes(
            this.memory[this.memoryAddressRegister],
            this.memory[this.memoryAddressRegister + 1]
        );
    }

    fetch() {
        this.fetchByte(this.programCounter);
        this.instructionRegister = this.memoryBufferRegister;
    }

    decode(operation: Opcode) {
        this.nextProgramCounter =
            this.programCounter + getInstructionLength(operation);
        switch (operation) {
            case Opcode.NOP: {
                break;
            }
            case Opcode.LOAD: {
                break;
            }
            case Opcode.STORE: {
                break;
            }
            case Opcode.MOV: {
                break;
            }
            case Opcode.ADD: {
                break;
            }
            case Opcode.SUB: {
                break;
            }
            case Opcode.MUL: {
                break;
            }
            case Opcode.JMP: {
                break;
            }
            case Opcode.JNZ: {
                break;
            }
            case Opcode.END: {
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
