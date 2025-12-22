import { createContext, useEffect, useState } from "react";
import { GithubAuthProvider, GoogleAuthProvider, createUserWithEmailAndPassword, getAuth, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import app from "../firebase/firebase.config";

export const AuthContext = createContext(null)

const AuthProvider = ({ children }) => {
    const auth = getAuth(app);

    const googleProvider = new GoogleAuthProvider();
    const githubProvider = new GithubAuthProvider();


    const [user, setUser] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unSubscribe = onAuthStateChanged(auth, currentUser => {
            setLoading(true)
            console.log('user in the auth state changed', currentUser);
            setUser(currentUser);
            // if(currentUser === null){
            //     setLoading(false);
            // }
            // else{
            //     setLoading(false);
            // }
            setLoading(false)

        })
        return () => {
            unSubscribe();
        }
    }, [auth])

    const signUp = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    }
    const signIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    }
    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    }
    const signInWithGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    }
    const signInWithGithub = () => {
        setLoading(true);
        return signInWithPopup(auth, githubProvider);
    }
    const updateUser = (name, photo) => {
        
        return updateProfile(auth.currentUser, {
            displayName: name, photoURL: photo
        });
    }


    const authInfo = { user, signUp, signIn, signInWithGoogle, signInWithGithub, logOut, updateUser, loading };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;