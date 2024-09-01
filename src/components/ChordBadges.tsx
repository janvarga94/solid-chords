export function ChordBadge(props: { chordName: string; onClick: () => void }) {
    return (
        <div
            onClick={props.onClick}
            style={{
                "font-size": "30px",
                display: "inline-flex",
                "min-width": "100px",
                border: "solid black 1px",
                "background-color": "orange",
                "justify-content": "center",
                "padding-left": "5px",
                "padding-right": "5px",
                "border-radius": "20px",
                color: "white",
                cursor: "pointer",
            }}
        >
            {props.chordName}
        </div>
    );
}

export function MiniChordBadge(props: {
    chordName: string;
    onClick: () => void;
}) {
    return (
        <div
            onClick={props.onClick}
            style={{
                "font-size": "20px",
                display: "inline-flex",
                "min-width": "50px",
                border: "solid black 1px",
                "background-color": "orange",
                "justify-content": "center",
                "padding-left": "3px",
                "padding-right": "3px",
                "border-radius": "20px",
                color: "white",
                cursor: "pointer",
            }}
        >
            {props.chordName}
        </div>
    );
}
