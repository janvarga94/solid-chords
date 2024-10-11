import {
    chordSeminoteToChordName,
    semitoneToNoteAndOctave,
} from "../bussiness/notes";

export type Key = {
    seminote: number;
    noteAndOctave: string;
    myChordMark: string;
    octave: number;
    isBlack: boolean;
    width: number;
    left: number;
    isPlaying: boolean;
};

export function createKeyViewmodel() {
    return [...Array(84).keys()].map((keyIndex): Key => {
        let octave = Math.floor(keyIndex / 12) + 1;
        let seminote = (keyIndex + 1) % 12 || 12;
        let whiteWidth = 20;
        let blackWidth = 16;
        let isBlack = [2, 4, 7, 9, 11].includes(seminote);

        /** used only for key positioning on the screen */
        let keySequence = !isBlack
            ? seminote === 1
                ? 1
                : seminote === 3
                  ? 2
                  : seminote === 5
                    ? 3
                    : seminote === 6
                      ? 4
                      : seminote === 8
                        ? 5
                        : seminote === 10
                          ? 6
                          : 7
            : seminote === 2
              ? 1
              : seminote === 4
                ? 2
                : seminote === 7
                  ? 4
                  : seminote === 9
                    ? 5
                    : 6;
        return {
            seminote,
            noteAndOctave: semitoneToNoteAndOctave(seminote, octave),
            myChordMark: chordSeminoteToChordName(seminote),
            octave,
            isBlack,
            width: isBlack ? blackWidth : whiteWidth,
            left:
                (octave - 1) * whiteWidth * 7 +
                (keySequence - 1) * whiteWidth +
                (isBlack ? whiteWidth - blackWidth / 2 : 0),
            isPlaying: false,
        };
    });
}
