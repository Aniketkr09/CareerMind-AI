from typing import List, Dict


class CareerEngine:
    """
    CareerMind AI Intelligent Career Engine

    Features:
    - Skill Gap Detection
    - Career Recommendation
    - Interview Preparation
    """


    # --------------------------------------------------
    # Industry Skill Database
    # --------------------------------------------------

    CAREER_SKILLS = {

        "AI Engineer": [
            "python",
            "machine learning",
            "deep learning",
            "numpy",
            "pandas",
            "scikit-learn",
            "tensorflow",
            "pytorch",
            "nlp",
            "docker",
            "cloud"
        ],


        "Backend Developer": [
            "python",
            "fastapi",
            "sql",
            "postgresql",
            "api",
            "docker",
            "git"
        ],


        "Data Scientist": [
            "python",
            "statistics",
            "machine learning",
            "pandas",
            "numpy",
            "visualization",
            "sql"
        ],


        "ML Engineer": [
            "python",
            "machine learning",
            "deep learning",
            "mlops",
            "docker",
            "cloud",
            "tensorflow"
        ]

    }



    # --------------------------------------------------
    # Skill Gap Detection
    # --------------------------------------------------

    @staticmethod
    def detect_skill_gap(
        resume_text: str,
        target_role: str
    ) -> Dict:


        resume_text = resume_text.lower()


        required_skills = (
            CareerEngine.CAREER_SKILLS.get(
                target_role,
                []
            )
        )


        existing_skills = []

        missing_skills = []


        for skill in required_skills:

            if skill in resume_text:

                existing_skills.append(
                    skill
                )

            else:

                missing_skills.append(
                    skill
                )


        completion = 0

        if required_skills:

            completion = int(
                (
                    len(existing_skills)
                    /
                    len(required_skills)
                )
                *
                100
            )


        return {

            "target_role": target_role,

            "existing_skills": existing_skills,

            "missing_skills": missing_skills,

            "skill_match_percentage": completion

        }




    # --------------------------------------------------
    # Career Recommendation
    # --------------------------------------------------

    @staticmethod
    def recommend_career(
        resume_text: str
    ):


        resume_text = resume_text.lower()


        scores = {}


        for role, skills in CareerEngine.CAREER_SKILLS.items():

            score = 0


            for skill in skills:

                if skill in resume_text:

                    score += 1


            scores[role] = score



        recommended_role = max(
            scores,
            key=scores.get
        )


        return {

            "recommended_role": recommended_role,

            "matching_score": scores[recommended_role],

            "all_role_scores": scores

        }




    # --------------------------------------------------
    # AI Interview Preparation
    # --------------------------------------------------

    @staticmethod
    def generate_interview_questions(
        role: str
    ) -> List[str]:


        questions = {


            "AI Engineer": [

                "Explain the difference between AI and Machine Learning.",

                "How does a neural network work?",

                "Explain overfitting and how to prevent it.",

                "Describe your ML project architecture.",

                "How do you deploy a machine learning model?"

            ],



            "Backend Developer": [

                "Explain REST API architecture.",

                "How does FastAPI handle requests?",

                "Explain database indexing.",

                "What is JWT authentication?",

                "How do you optimize backend performance?"

            ],



            "Data Scientist": [

                "Explain supervised and unsupervised learning.",

                "How do you handle missing data?",

                "Explain feature engineering.",

                "What evaluation metrics do you use?"

            ]

        }



        return questions.get(

            role,

            [

                "Tell me about yourself.",

                "Explain your projects.",

                "What are your technical strengths?"

            ]

        )



    # --------------------------------------------------
    # Complete Career Analysis
    # --------------------------------------------------

    @staticmethod
    def complete_analysis(
        resume_text: str,
        target_role: str
    ):


        skill_gap = (
            CareerEngine.detect_skill_gap(
                resume_text,
                target_role
            )
        )


        career = (
            CareerEngine.recommend_career(
                resume_text
            )
        )


        interview = (
            CareerEngine.generate_interview_questions(
                target_role
            )
        )


        return {


            "career_recommendation": career,


            "skill_gap_analysis": skill_gap,


            "interview_questions": interview


        }