/**
 * ============================================================
 * CareerMind AI
 *
 * useInterview Hook
 *
 * Responsibilities:
 * - Manage interview question state
 * - Generate interview questions
 * - Submit answers for AI evaluation
 * - Manage loading states
 * - Manage errors
 * - Track interview score
 * - Track interview session statistics
 * - Support category & difficulty changes
 *
 * Backend:
 * GET  /api/v1/interview/question
 * POST /api/v1/interview/evaluate
 * ============================================================
 */

import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    evaluateInterviewAnswer,
    generateInterviewQuestion,
    getInterviewCategoryLabel,
    getInterviewDifficultyLabel,
    getInterviewReadiness,
    getInterviewScoreLabel,
    getInterviewScoreStatus,
    type InterviewCategory,
    type InterviewDifficulty,
    type InterviewEvaluation,
    type InterviewQuestion,
} from "../services/interviewService";


/* ============================================================
   TYPES
============================================================ */

export interface InterviewStats {
    questionsAnswered: number;
    averageScore: number;
    bestScore: number;
}

export interface UseInterviewOptions {
    autoStart?: boolean;

    initialCategory?: InterviewCategory;

    initialDifficulty?: InterviewDifficulty;
}

export interface UseInterviewReturn {

    /* Question */

    question: InterviewQuestion | null;

    loadingQuestion: boolean;

    generateQuestion: () => Promise<
        InterviewQuestion | null
    >;

    nextQuestion: () => Promise<
        InterviewQuestion | null
    >;


    /* Answer */

    answer: string;

    setAnswer: (
        answer: string
    ) => void;


    /* Evaluation */

    evaluation: InterviewEvaluation | null;

    evaluating: boolean;

    submitAnswer: () => Promise<
        InterviewEvaluation | null
    >;


    /* Filters */

    category: InterviewCategory;

    setCategory: (
        category: InterviewCategory
    ) => void;

    difficulty: InterviewDifficulty;

    setDifficulty: (
        difficulty: InterviewDifficulty
    ) => void;


    /* State */

    error: string | null;

    clearError: () => void;

    resetInterview: () => void;


    /* Statistics */

    stats: InterviewStats;


    /* Computed */

    score: number;

    scoreLabel: string;

    scoreStatus:
    | "excellent"
    | "strong"
    | "developing"
    | "critical";

    readiness: string;

    categoryLabel: string;

    difficultyLabel: string;


    /* Answer validation */

    answerLength: number;

    canSubmit: boolean;
}


/* ============================================================
   DEFAULT VALUES
============================================================ */

const DEFAULT_CATEGORY: InterviewCategory =
    "technical";

const DEFAULT_DIFFICULTY: InterviewDifficulty =
    "medium";


/* ============================================================
   SCORE NORMALIZER
============================================================ */

function normalizeScore(
    score: number
): number {

    if (
        !Number.isFinite(score)
    ) {
        return 0;
    }

    return Math.min(
        Math.max(
            Math.round(score),
            0
        ),
        100
    );
}


/* ============================================================
   ERROR MESSAGE
============================================================ */

function getErrorMessage(
    error: unknown,
    fallback: string
): string {

    if (
        error instanceof Error &&
        error.message
    ) {
        return error.message;
    }

    if (
        typeof error === "string" &&
        error.trim()
    ) {
        return error;
    }

    return fallback;
}


/* ============================================================
   HOOK
============================================================ */

export function useInterview(
    options?: UseInterviewOptions
): UseInterviewReturn {

    /* ========================================================
       QUESTION STATE
    ======================================================== */

    const [
        question,
        setQuestion,
    ] = useState<InterviewQuestion | null>(
        null
    );


    const [
        loadingQuestion,
        setLoadingQuestion,
    ] = useState(false);


    /* ========================================================
       ANSWER STATE
    ======================================================== */

    const [
        answer,
        setAnswer,
    ] = useState("");


    /* ========================================================
       EVALUATION STATE
    ======================================================== */

    const [
        evaluation,
        setEvaluation,
    ] = useState<InterviewEvaluation | null>(
        null
    );


    const [
        evaluating,
        setEvaluating,
    ] = useState(false);


    /* ========================================================
       FILTER STATE
    ======================================================== */

    const [
        category,
        setCategory,
    ] = useState<InterviewCategory>(
        options?.initialCategory ??
        DEFAULT_CATEGORY
    );


    const [
        difficulty,
        setDifficulty,
    ] = useState<InterviewDifficulty>(
        options?.initialDifficulty ??
        DEFAULT_DIFFICULTY
    );


    /* ========================================================
       ERROR STATE
    ======================================================== */

    const [
        error,
        setError,
    ] = useState<string | null>(
        null
    );


    /* ========================================================
       STATISTICS
    ======================================================== */

    const [
        stats,
        setStats,
    ] = useState<InterviewStats>({
        questionsAnswered: 0,
        averageScore: 0,
        bestScore: 0,
    });


    /* ========================================================
       CLEAR ERROR
    ======================================================== */

    const clearError = useCallback(() => {

        setError(null);

    }, []);


    /* ========================================================
       GENERATE QUESTION
    ======================================================== */

    const generateQuestion =
        useCallback(
            async (): Promise<
                InterviewQuestion | null
            > => {

                setLoadingQuestion(true);

                setError(null);

                setEvaluation(null);

                setAnswer("");

                try {

                    const newQuestion =
                        await generateInterviewQuestion({
                            category,
                            difficulty,
                        });

                    setQuestion(
                        newQuestion
                    );

                    return newQuestion;

                } catch (err: unknown) {

                    const message =
                        getErrorMessage(
                            err,
                            "Unable to generate interview question."
                        );

                    console.error(
                        "CareerMind AI:",
                        message
                    );

                    setError(
                        message
                    );

                    return null;

                } finally {

                    setLoadingQuestion(
                        false
                    );
                }
            },
            [
                category,
                difficulty,
            ]
        );


    /* ========================================================
       NEXT QUESTION
    ======================================================== */

    const nextQuestion =
        useCallback(
            async (): Promise<
                InterviewQuestion | null
            > => {

                return generateQuestion();

            },
            [
                generateQuestion,
            ]
        );


    /* ========================================================
       SUBMIT ANSWER
    ======================================================== */

    const submitAnswer =
        useCallback(
            async (): Promise<
                InterviewEvaluation | null
            > => {

                if (!question) {

                    setError(
                        "Please generate an interview question first."
                    );

                    return null;
                }


                const cleanedAnswer =
                    answer.trim();


                if (!cleanedAnswer) {

                    setError(
                        "Please provide an answer before submitting."
                    );

                    return null;
                }


                if (
                    cleanedAnswer.length < 10
                ) {

                    setError(
                        "Your answer is too short. Please provide a more detailed response."
                    );

                    return null;
                }


                setEvaluating(
                    true
                );

                setError(null);


                try {

                    const result =
                        await evaluateInterviewAnswer(
                            question.question,
                            cleanedAnswer,
                            {
                                category:
                                    question.category,

                                difficulty:
                                    question.difficulty,
                            }
                        );


                    setEvaluation(
                        result
                    );


                    /* --------------------------------------------
                       Update Statistics
                    -------------------------------------------- */

                    const score =
                        normalizeScore(
                            result.score
                        );


                    setStats(
                        previous => {

                            const previousCount =
                                previous.questionsAnswered;


                            const newCount =
                                previousCount + 1;


                            const totalScore =
                                (
                                    previous.averageScore *
                                    previousCount
                                ) + score;


                            const newAverage =
                                Math.round(
                                    totalScore /
                                    newCount
                                );


                            return {

                                questionsAnswered:
                                    newCount,

                                averageScore:
                                    newAverage,

                                bestScore:
                                    Math.max(
                                        previous.bestScore,
                                        score
                                    ),
                            };
                        }
                    );


                    return result;

                } catch (err: unknown) {

                    const message =
                        getErrorMessage(
                            err,
                            "Unable to evaluate your answer."
                        );


                    console.error(
                        "CareerMind AI interview evaluation:",
                        message
                    );


                    setError(
                        message
                    );


                    return null;

                } finally {

                    setEvaluating(
                        false
                    );
                }
            },
            [
                answer,
                question,
            ]
        );


    /* ========================================================
       RESET INTERVIEW
    ======================================================== */

    const resetInterview =
        useCallback(() => {

            setQuestion(
                null
            );

            setAnswer(
                ""
            );

            setEvaluation(
                null
            );

            setError(
                null
            );

            setStats({
                questionsAnswered: 0,
                averageScore: 0,
                bestScore: 0,
            });

        }, []);


    /* ========================================================
       AUTO START
    ======================================================== */

    useEffect(() => {

        if (
            options?.autoStart === false
        ) {
            return;
        }


        void generateQuestion();

        // Only initialize once.
        // Category/difficulty changes are handled
        // explicitly by the UI.
        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, []);


    /* ========================================================
       COMPUTED SCORE
    ======================================================== */

    const score =
        useMemo(
            () =>
                normalizeScore(
                    evaluation?.score ?? 0
                ),
            [
                evaluation,
            ]
        );


    /* ========================================================
       SCORE LABEL
    ======================================================== */

    const scoreLabel =
        useMemo(
            () =>
                getInterviewScoreLabel(
                    score
                ),
            [
                score,
            ]
        );


    /* ========================================================
       SCORE STATUS
    ======================================================== */

    const scoreStatus =
        useMemo(
            () =>
                getInterviewScoreStatus(
                    score
                ),
            [
                score,
            ]
        );


    /* ========================================================
       READINESS
    ======================================================== */

    const readiness =
        useMemo(
            () =>
                getInterviewReadiness(
                    score
                ),
            [
                score,
            ]
        );


    /* ========================================================
       CATEGORY LABEL
    ======================================================== */

    const categoryLabel =
        useMemo(
            () =>
                getInterviewCategoryLabel(
                    category
                ),
            [
                category,
            ]
        );


    /* ========================================================
       DIFFICULTY LABEL
    ======================================================== */

    const difficultyLabel =
        useMemo(
            () =>
                getInterviewDifficultyLabel(
                    difficulty
                ),
            [
                difficulty,
            ]
        );


    /* ========================================================
       ANSWER LENGTH
    ======================================================== */

    const answerLength =
        answer.length;


    /* ========================================================
       CAN SUBMIT
    ======================================================== */

    const canSubmit =
        Boolean(
            question &&
            answer.trim().length >= 10 &&
            !evaluating &&
            !loadingQuestion
        );


    /* ========================================================
       RETURN API
    ======================================================== */

    return {

        /* Question */

        question,

        loadingQuestion,

        generateQuestion,

        nextQuestion,


        /* Answer */

        answer,

        setAnswer,


        /* Evaluation */

        evaluation,

        evaluating,

        submitAnswer,


        /* Filters */

        category,

        setCategory,

        difficulty,

        setDifficulty,


        /* State */

        error,

        clearError,

        resetInterview,


        /* Statistics */

        stats,


        /* Computed */

        score,

        scoreLabel,

        scoreStatus,

        readiness,

        categoryLabel,

        difficultyLabel,


        /* Validation */

        answerLength,

        canSubmit,
    };
}


/* ============================================================
   DEFAULT EXPORT
============================================================ */

export default useInterview;