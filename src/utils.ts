const SIGNATURES: Array<[string, number[], number?]> = [
    ["image/jpeg", [0xff, 0xd8, 0xff]],
    ["image/png", [0x89, 0x50, 0x4e, 0x47]],
    ["image/gif", [0x47, 0x49, 0x46]],
    ["image/bmp", [0x42, 0x4d]],
    ["image/x-icon", [0x00, 0x00, 0x01, 0x00]],
    ["image/tiff", [0x49, 0x49, 0x2a, 0x00]],
    ["image/tiff", [0x4d, 0x4d, 0x00, 0x2a]],
];

export function getImageType(image: ArrayBuffer): string | undefined {
    const bytes = new Uint8Array(image);
    const match = (sig: number[], offset = 0) => sig.every((b, i) => bytes[offset + i] === b);

    for (const [mime, sig, offset = 0] of SIGNATURES) {
        if (match(sig, offset)) return mime;
    }

    if (match([0x52, 0x49, 0x46, 0x46]) && match([0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";

    if (
        bytes.length > 11 &&
        match([0x66, 0x74, 0x79, 0x70], 4) && // "ftyp"
        (match([0x68, 0x65, 0x69, 0x63], 8) || // "heic"
            match([0x68, 0x65, 0x69, 0x78], 8) || // "heix"
            match([0x68, 0x65, 0x76, 0x63], 8) || // "hevc"
            match([0x68, 0x65, 0x76, 0x78], 8)) // "hevx"
    ) {
        return "image/heic";
    }

    return undefined;
}
