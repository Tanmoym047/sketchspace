import { useContext } from "react";
import { AuthContext } from "./AuthProvider";
import { Navigate, useLocation } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import 'react-loading-skeleton/dist/skeleton.css'

const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();
    console.log(location);

    if (loading) {
        return <Skeleton className="w-full" count={5} />

    }
    if (user) {
        return children;
    }

    return <Navigate state={location.pathname} to='/login'></Navigate>

};

export default PrivateRoute;