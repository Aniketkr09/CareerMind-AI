import {
    Navigate
} from "react-router-dom";


import {
    ReactNode
} from "react";


import {
    useAuth
} from "../hooks/useAuth";





interface ProtectedRouteProps {


    children: ReactNode;


}








export default function ProtectedRoute({

    children

}: ProtectedRouteProps) {



    const {

        user,

        loading

    } = useAuth();







    // Loading State

    if (loading) {


        return (


            <div className="route-loading">


                <h2>

                    CareerMind AI 🤖

                </h2>



                <p>

                    Loading your AI career workspace...

                </p>



            </div>


        );


    }







    // User Not Logged In

    if (!user) {


        return (


            <Navigate

                to="/login"

                replace

            />


        );


    }








    return children;


}