export interface ParsedAnswer {
  text: string;
  isCorrect: boolean;
}

export interface QuizItem {
  id: number;
  question: string;
  answers: ParsedAnswer[];
  isValid: boolean;
  validationErrors: string[];
}

export const KAHOOT_LIMITS = {
  question: 120,
  answer: 75,
};