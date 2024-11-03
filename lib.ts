export type Byte = number;
export type Word = number; // 2 bytes

/**
 * Bytes are in little-endian order
 */
export function getWordFromBytes(byte0: Byte, byte1: Byte): Word {
    return byte0 + byte1 * 256;
}

export function getBytesFromWord(word: Word): [Byte, Byte] {
    const byte0 = (word % 256) as Byte;
    const byte1 = (((word - byte0) / 256) % 256) as Byte;
    return [byte0, byte1];
}
