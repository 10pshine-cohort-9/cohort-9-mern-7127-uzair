type Note = {
    _id: string,
    title: string,
    content: string,
    createdAt: string,
    updatedAt: string
}

interface NoteCardProps {
    note: Note,
    isSelected: boolean,
    onClick: ()=> void,
}

const NoteCard = ({ note, isSelected, onClick }: NoteCardProps) => {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left rounded-lg p-4 transition ${
                isSelected ? 'bg-[#C0453A] text-white' : 'bg-white hover:bg-gray-50'
            }`}
        >
            <h2 className="text-sm font-semibold mb-1">{note.title}</h2>
            <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                {note.content}
            </p>
            <p className={`text-xs mt-2 ${isSelected ? 'text-white/60' : 'text-gray-400'}`}>
                {new Date(note.updatedAt).toLocaleDateString()}
            </p>
        </button>
    )
}

export default NoteCard;
export type {Note};