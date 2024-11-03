import { test, expect } from "@jest/globals";
import { AddressingMode, Byte, Cpu, Operation, Register, Word } from "./cpu";

const { R1, R2 } = Register;
const { LOAD, STORE, NOP, ADD } = Operation;
const { IMMEDIATE } = AddressingMode;

test("can fetch instructions with variable length", () => {
    // prettier-ignore
    const program: Byte[] = [
        LOAD, R1, IMMEDIATE, 0x00, 0x01,
        LOAD, R2, IMMEDIATE, 0x00, 0x02,
        NOP,
        ADD, R1, R2,
        STORE, R1, IMMEDIATE, 0x00, 0x01,
    ];
    const stack: Byte[] = [];
    const cpu = new Cpu(program, stack);
    const instructions: Word[] = [];
    while (cpu.programCounter < program.length) {
        cpu.handleClock();
        instructions.push(cpu.instructionRegister);
    }
    expect(instructions).toEqual([LOAD, LOAD, NOP, ADD, STORE])
})