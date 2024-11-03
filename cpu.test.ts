import { test, expect } from "@jest/globals";
import { Cpu, Opcode, Register } from "./cpu";
import { Byte, Word } from "./lib";

const { R1, R2 } = Register;
const { LOAD_DIRECT, LOAD_IMMEDIATE, STORE_DIRECT, NOP, ADD } = Opcode;

test("can fetch instructions with variable length", () => {
    // prettier-ignore
    const program: Byte[] = [
        LOAD_DIRECT, R1, 0x00, 0x01,
        LOAD_IMMEDIATE, R2, 0x00, 0x02,
        NOP,
        ADD, R1, R2,
        STORE_DIRECT, R1, 0x00, 0x01,
    ];
    const stack = Array(1024).fill(0x00);
    const memory = ([] as Byte[]).concat(program, stack);
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
