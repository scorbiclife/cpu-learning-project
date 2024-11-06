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
        this.cu.fetchAndDecode();
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

    fetchAndDecode() {
        this.loadByte(this.programCounter + OPCODE_OFFSET);
        this.instructionRegister = this.memoryBufferRegister;
        this.loadByte(this.programCounter + REGISTER_OPERAND_OFFSET);
        const registerOperandSignal = this.memoryBufferRegister;
        this.loadWord(this.programCounter + DATA_OPERAND_OFFSET);
        const dataOperandSignal = this.memoryBufferRegister;

        this.cpu.alu.inputOpcode = this.instructionRegister;
        this.cpu.alu.inputRegisterName = registerOperandSignal;
        this.cpu.alu.inputData= dataOperandSignal;
        this.programCounter += INSTRUCTION_LENGTH;
    }
}

export class CpuArithmeticLogicUnit {
    private cpu: Cpu;

    inputOpcode: Byte;
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
            case Opcode.LOAD_IMMEDIATE: {
                // write-back
                this.targetRegister = this.inputData;
                return;
            }
            case Opcode.LOAD_DIRECT: {
                // memory
                this.cpu.cu.loadWord(this.inputData);
                // write-back
                this.targetRegister = this.cpu.cu.memoryBufferRegister;
                return;
            }
            case Opcode.STORE_DIRECT: {
                // memory
                this.cpu.cu.storeWord(this.inputData, this.targetRegister);
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
