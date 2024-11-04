import { Word, Byte, getWordFromBytes, getBytesFromWord } from "./lib";

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
    instructionRegister: Word;
    flagsRegister: FlagsRegister;
    generalRegisters: Record<Register, Word>;
    stackPointer: Word;
    baseRegister: Word;

    // possibly different from real cpus
    registerOperand: Register;
    dataOperand: Word;
    nextProgramCounter: Word;

    constructor(public memory: Byte[]) {
        this.programCounter = 0;
        this.flagsRegister = {
            sign: false,
            zero: false,
            carry: false,
            overflow: false,
            interrupt: false,
            supervisor: false,
        };
        this.generalRegisters = {
            [Register.R0]: 0x0000,
            [Register.R1]: 0x0000,
            [Register.R2]: 0x0000,
            [Register.R3]: 0x0000,
            [Register.R4]: 0x0000,
            [Register.R5]: 0x0000,
            [Register.R6]: 0x0000,
            [Register.R7]: 0x0000,
            [Register.END]: 0x0000, // unused
        };
        this.stackPointer = memory.length - 1;
        this.baseRegister = 0;
    }

    handleInstruction() {
        this.fetch();
        this.decodeExecuteWriteback();
        this.updateProgramCounter();
    }

    /*
     * 메모리 읽기 및 쓰기는 무조건 mar, mbr을 거쳐 진행하도록 만들었습니다.
     */

    loadByte(address: Word) {
        this.memoryAddressRegister = address;
        this.memoryBufferRegister = this.memory[this.memoryAddressRegister];
    }

    storeByte(address: Word, value: Byte) {
        this.memoryAddressRegister = address;
        this.memoryBufferRegister = value;
        this.memory[this.memoryAddressRegister] = this.memoryBufferRegister;
    }

    loadWord(address: Word) {
        this.memoryAddressRegister = address;
        this.memoryBufferRegister = getWordFromBytes(
            this.memory[this.memoryAddressRegister],
            this.memory[this.memoryAddressRegister + 1]
        );
    }

    storeWord(address: Word, value: Word) {
        this.memoryAddressRegister = address;
        this.memoryBufferRegister = value;
        const [byte0, byte1] = getBytesFromWord(this.memoryBufferRegister);
        this.memory[this.memoryAddressRegister] = byte0;
        this.memory[this.memoryAddressRegister + 1] = byte1;
    }

    fetch() {
        this.loadByte(this.programCounter);
        this.instructionRegister = this.memoryBufferRegister;
        this.loadByte(this.programCounter + 1);
        this.registerOperand = this.memoryBufferRegister;
        this.loadWord(this.programCounter + 2);
        this.dataOperand = this.memoryBufferRegister;
        this.nextProgramCounter = this.programCounter + 4;
    }

    decodeExecuteWriteback() {
        switch (this.instructionRegister) {
            case Opcode.NOP: {
                return;
            }
            case Opcode.LOAD_IMMEDIATE: {
                // write-back
                this.generalRegisters[this.registerOperand] = this.dataOperand;
                return;
            }
            case Opcode.LOAD_DIRECT: {
                // memory
                this.loadWord(this.dataOperand);
                // write-back
                this.generalRegisters[this.registerOperand] =
                    this.memoryBufferRegister;
                return;
            }
            case Opcode.STORE_DIRECT: {
                // memory
                this.storeWord(
                    this.dataOperand,
                    this.generalRegisters[this.registerOperand]
                );
                return;
            }
            case Opcode.MOV: {
                return;
            }
            case Opcode.ADD: {
                return;
            }
            case Opcode.SUB: {
                return;
            }
            case Opcode.MUL: {
                return;
            }
            case Opcode.JMP: {
                return;
            }
            case Opcode.JNZ: {
                return;
            }
            case Opcode.END: {
                return;
            }
        }
    }

    updateProgramCounter() {
        this.programCounter = this.nextProgramCounter;
    }
}
