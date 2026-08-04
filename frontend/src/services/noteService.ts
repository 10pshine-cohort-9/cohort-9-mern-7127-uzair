const getNotes = async (token: string | null) => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/notes`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await response.json();

    if(!response.ok){
        throw new Error(data.message);
    }

    return data
    } catch (error) {
        throw error instanceof Error ? error.message : new Error("Something went wrong!");
    };
}

export { getNotes };