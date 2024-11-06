import {
    Word,
    Byte,
    loadWordAtAddress,
    storeWordAtAddress,
} from "./lib";

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

function defaultRegisters(): Record<Register, Word> {
    return {
        [Register.R0]: 0x0000,
        [Register.R1]: 0x0000,
        [Register.R2]: 0x0000,
        [Register.R3]: 0x0000,
        [Register.R4]: 0x0000,
        [Register.R5]: 0x0000,
        [Register.R6]: 0x0000,
        [Register.R7]: 0x0000,
        [Register.END]: 0x0000,
    };
}

export enum Opcode {
    START,
    NOP = START,
    LOAD_IMMEDIATE_1,
    LOAD_IMMEDIATE_2,
    LOAD_DIRECT,
    STORE_DIRECT,
    LOAD_INDIRECT,
    STORE_INDIRECT,
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

function defaultFlagsRegister(): FlagsRegister {
    return {
        sign: false,
        zero: false,
        carry: false,
        overflow: false,
        interrupt: false,
        supervisor: false,
    };
}

export class Cpu {
    cu: CpuControlUnit;

    get programCounter(): Word {
        return this.cu.programCounter;
    }

    get memoryAddressRegister(): Word {
        return this.cu.memoryAddressRegister;
    }

    get memoryBufferRegister(): Word {
        return this.cu.memoryBufferRegister;
    }

    get instructionRegister(): Word {
        return this.cu.instructionRegister;
    }

    alu: CpuArithmeticLogicUnit;

    generalRegisters: Record<Register, Word>;

    stackPointer: Word;
    baseRegister: Word;

    constructor(public memory: Byte[]) {
        this.cu = new CpuControlUnit(this, 0x0000);
        this.alu = new CpuArithmeticLogicUnit(this);
        this.generalRegisters = defaultRegisters();
        this.stackPointer = memory.length - 1;
        this.baseRegister = 0;
    }

    handleInstruction() {
        this.cu.fetch();
        this.cu.decode();
        this.alu.execute();
    }
}

const OPCODE_OFFSET = 0;
const REGISTER_OPERAND_OFFSET = 1;
const DATA_OPERAND_OFFSET = 2;
const INSTRUCTION_LENGTH = 4;

/**
 * 참고 자료: https://esyeonge.tistory.com/28
 */
export class CpuControlUnit {
    programCounter: Word;
    memoryAddressRegister: Word;
    memoryBufferRegister: Word;
    instructionRegister: Word;

    registerOperandSignal: Byte;
    dataOperandSignal: Word;

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
        this.memoryBufferRegister = loadWordAtAddress(
            this.cpu.memory,
            this.memoryAddressRegister
        );
    }

    storeWord(address: Word, value: Word) {
        this.memoryAddressRegister = address;
        this.memoryBufferRegister = value;
        storeWordAtAddress(
            this.cpu.memory,
            this.memoryAddressRegister,
            this.memoryBufferRegister
        );
    }

    fetch() {
        this.loadWord(this.programCounter + OPCODE_OFFSET);
        this.instructionRegister = this.memoryBufferRegister;
        this.programCounter += INSTRUCTION_LENGTH;
    }

    decode() {
        this.cpu.alu.inputOpcode = this.instructionRegister & 0xff;
        this.cpu.alu.inputRegisterName = (this.instructionRegister >> 8) & 0xff;
        this.cpu.alu.inputData = this.instructionRegister >> 16;
    }
}

export class CpuArithmeticLogicUnit {
    private cpu: Cpu;

    inputOpcode: Opcode;
    inputRegisterName: Byte;
    inputData: Word;

    constructor(cpu: Cpu) {
        this.cpu = cpu;
    }

    get targetRegister() {
        return this.cpu.generalRegisters[this.inputRegisterName];
    }

    set targetRegister(value: Word) {
        this.cpu.generalRegisters[this.inputRegisterName] = value;
    }

    execute() {
        switch (this.inputOpcode) {
            case Opcode.NOP: {
                return;
            }
            case Opcode.LOAD_IMMEDIATE_1: {
                // write-back
                this.targetRegister =
                    (this.targetRegister & 0xffff0000) | this.inputData;
                return;
            }
            case Opcode.LOAD_IMMEDIATE_2: {
                // write-back
                this.targetRegister =
                    (this.targetRegister & 0x0000ffff) | (this.inputData << 16);
                return;
            }
            case Opcode.LOAD_DIRECT: {
                // memory
                this.cpu.cu.loadWord(this.inputData);
                // write-back
                this.targetRegister = this.cpu.memoryBufferRegister;
                return;
            }
            case Opcode.STORE_DIRECT: {
                // memory
                this.cpu.cu.storeWord(this.inputData, this.targetRegister);
                return;
            }
            case Opcode.LOAD_INDIRECT: {
                this.cpu.cu.loadWord(this.inputData);
                this.cpu.cu.loadWord(this.cpu.memoryBufferRegister);
                this.targetRegister = this.cpu.memoryBufferRegister;
                return;
            }
            case Opcode.STORE_INDIRECT: {
                this.cpu.cu.loadWord(this.inputData);
                this.cpu.cu.storeWord(
                    this.cpu.memoryBufferRegister,
                    this.targetRegister
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
