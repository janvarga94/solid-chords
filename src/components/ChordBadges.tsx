export function ChordBadge(props: { chordName: string; onClick: () => void }) {
    return (
        <div onMouseDown={props.onClick} class="btn">
            {props.chordName}
        </div>
    );
}

export function MiniChordBadge(props: {
    chordName: string;
    onClick: () => void;
}) {
    return (
        <div onMouseDown={props.onClick} class="btn btn-sm">
            {props.chordName}
        </div>
    );
}
