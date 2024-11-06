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
