export type Byte = number;
export type Word = number; // 4 bytes

/**
 * Bytes are in little-endian order
 */
export function getWordFromBytes(
    byte0: Byte,
    byte1: Byte,
    byte2: Byte,
    byte3: Byte
): Word {
    return byte0 + (byte1 << 8) + (byte2 << 16) + (byte3 << 24);
}

export function getBytesFromWord(word: Word): [Byte, Byte, Byte, Byte] {
    const byte0 = (word & 0xff) as Byte;
    const byte1 = ((word >> 8) & 0xff) as Byte;
    const byte2 = ((word >> 16) & 0xff) as Byte;
    const byte3 = ((word >> 24) & 0xff) as Byte;
    return [byte0, byte1, byte2, byte3];
}

export function loadWordAtAddress(memory: Byte[], address: Word): Word {
    return getWordFromBytes(
        memory[address],
        memory[address + 1],
        memory[address + 2],
        memory[address + 3]
    );
}

export function storeWordAtAddress(memory: Byte[], address: Word, value: Word) {
    const [byte0, byte1, byte2, byte3] = getBytesFromWord(value);
    memory[address] = byte0;
    memory[address + 1] = byte1;
    memory[address + 2] = byte2;
    memory[address + 3] = byte3;
}

export function storeBytes(memory: Byte[], bytes: Byte[], offset: Word = 0) {
    bytes.forEach((byte, i) => (memory[offset + i] = byte));
}

export function storeBytesAtAddress(memory: Byte[], address: Word, bytes: Byte[]) {
    storeBytes(memory, bytes, address);
}