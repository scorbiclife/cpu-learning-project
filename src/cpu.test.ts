import { test, expect, describe } from "@jest/globals";
import { Cpu, Opcode, Register } from "./cpu";
import {
    Byte,
    loadWordAtAddress,
    storeWordAtAddress,
    Word,
    storeBytesAtAddress,
} from "./lib";

const { R0, R1, R2 } = Register;
const {
    HALT,
    LOAD_IMMEDIATE_1,
    LOAD_IMMEDIATE_2,
    LOAD_DIRECT,
    STORE_DIRECT,
    LOAD_INDIRECT,
    STORE_INDIRECT,
    MOV,
    NOP,
    ADD,
} = Opcode;

function createLargeZeroMemory(): Byte[] {
    return new Proxy([], {
        get(target, property, receiver) {
            return Reflect.get(target, property, receiver) ?? 0x00;
        },
    });
}

function loadProgram(memory: Byte[], program: Byte[]) {
    storeBytesAtAddress(memory, 0x00, program);
}

function runProgram(memory: Byte[], programStart: Word = 0) {
    const cpu = new Cpu(memory);
    cpu.programCounter = programStart;
    while (memory[cpu.programCounter] !== HALT) {
        cpu.handleInstruction();
    }
}

describe("direct memory addressing", () => {
    test("write", () => {
        const memory: Byte[] = Array(65536).fill(0x00);
        storeWordAtAddress(memory, 256, 0x67452301);
        // prettier-ignore
        const program: Byte[] = [
            LOAD_IMMEDIATE_1, R1, 0x02, 0x03, // sets the lower two bytes
            LOAD_IMMEDIATE_2, R1, 0x04, 0x05, // sets the higher two bytes
            STORE_DIRECT, R1, 0x00, 0x01, // Address 256
            HALT, 0x00, 0x00, 0x00
        ];
        loadProgram(memory, program);
        runProgram(memory);

        // system is little-endian
        expect(loadWordAtAddress(memory, 256)).toBe(0x05040302);
    });

    test("read", () => {
        const memory: Byte[] = Array(65536).fill(0x00);
        storeWordAtAddress(memory, 256, 0x67452301);
        // prettier-ignore
        const program: Byte[] = [
            LOAD_DIRECT, R1, 0x00, 0x01, // Address 256
            STORE_DIRECT, R1, 0x04, 0x01, // Address 260
        ];
        loadProgram(memory, program);
        runProgram(memory);
        expect(loadWordAtAddress(memory, 256)).toBe(0x67452301);
        expect(loadWordAtAddress(memory, 260)).toBe(0x67452301);
    });
});

describe("indirect memory addressing", () => {
    test("load indirect", () => {
        const memory = createLargeZeroMemory();
        storeWordAtAddress(memory, 0x100, 0x76543210);
        storeWordAtAddress(memory, 0x76543210, 0x04030201);
        // prettier-ignore
        const program = [
            LOAD_INDIRECT, R0, 0x00, 0x01,
            STORE_DIRECT, R0, 0x00, 0x02, // address 0x200
        ];
        loadProgram(memory, program);
        runProgram(memory);
        expect(loadWordAtAddress(memory, 0x0200)).toEqual(0x04030201);
    });

    test("store indirect", () => {
        const memory = createLargeZeroMemory();
        storeWordAtAddress(memory, 0x0100, 0x76543210);
        storeWordAtAddress(memory, 0x0200, 0x04030201);
        // prettier-ignore
        const program = [
            LOAD_DIRECT, R0, 0x00, 0x02,
            STORE_INDIRECT, R0, 0x00, 0x01, // 0x0100
        ];
        loadProgram(memory, program);
        runProgram(memory);
        expect(loadWordAtAddress(memory, 0x76543210)).toEqual(0x04030201);
    });
});

describe("mov instruction", () => {
    test("mov from one register to another", () => {
        const memory = createLargeZeroMemory();
        // prettier-ignore
        const program = [
            LOAD_IMMEDIATE_1, R0, 0x01, 0x02,
            LOAD_IMMEDIATE_2, R0, 0x03, 0x04,
            MOV, R1, R0, 0x00,
            STORE_DIRECT, R1, 0x00, 0x01,
        ];

        loadProgram(memory, program);
        runProgram(memory);
        expect(loadWordAtAddress(memory, 0x0100)).toEqual(0x04030201);
    });
});

describe("add instruction", () => {
    test("add should add the contents from one register to another", () => {
        const program = [
            LOAD_IMMEDIATE_1, R0, 0x01, 0x02,
            LOAD_IMMEDIATE_2, R0, 0x03, 0x04,
            LOAD_IMMEDIATE_1, R1, 0x01, 0x01,
            LOAD_IMMEDIATE_2, R1, 0x01, 0x01,
            ADD, R1, R0, 0x00,
            STORE_DIRECT, R1, 0x00, 0x01,
            HALT, 0x00, 0x00, 0x00,
        ];
        const memory = createLargeZeroMemory();
        loadProgram(memory, program);
        runProgram(memory);
        expect(loadWordAtAddress(memory, 0x0100)).toEqual(0x05040302);
    });
});
