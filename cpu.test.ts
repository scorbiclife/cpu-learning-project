import { test, expect } from "@jest/globals";
import { Cpu, Opcode, Register } from "./cpu";
import { Byte, Word } from "./lib";

const { R1, R2 } = Register;
const { LOAD_DIRECT, LOAD_IMMEDIATE, STORE_DIRECT, NOP, ADD } = Opcode;

test("can fetch instructions of opcode + register + 2 byte data", () => {
    const memory: Byte[] = Array(65536).fill(0x00);
    // prettier-ignore
    const program: Byte[] = [
        LOAD_DIRECT, R1, 0x00, 0x01,
        LOAD_IMMEDIATE, R2, 0x02, 0x00,
        NOP, 0x00, 0x00, 0x00,
        ADD, R1, R2, 0x00,
        STORE_DIRECT, R1, 0x00, 0x01,
    ];
    program.forEach((byte, i) => memory[i] = byte);
    const cpu = new Cpu(memory);
    const instructions: Word[] = [];
    while (cpu.programCounter < program.length) {
        cpu.handleInstruction();
        instructions.push(cpu.instructionRegister);
    }
    expect(instructions).toEqual([
        LOAD_DIRECT,
        LOAD_IMMEDIATE,
        NOP,
        ADD,
        STORE_DIRECT,
    ]);
});

test("can load and store", () => {
    const memory: Byte[] = Array(65536).fill(0x00);
    memory[256] = 0x00;
    memory[257] = 0x10;
    // prettier-ignore
    const program: Byte[] = [
        LOAD_DIRECT, R1, 0x00, 0x01, // Offset 256
        LOAD_IMMEDIATE, R2, 0x02, 0x00,
        STORE_DIRECT, R1, 0x02, 0x01,
        STORE_DIRECT, R2, 0x00, 0x01,
    ];
    program.forEach((byte, i) => memory[i] = byte);
    const cpu = new Cpu(memory);
    while (cpu.programCounter < program.length) {
        cpu.handleInstruction();
    }
    expect(memory[256]).toBe(0x02);
    expect(memory[257]).toBe(0x00);
    expect(memory[258]).toBe(0x00);
    expect(memory[259]).toBe(0x10);
});
