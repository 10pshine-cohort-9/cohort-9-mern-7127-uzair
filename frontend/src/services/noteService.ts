import type { Note } from "../components/NoteCard";

type DeleteNoteResponse = {
    message: string,
}

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

const createNote = async (title: string, content:string) : Promise<Note> => {
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

const updateNote = async (id: string, title: string, content: string): Promise<Note> => {
    try {

        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
            throw new Error("Invalid note ID");
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/${encodeURIComponent(id)}`, {
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

const deleteNote = async (id: string) : Promise<DeleteNoteResponse> => {
    try {

        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
            throw new Error("Invalid note ID");
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/${encodeURIComponent(id)}`, {
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

const getTrash = async () : Promise<Note[]> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/trash`, {
            method: 'GET',
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw error instanceof Error ? error : new Error('Something went wrong. Please try again.');
    }
}

const restoreNote = async (id: string) : Promise<Note[]> => {
    try {

        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
            throw new Error("Invalid note ID");
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/${encodeURIComponent(id)}/restore`, {
            method: 'PATCH',
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw error instanceof Error ? error : new Error('Something went wrong. Please try again.');
    }
}

const permanentlyDeleteNote = async (id: string) : Promise<DeleteNoteResponse> => {
    try {

        if (!/^[a-fA-F0-9]{24}$/.test(id)) {
            throw new Error("Invalid note ID");
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/notes/${encodeURIComponent(id)}/permanent`, {
            method: 'DELETE',
            credentials: 'include'
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw error instanceof Error ? error : new Error('Something went wrong. Please try again.');
    }
}

export { getNotes,createNote,updateNote,deleteNote,getTrash,restoreNote,permanentlyDeleteNote };