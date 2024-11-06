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

/**
 * 참고 자료: https://esyeonge.tistory.com/28
 */
export class CpuControlUnit {
    programCounter: Word;
    memoryAddressRegister: Word;
    memoryBufferRegister: Word;
    instructionRegister: Word;

    registerOperand: Byte;
    dataOperand: Word;

    constructor(private cpu: Cpu, programCounter: Word) {
        this.programCounter = programCounter;
    }

    loadByte(address: Word) {
        this.memoryAddressRegister = address;
        this.memoryBufferRegister = this.cpu.memory[this.memoryAddressRegister];
    }

    storeByte(address: Word, value: Byte) {
        this.memoryAddressRegister = address;
        this.memoryBufferRegister = value;
        this.cpu.memory[this.memoryAddressRegister] = this.memoryBufferRegister;
    }

    loadWord(address: Word) {
        this.memoryAddressRegister = address;
        this.memoryBufferRegister = getWordFromBytes(
            this.cpu.memory[this.memoryAddressRegister],
            this.cpu.memory[this.memoryAddressRegister + 1]
        );
    }

    storeWord(address: Word, value: Word) {
        this.memoryAddressRegister = address;
        this.memoryBufferRegister = value;
        const [byte0, byte1] = getBytesFromWord(this.memoryBufferRegister);
        this.cpu.memory[this.memoryAddressRegister] = byte0;
        this.cpu.memory[this.memoryAddressRegister + 1] = byte1;
    }

    fetch() {
        this.loadByte(this.programCounter);
        this.instructionRegister = this.memoryBufferRegister;
        this.loadByte(this.programCounter + 1);
        this.registerOperand = this.memoryBufferRegister;
        this.loadWord(this.programCounter + 2);
        this.dataOperand = this.memoryBufferRegister;
        this.programCounter += 4;
    }

}

export class Cpu {
    controlUnit: CpuControlUnit;

    get programCounter(): Word {
        return this.controlUnit.programCounter;
    }

    get memoryAddressRegister(): Word {
        return this.controlUnit.memoryAddressRegister;
    }

    get memoryBufferRegister(): Word {
        return this.controlUnit.memoryBufferRegister;
    }

    get instructionRegister(): Word {
        return this.controlUnit.instructionRegister;
    }

    flagsRegister: FlagsRegister;
    generalRegisters: Record<Register, Word>;
    stackPointer: Word;
    baseRegister: Word;

    constructor(public memory: Byte[]) {
        this.controlUnit = new CpuControlUnit(this, 0x0000);
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
        this.controlUnit.fetch();
        this.decodeExecuteWriteback();
    }

    decodeExecuteWriteback() {
        switch (this.controlUnit.instructionRegister) {
            case Opcode.NOP: {
                return;
            }
            case Opcode.LOAD_IMMEDIATE: {
                // write-back
                this.generalRegisters[this.controlUnit.registerOperand] =
                    this.controlUnit.dataOperand;
                return;
            }
            case Opcode.LOAD_DIRECT: {
                // memory
                this.controlUnit.loadWord(this.controlUnit.dataOperand);
                // write-back
                this.generalRegisters[this.controlUnit.registerOperand] =
                    this.controlUnit.memoryBufferRegister;
                return;
            }
            case Opcode.STORE_DIRECT: {
                // memory
                this.controlUnit.storeWord(
                    this.controlUnit.dataOperand,
                    this.generalRegisters[this.controlUnit.registerOperand]
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
}
