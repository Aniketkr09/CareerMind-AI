import logging
import re

from sqlalchemy.orm import Session

from app.models.resume import Resume

logger = logging.getLogger("CareerMindAI.ResumeAnalysis")


class ResumeAnalysisService:

    SKILLS = [
        "python",
        "machine learning",
        "deep learning",
        "artificial intelligence",
        "sql",
        "postgresql",
        "fastapi",
        "django",
        "flask",
        "numpy",
        "pandas",
        "scikit-learn",
        "tensorflow",
        "pytorch",
        "nlp",
        "natural language processing",
        "computer vision",
        "docker",
        "aws",
        "git",
        "github",
        "linux",
        "java",
        "c++",
        "data structures",
        "algorithms",
        "javascript",
        "typescript",
        "react",
        "html",
        "css",
        "streamlit",
        "matplotlib",
        "seaborn",
    ]

    REQUIRED_AI_SKILLS = [
        "python",
        "machine learning",
        "sql",
        "numpy",
        "pandas",
        "scikit-learn",
        "deep learning",
        "docker",
        "git",
    ]

    @staticmethod
    def analyze_resume(
        db: Session,
        resume: Resume,
    ) -> dict:

        try:
            logger.info(
                "Starting resume analysis | resume=%s",
                resume.id,
            )

            text = resume.extracted_text or ""

            if not text.strip():
                raise ValueError(
                    "Resume text is not available."
                )

            text_lower = text.lower()

            detected_skills = (
                ResumeAnalysisService.extract_skills(
                    text_lower
                )
            )

            ats_score = (
                ResumeAnalysisService.calculate_ats_score(
                    text,
                    detected_skills,
                )
            )

            ai_score = (
                ResumeAnalysisService.calculate_ai_score(
                    text,
                    detected_skills,
                )
            )

            missing_skills = [
                skill
                for skill in ResumeAnalysisService.REQUIRED_AI_SKILLS
                if skill not in detected_skills
            ]

            experience = (
                ResumeAnalysisService.extract_section(
                    text,
                    [
                        "experience",
                        "work experience",
                        "professional experience",
                    ],
                )
            )

            education = (
                ResumeAnalysisService.extract_section(
                    text,
                    [
                        "education",
                        "academic background",
                    ],
                )
            )

            projects = (
                ResumeAnalysisService.extract_section(
                    text,
                    [
                        "projects",
                        "project",
                        "personal projects",
                    ],
                )
            )

            career_recommendation = (
                ResumeAnalysisService.generate_recommendation(
                    detected_skills
                )
            )

            strengths = (
                ResumeAnalysisService.generate_strengths(
                    text,
                    detected_skills,
                )
            )

            weaknesses = (
                ResumeAnalysisService.generate_weaknesses(
                    text,
                    missing_skills,
                )
            )

            recommendations = (
                ResumeAnalysisService.generate_recommendations(
                    missing_skills
                )
            )

            learning_path = (
                ResumeAnalysisService.generate_learning_path(
                    missing_skills
                )
            )

            summary = (
                ResumeAnalysisService.generate_summary(
                    detected_skills,
                    career_recommendation,
                    missing_skills,
                )
            )

            resume.ats_score = ats_score
            resume.ai_score = ai_score
            resume.is_processed = True

            db.add(resume)
            db.commit()
            db.refresh(resume)

            logger.info(
                "Resume analysis completed | resume=%s | ats=%s | ai=%s",
                resume.id,
                ats_score,
                ai_score,
            )

            return {
                "resume_id": str(resume.id),
                "ats_score": ats_score,
                "ai_score": ai_score,
                "skills": {
                    "technical_skills": detected_skills,
                    "programming_languages": [
                        skill
                        for skill in detected_skills
                        if skill in [
                            "python",
                            "java",
                            "c++",
                            "javascript",
                            "typescript",
                        ]
                    ],
                    "frameworks": [
                        skill
                        for skill in detected_skills
                        if skill in [
                            "fastapi",
                            "django",
                            "flask",
                            "tensorflow",
                            "pytorch",
                            "react",
                            "streamlit",
                        ]
                    ],
                    "tools": [
                        skill
                        for skill in detected_skills
                        if skill in [
                            "git",
                            "github",
                            "docker",
                            "aws",
                            "linux",
                        ]
                    ],
                },
                "experience": experience,
                "education": education,
                "projects": projects,
                "word_count": len(text.split()),
                "summary": summary,
                "career_insights": {
                    "strengths": strengths,
                    "weaknesses": weaknesses,
                    "recommendations": recommendations,
                    "learning_path": learning_path,
                },
                "missing_skills": missing_skills,
                "career_recommendation": career_recommendation,
                "message": "Resume analyzed successfully.",
            }

        except Exception as error:
            db.rollback()

            logger.exception(
                "Resume analysis failed | resume=%s | error=%s",
                resume.id,
                error,
            )

            raise

    @staticmethod
    def extract_skills(text: str) -> list[str]:

        detected = []

        for skill in ResumeAnalysisService.SKILLS:
            pattern = rf"(?<!\w){re.escape(skill)}(?!\w)"

            if re.search(pattern, text):
                detected.append(skill)

        return detected

    @staticmethod
    def calculate_ats_score(
        text: str,
        skills: list[str],
    ) -> int:

        score = 0
        text_lower = text.lower()
        words = len(text.split())

        if words >= 500:
            score += 25
        elif words >= 300:
            score += 20
        elif words >= 150:
            score += 15
        else:
            score += 8

        score += min(len(skills) * 4, 40)

        sections = [
            "experience",
            "education",
            "skills",
            "projects",
        ]

        for section in sections:
            if section in text_lower:
                score += 5

        if "github" in text_lower:
            score += 5

        if "linkedin" in text_lower:
            score += 5

        return min(score, 100)

    @staticmethod
    def calculate_ai_score(
        text: str,
        skills: list[str],
    ) -> int:

        score = 0
        text_lower = text.lower()

        score += min(len(skills) * 5, 50)

        if "project" in text_lower:
            score += 10

        if "experience" in text_lower:
            score += 10

        if "education" in text_lower:
            score += 5

        if "github" in text_lower:
            score += 5

        if "linkedin" in text_lower:
            score += 5

        if (
            "achievement" in text_lower
            or "certification" in text_lower
        ):
            score += 5

        if len(text.split()) >= 300:
            score += 5

        return min(score, 100)

    @staticmethod
    def extract_section(
        text: str,
        section_names: list[str],
    ) -> list[str]:

        lines = [
            line.strip()
            for line in text.splitlines()
            if line.strip()
        ]

        results = []
        collecting = False

        known_sections = [
            "experience",
            "work experience",
            "professional experience",
            "education",
            "academic background",
            "projects",
            "project",
            "personal projects",
            "skills",
            "technical skills",
            "certifications",
            "achievements",
            "summary",
            "professional summary",
        ]

        for line in lines:

            normalized = line.lower().strip(
                " :-"
            )

            if any(
                normalized == section
                for section in section_names
            ):
                collecting = True
                continue

            if collecting:

                if any(
                    normalized == section
                    for section in known_sections
                ):
                    break

                results.append(line)

        return results[:20]

    @staticmethod
    def generate_recommendation(
        skills: list[str],
    ) -> dict:

        if (
            "machine learning" in skills
            and "python" in skills
            and "scikit-learn" in skills
        ):
            return {
                "role": "AI / ML Engineer",
                "next_step": (
                    "Build end-to-end AI and ML projects"
                ),
            }

        if (
            "python" in skills
            and "pandas" in skills
            and "numpy" in skills
        ):
            return {
                "role": "Data Scientist",
                "next_step": (
                    "Strengthen statistics and machine learning"
                ),
            }

        if (
            "python" in skills
            and "fastapi" in skills
        ):
            return {
                "role": "AI Backend Engineer",
                "next_step": (
                    "Build production-grade AI APIs"
                ),
            }

        return {
            "role": "AI / ML Beginner",
            "next_step": (
                "Strengthen Python and ML fundamentals"
            ),
        }

    @staticmethod
    def generate_strengths(
        text: str,
        skills: list[str],
    ) -> list[str]:

        strengths = []

        if "python" in skills:
            strengths.append(
                "Strong Python foundation"
            )

        if "machine learning" in skills:
            strengths.append(
                "Machine learning knowledge"
            )

        if "scikit-learn" in skills:
            strengths.append(
                "Practical ML implementation experience"
            )

        if "project" in text.lower():
            strengths.append(
                "Hands-on project experience"
            )

        if "github" in text.lower():
            strengths.append(
                "Active software development portfolio"
            )

        return strengths

    @staticmethod
    def generate_weaknesses(
        text: str,
        missing_skills: list[str],
    ) -> list[str]:

        weaknesses = []

        for skill in missing_skills[:5]:
            weaknesses.append(
                f"Improve knowledge of {skill}"
            )

        if "experience" not in text.lower():
            weaknesses.append(
                "Add practical professional experience"
            )

        return weaknesses

    @staticmethod
    def generate_recommendations(
        missing_skills: list[str],
    ) -> list[str]:

        recommendations = []

        if missing_skills:
            recommendations.append(
                "Build projects using your missing technical skills."
            )

        recommendations.append(
            "Add measurable achievements to project descriptions."
        )

        recommendations.append(
            "Keep your GitHub portfolio updated with production-quality projects."
        )

        return recommendations

    @staticmethod
    def generate_learning_path(
        missing_skills: list[str],
    ) -> list[str]:

        priority = [
            "python",
            "machine learning",
            "deep learning",
            "sql",
            "pytorch",
            "docker",
            "cloud",
        ]

        return [
            skill
            for skill in priority
            if skill in missing_skills
        ]

    @staticmethod
    def generate_summary(
        skills: list[str],
        recommendation: dict,
        missing_skills: list[str],
    ) -> str:

        role = recommendation["role"]

        if skills:
            skill_text = ", ".join(skills[:5])

            summary = (
                f"Your resume demonstrates experience "
                f"with {skill_text}. "
                f"Based on the detected skills, "
                f"your strongest career direction is "
                f"{role}."
            )
        else:
            summary = (
                "Your resume currently contains limited "
                "detectable technical skills. "
                "Strengthen the technical skills section "
                "with specific technologies and projects."
            )

        if missing_skills:
            summary += (
                " Focus on "
                + ", ".join(missing_skills[:3])
                + " to improve your career readiness."
            )

        return summary