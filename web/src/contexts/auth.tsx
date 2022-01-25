import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";
type AuthResponse = {
    token: string;
    user: {
        id: string;
        avatar_url: string;
        name: string;
        login: string
    }
}

type User = {
    id: string;
    name: string;
    login: string;
    avatar_url: string
}
type AuthContextData = {
    user: User | null;
    signInUrl: string;
    signOut: () => void;
    
}
export const AuthContext = createContext({} as AuthContextData)

type AuthProvider = {
    children: ReactNode;
}

export function AuthProvider(props:AuthProvider){
    const [user, setUser] = useState<User | null>(null)
    const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=28fe84c3dba5968eb3db`
   async function signIn(githubCode: string) {
       const response = await api.post<AuthResponse>('authenticate', {
           code:githubCode,

       })
       const {token, user} = response.data;
       localStorage.setItem('@dowhile:token', token); 
       api.defaults.headers.common.authorization = `Bearer ${token}`;
       setUser(user)
    }

    function signOut(){
        setUser(null)
        localStorage.removeItem('@dowhile:token')
        
    }
    useEffect(() => {
        const url = window.location.href;
        const hasGitHubCode = url.includes('?code=');

        if(hasGitHubCode) {
            const [urlWithoutCode, githubCode] = url.split('?code=');

            // console.log({urlWithoutCode,githubCode})
            window.history.pushState({}, '',urlWithoutCode);

            signIn(githubCode)

        }
    },[])

    useEffect(() =>{
      
        const token = localStorage.getItem('@dowhile:token')

        if(token) {
            api.defaults.headers.common.authorization = `Bearer ${token}`;
            api.get('profile').then(response =>{
                setUser(response.data)
            })
        }
    }, [])


        
    
    return (
         <AuthContext.Provider value={{signInUrl, user, signOut}}>
           {props.children}
         </AuthContext.Provider>
    );
}