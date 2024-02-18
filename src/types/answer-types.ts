export type DisplayQuestionResultsMessage = {
    event: string;
    id: string;
    message: {
        question: number;
    };
};

export type AnswerQuestionMessage = {
    event: string;
    id: string;
    message: {
        question: number;
        answer: number;
        is_correct: boolean;
    };
};
