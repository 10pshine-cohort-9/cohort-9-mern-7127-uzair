import type { Note } from "../components/NoteCard";

const getNotes = async () : Promise<Note[]>=> {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/notes`, {
            method: 'GET',
            credentials: "include",
        });

        const data = await response.json();

    if(!response.ok){
        throw new Error(data.message);
    }

    return data
    } catch (error) {
        throw error instanceof Error ? error : new Error("Something went wrong!");
    }
}

export { getNotes };