const API_URL = 'http://localhost:5000';

const getNotes = async (token: string | null) => {
    const response = await fetch(`${API_URL}/notes`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    const data = await response.json();

    if(!response.ok){
        throw new Error(data.message);
    }

    return data;
}

const createNote = async (title:string, content:string, token:string) => {
    const response = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({title,content}),
    });

    const data = await response.json();
    
    if(!response.ok){
        throw new Error(data.message);
    }

    return data;
}

export { getNotes, createNote };