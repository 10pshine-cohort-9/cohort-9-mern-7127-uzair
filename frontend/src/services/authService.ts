const API_URL = 'http://localhost:5000/auth';

const login = async (email:string, password:string) => {
    const response = await fetch(`${API_URL}/login`, {
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
};


const signup = async (name:string, email:string, password:string) => {
    const response = await fetch(`${API_URL}/signup`, {
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
}

export { login,signup };