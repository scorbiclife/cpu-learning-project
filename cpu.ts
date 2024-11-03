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
    LOAD_IMMEDIATE,
    STORE_IMMEDIATE,
    LOAD_DIRECT,
    STORE_DIRECT,
    MOV,
    ADD,
    SUB,
    MUL,
    JMP,
    JNZ,
    END,
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
    memoryBufferRegister2: Word;
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

    handleInstruction() {
        this.fetch();
        this.decodeExecuteWriteback();
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

    fetchDoubleWord(address: number) {
        this.fetchWord(address);
        this.memoryBufferRegister2 = getWordFromBytes(
            this.memory[this.memoryAddressRegister + 2],
            this.memory[this.memoryAddressRegister + 3]
        )
    }

    fetch() {
        this.fetchByte(this.programCounter);
        this.instructionRegister = this.memoryBufferRegister;
        this.nextProgramCounter = this.programCounter + 4;
    }

    decodeExecuteWriteback() {
        switch (this.instructionRegister) {
            case Opcode.NOP: {
                return;
            }
            case Opcode.LOAD_IMMEDIATE: {
                // decode
            }
            case Opcode.STORE_IMMEDIATE: {
                break;
            }
            case Opcode.LOAD_DIRECT: {
                break;
            }
            case Opcode.STORE_DIRECT: {
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

    updateProgramCounter() {
        this.programCounter = this.nextProgramCounter;
    }
}
