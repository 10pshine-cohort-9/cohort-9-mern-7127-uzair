interface AuthResponse {
    message: string,
    token: string,
    user: {
        id: string,
        name: string,
        email: string, 
    },
};

const login = async (email:string, password:string) : Promise<AuthResponse> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email,password})
        });

        const data = await response.json();

        if(!response.ok){
            throw new Error(data.message);
        }

        return data;
    } catch (error) {
        throw error instanceof Error ? error : new Error("Something went wrong!");
    }
};


const signup = async (name:string, email:string, password:string) : Promise<AuthResponse> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json',
            },
            body: JSON.stringify({ name, email, password})
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

export { login,signup };