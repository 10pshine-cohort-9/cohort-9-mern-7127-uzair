interface AuthResponse {
    message: string,
    user: {
        id: string,
        name: string,
        email: string, 
    },
};

const login = async (email:string, password:string) : Promise<AuthResponse> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
            method: 'POST',
            credentials: "include",
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
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
            method: 'POST',
            credentials: "include",
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

const logout = async () : Promise<void> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/logout`, {
            method: 'POST',
            credentials: "include",
        });

        if(!response.ok){
            const data = await response.json();
            throw new Error(data.message);
        }
    } catch (error) {
        throw error instanceof Error ? error : new Error("Something went Wrong!");
    }
}

const getMe = async () : Promise<boolean> => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
            method: 'GET',
            credentials: 'include'
        })

        return response.ok;
    } catch (error) {
        throw error instanceof Error ? error : new Error("Something went Wrong!");
    }
}

const getProfile = async () => {
    try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
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

const uploadProfilePicture = async (file: File) => {
    try {
        const formData = new FormData();
        formData.append('profilePicture', file);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/profile-picture`, {
            method: 'POST',
            credentials: 'include',
            body: formData
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

export { login,signup,logout,getMe,getProfile,uploadProfilePicture };