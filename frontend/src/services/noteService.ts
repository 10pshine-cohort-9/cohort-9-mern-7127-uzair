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

const createNote = async (title: string, content:string) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/notes`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, content }),
        });

        const data = await response.json();

        if(!response.ok){
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw error instanceof Error ? error : new Error("Something went wrong!");
    }
}

const updateNote = async (id: string, title: string, content: string) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/${id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type' : 'application/json' },
            body: JSON.stringify({ title,content }),
        });
        
        const data = await response.json();

        if(!response.ok){
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw error instanceof Error ? error : new Error("Something went wrong!");
    }
}

const deleteNote = async (id: string) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if(!response.ok){
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw error instanceof Error ? error : new Error("Something went wrong!");
    }
}

export { getNotes,createNote,updateNote,deleteNote };