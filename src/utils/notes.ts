
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
        default: throw new Error("seminote out of range " + seminote)
    }
}

export function getAllChordsForSeminote(seminote: number, excludeSelf = false) {
    let chords = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        .flatMap((chordKey) => {
            if (excludeSelf && seminote === chordKey) return [];

            function norm(semis: number[]) {
                return semis.map((key) => (key === 12 ? 12 : key % 12));
            }

            function extract(seminotes: number[], type: string) {
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

            let majors = extract(
                [chordKey, chordKey + 4, chordKey + 7],
                "major"
            );
            let minors = extract(
                [chordKey, chordKey + 3, chordKey + 7],
                "minor"
            );
            let sus4s = extract([chordKey, chordKey + 5, chordKey + 7], "sus4");
            let sus2s = extract([chordKey, chordKey + 3, chordKey + 7], "sus2");
            let domSevens = extract(
                [chordKey, chordKey + 4, chordKey + 7, chordKey + 10],
                "dom7"
            );
            let minSevens = extract(
                [chordKey, chordKey + 3, chordKey + 7, chordKey + 10],
                "min7"
            );
            // let majSevens = extract([chordKey, chordKey + 4, chordKey + 7, chordKey + 11], "maj7",);
            // let diminished = extract([chordKey, chordKey + 3, chordKey + 6, chordKey + 9], "dim",);

            return [majors, minors, sus4s, sus2s, domSevens, minSevens];
        })
        .filter(Boolean);
    return chords;
}
