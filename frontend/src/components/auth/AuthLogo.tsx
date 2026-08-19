/**
============================================================
CareerMind AI

AI Brand Logo Component

Features:
- Futuristic AI branding
- Animated logo effect
- Professional SaaS identity

============================================================
*/


import {
    BrainCircuit,
    Sparkles
} from "lucide-react";


import "../../styles/auth.css";



export default function AuthLogo() {


    return (


        <div className="auth-logo-wrapper">



            <div className="ai-logo-orbit">


                <div className="ai-logo-core">


                    <BrainCircuit
                        size={42}
                    />


                </div>



                <div className="orbit-dot dot-one"></div>

                <div className="orbit-dot dot-two"></div>

                <div className="orbit-dot dot-three"></div>


            </div>





            <div className="brand-text">


                <h1>

                    Career
                    <span>
                        Mind AI
                    </span>


                </h1>



                <p>


                    <Sparkles
                        size={16}
                    />


                    AI Powered Career Intelligence


                </p>


            </div>



        </div>


    );

}