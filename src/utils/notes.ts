export type ChordType =
    | "major"
    | "minor"
    | "sus2"
    | "sus4"
    | "dom7"
    | "maj7"
    | "min7";

export function getAllChordsForSeminote(
    seminote: number,
    chordTypes: ChordType[],
    excludeSelf = false
) {
    let chords = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        .flatMap((chordKey) => {
            //todo: .map should do
            if (excludeSelf && seminote === chordKey) return [];

            function norm(semis: number[]) {
                return semis.map((key) => (key === 12 ? 12 : key % 12));
            }

            function extract(seminotes: number[], type: ChordType) {
                let seminotesInChord = norm(seminotes);
                if (seminotesInChord.includes(seminote)) {
                    return {
                        name: chordSeminoteToChordName(chordKey) + type,
                        type: type,
                        matchingKeySeminotes: [1, 3, 5, 6, 8, 10, 12].filter(
                            (value) => seminotesInChord.includes(value)
                        ).length,
                        matchingFourthSeminotes: norm(
                            [1, 3, 5, 6, 8, 10, 12].map(
                                (s) => s + seminote - 1 + 5
                            )
                        ).filter((value) => seminotesInChord.includes(value))
                            .length,
                        matchingFifthSeminotes: norm(
                            [1, 3, 5, 6, 8, 10, 12].map(
                                (s) => s + seminote - 1 + 7
                            )
                        ).filter((value) => seminotesInChord.includes(value))
                            .length,
                        key: chordKey,
                        seminotes: seminotesInChord,
                    };
                }
            }

            let major = chordTypes.find((c) => c === "major")
                ? extract([chordKey, chordKey + 4, chordKey + 7], "major")
                : undefined;
            let minors = chordTypes.find((c) => c === "minor")
                ? extract([chordKey, chordKey + 3, chordKey + 7], "minor")
                : undefined;
            let sus4s = chordTypes.find((c) => c === "sus4")
                ? extract([chordKey, chordKey + 5, chordKey + 7], "sus4")
                : undefined;
            let sus2s = chordTypes.find((c) => c === "sus2")
                ? extract([chordKey, chordKey + 2, chordKey + 7], "sus2")
                : undefined;
            let domSevens = chordTypes.find((c) => c === "dom7")
                ? extract(
                      [chordKey, chordKey + 4, chordKey + 7, chordKey + 10],
                      "dom7"
                  )
                : undefined;
            let minSevens = chordTypes.find((c) => c === "min7")
                ? extract(
                      [chordKey, chordKey + 3, chordKey + 7, chordKey + 10],
                      "min7"
                  )
                : undefined;
            let majSevens = chordTypes.find((c) => c === "maj7")
                ? extract(
                      [chordKey, chordKey + 4, chordKey + 7, chordKey + 11],
                      "maj7"
                  )
                : undefined;

            return [
                major,
                minors,
                sus4s,
                sus2s,
                domSevens,
                minSevens,
                majSevens,
            ];
        })
        .filter(Boolean);
    return chords;
}

/**
 *
 * @param seminote 1-12
 * @returns 1,1#,...,7
 */
export function chordSeminoteToChordName(seminote: number) {
    switch (seminote) {
        case 1:
            return "1";
        case 2:
            return "1#";
        case 3:
            return "2";
        case 4:
            return "2#";
        case 5:
            return "3";
        case 6:
            return "4";
        case 7:
            return "4#";
        case 8:
            return "5";
        case 9:
            return "5#";
        case 10:
            return "6";
        case 11:
            return "6#";
        case 12:
            return "7";
        default:
            throw new Error("bad seminote " + seminote);
    }
}

export function semitoneToToneAndOctave(seminote: number, octave: number) {
    switch (seminote) {
        case 1:
            return "C" + octave;
        case 2:
            return "C#" + octave;
        case 3:
            return "D" + octave;
        case 4:
            return "D#" + octave;
        case 5:
            return "E" + octave;
        case 6:
            return "F" + octave;
        case 7:
            return "F#" + octave;
        case 8:
            return "G" + octave;
        case 9:
            return "G#" + octave;
        case 10:
            return "A" + octave;
        case 11:
            return "A#" + octave;
        case 12:
            return "B" + octave;
        default:
            throw new Error("seminote out of range " + seminote);
    }
}
