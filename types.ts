
export type AnswerOption = 'A' | 'B' | 'C' | 'D';

export interface Question {
  questionType: string;
  questionText: string;
  options: {
    [key in AnswerOption]: string;
  };
  correctAnswer: AnswerOption;
  explanation: string;
}

export interface PassageContent {
  title: string;
  passage: string;
  questions: Question[];
}
