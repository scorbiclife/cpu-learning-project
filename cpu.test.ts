import { test, expect, describe } from "@jest/globals";
import { Cpu, Opcode, Register } from "./cpu";
import { Byte, loadWordAtAddress, Word, storeWordAtAddress } from "./lib";

const { R0, R1, R2 } = Register;
const {
    LOAD_IMMEDIATE_1,
    LOAD_IMMEDIATE_2,
    LOAD_DIRECT,
    STORE_DIRECT,
    LOAD_INDIRECT,
    STORE_INDIRECT,
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

function loadProgram(memory: Byte[], program: Byte[], startAddress: Word = 0) {
    program.forEach((byte, i) => (memory[startAddress + i] = byte));
}

function runProgram(cpu: Cpu, program: Byte[]) {
    while (cpu.programCounter < program.length) {
        cpu.handleInstruction();
    }
}

test("direct memory addressing", () => {
    const memory: Byte[] = Array(65536).fill(0x00);
    memory[256] = 0x01;
    memory[257] = 0x23;
    memory[258] = 0x45;
    memory[259] = 0x67;
    // prettier-ignore
    const program: Byte[] = [
        LOAD_DIRECT, R1, 0x00, 0x01, // Address 256
        LOAD_IMMEDIATE_1, R2, 0x02, 0x03, // sets the lower two bytes
        LOAD_IMMEDIATE_2, R2, 0x04, 0x05, // sets the higher two bytes
        STORE_DIRECT, R2, 0x00, 0x01, // Address 256
        STORE_DIRECT, R1, 0x04, 0x01, // Address 260
    ];
    loadProgram(memory, program);

    const cpu = new Cpu(memory);
    runProgram(cpu, program);

    expect(memory[256]).toBe(0x02);
    expect(memory[257]).toBe(0x03);
    expect(memory[258]).toBe(0x04);
    expect(memory[259]).toBe(0x05);

    expect(memory[260]).toBe(0x01);
    expect(memory[261]).toBe(0x23);
    expect(memory[262]).toBe(0x45);
    expect(memory[263]).toBe(0x67);
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

        const cpu = new Cpu(memory);
        runProgram(cpu, program);

        const result = loadWordAtAddress(memory, 0x0200);
        expect(result).toEqual(0x04030201);
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

        const cpu = new Cpu(memory);
        runProgram(cpu, program);

        const result = loadWordAtAddress(memory, 0x76543210);
        expect(result).toEqual(0x04030201);
    });
});
