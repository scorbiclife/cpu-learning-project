import { test, expect } from "@jest/globals";
import { Cpu, Opcode, Register } from "./cpu";
import { Byte, getWordFromBytes, Word } from "./lib";

const { R1, R2 } = Register;
const { LOAD_DIRECT, LOAD_IMMEDIATE_1, LOAD_IMMEDIATE_2, STORE_DIRECT, NOP, ADD } = Opcode;

test("can load and store", () => {
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
    program.forEach((byte, i) => memory[i] = byte);

    const cpu = new Cpu(memory);
    while (cpu.programCounter < program.length) {
        cpu.handleInstruction();
    }

    expect(memory[256]).toBe(0x02);
    expect(memory[257]).toBe(0x03);
    expect(memory[258]).toBe(0x04);
    expect(memory[259]).toBe(0x05);

    expect(memory[260]).toBe(0x01);
    expect(memory[261]).toBe(0x23);
    expect(memory[262]).toBe(0x45);
    expect(memory[263]).toBe(0x67);
});
