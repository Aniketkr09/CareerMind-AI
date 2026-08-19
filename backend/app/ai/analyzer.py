"""
CareerMind AI

Resume Analyzer

Responsibilities:
- ATS scoring
- AI scoring
- Skill extraction
- Education detection
- Experience detection
- Project detection
- Career insights generation
"""

import re
from typing import Any


class ResumeAnalyzer:
    """CareerMind AI Resume Analyzer."""

    PROGRAMMING_LANGUAGES = {
        "Python",
        "Java",
        "C",
        "C++",
        "JavaScript",
        "TypeScript",
        "Go",
        "Rust",
        "PHP",
    }

    FRAMEWORKS = {
        "FastAPI",
        "Flask",
        "Django",
        "React",
        "Angular",
        "Vue",
        "TensorFlow",
        "PyTorch",
        "Scikit-Learn",
        "Keras",
    }

    DATABASES = {
        "PostgreSQL",
        "MySQL",
        "MongoDB",
        "SQLite",
        "Oracle",
    }

    CLOUD = {
        "AWS",
        "Azure",
        "GCP",
        "Google Cloud",
    }

    TOOLS = {
        "Git",
        "Docker",
        "Linux",
        "GitHub",
        "Postman",
        "VS Code",
    }

    TECHNICAL_SKILLS = {
        "Machine Learning",
        "Artificial Intelligence",
        "Deep Learning",
        "Natural Language Processing",
        "NLP",
        "Computer Vision",
        "Data Science",
        "Data Analysis",
        "Data Structures",
        "Algorithms",
        "REST API",
        "SQL",
    }

    EDUCATION_KEYWORDS = [
        "B.Tech",
        "Bachelor",
        "M.Tech",
        "Master",
        "Computer Science",
        "Engineering",
        "Artificial Intelligence",
        "Machine Learning",
    ]

    EXPERIENCE_KEYWORDS = [
        "Intern",
        "Internship",
        "Developer",
        "Engineer",
        "Research",
        "Worked",
        "Developed",
        "Built",
        "Implemented",
        "Designed",
    ]

    PROJECT_KEYWORDS = [
        "Project",
        "Projects",
        "CareerMind AI",
        "CyberGuard AI",
    ]

    @classmethod
    def _find_matches(cls, text: str, keywords: set[str]) -> list[str]:
        """Find matching keywords."""
        lower = text.lower()

        return sorted(
            [
                keyword
                for keyword in keywords
                if keyword.lower() in lower
            ]
        )

    @classmethod
    def analyze(cls, text: str) -> dict[str, Any]:
        """Analyze resume."""

        if not text.strip():
            return {
                "ats_score": 0,
                "ai_score": 0,
                "skills": {
                    "technical_skills": [],
                    "programming_languages": [],
                    "frameworks": [],
                    "databases": [],
                    "cloud": [],
                    "tools": [],
                },
                "experience": [],
                "education": [],
                "projects": [],
                "word_count": 0,
                "summary": "No resume text found.",
                "career_insights": {
                    "strengths": [],
                    "weaknesses": [],
                    "recommendations": [],
                    "learning_path": [],
                },
            }

        word_count = len(text.split())

        technical = cls._find_matches(text, cls.TECHNICAL_SKILLS)
        languages = cls._find_matches(text, cls.PROGRAMMING_LANGUAGES)
        frameworks = cls._find_matches(text, cls.FRAMEWORKS)
        databases = cls._find_matches(text, cls.DATABASES)
        cloud = cls._find_matches(text, cls.CLOUD)
        tools = cls._find_matches(text, cls.TOOLS)

        education = [
            item
            for item in cls.EDUCATION_KEYWORDS
            if item.lower() in text.lower()
        ]

        experience = [
            item
            for item in cls.EXPERIENCE_KEYWORDS
            if item.lower() in text.lower()
        ]

        projects = [
            item
            for item in cls.PROJECT_KEYWORDS
            if item.lower() in text.lower()
        ]

        total_skills = (
            len(technical)
            + len(languages)
            + len(frameworks)
            + len(databases)
            + len(cloud)
            + len(tools)
        )

        ats_score = min(
            100,
            55
            + total_skills * 3
            + len(projects) * 2,
        )

        ai_score = min(
            100,
            60
            + total_skills * 2
            + len(experience) * 3
            + len(education) * 2,
        )

        strengths = []

        if languages:
            strengths.append(
                "Strong programming foundation."
            )

        if technical:
            strengths.append(
                "Good AI and technical knowledge."
            )

        if frameworks:
            strengths.append(
                "Experience with modern frameworks."
            )

        if projects:
            strengths.append(
                "Hands-on project experience."
            )

        weaknesses = []

        if not cloud:
            weaknesses.append(
                "Cloud technologies are not mentioned."
            )

        if not tools:
            weaknesses.append(
                "Development tools are limited."
            )

        if word_count < 300:
            weaknesses.append(
                "Resume content is too short."
            )

        recommendations = [
            "Add quantified project achievements.",
            "Include internship or work experience.",
            "Add certifications.",
            "Include GitHub and LinkedIn links.",
            "Tailor resume for the target role.",
        ]

        learning_path = [
            "Advanced Python",
            "Data Structures & Algorithms",
            "SQL",
            "Docker",
            "AWS",
            "Machine Learning",
            "Deep Learning",
            "MLOps",
            "LLMs",
            "System Design",
        ]

        summary = (
            f"The resume contains {word_count} words and "
            f"{total_skills} detected technical skills. "
            "The profile demonstrates practical software "
            "development and AI knowledge."
        )

        return {
            "ats_score": ats_score,
            "ai_score": ai_score,
            "skills": {
                "technical_skills": technical,
                "programming_languages": languages,
                "frameworks": frameworks,
                "databases": databases,
                "cloud": cloud,
                "tools": tools,
            },
            "experience": experience,
            "education": education,
            "projects": projects,
            "word_count": word_count,
            "summary": summary,
            "career_insights": {
                "strengths": strengths,
                "weaknesses": weaknesses,
                "recommendations": recommendations,
                "learning_path": learning_path,
            },
        }