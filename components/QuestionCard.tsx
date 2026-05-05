import React from 'react';
import { Question, AnswerOption } from '../types';
import { CheckIcon, XIcon } from './icons';

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  userAnswer?: AnswerOption;
  showAnswers: boolean;
  onAnswerSelect: (questionIndex: number, answer: AnswerOption) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  questionIndex,
  userAnswer,
  showAnswers,
  onAnswerSelect,
}) => {
  const getOptionClasses = (option: AnswerOption): string => {
    let baseClasses =
      'w-full text-left p-4 my-2 border rounded-lg transition-all duration-200 flex items-center space-x-4 cursor-pointer';

    if (showAnswers) {
      const isCorrect = option === question.correctAnswer;
      const isSelected = option === userAnswer;

      if (isCorrect) {
        return `${baseClasses} bg-green-100 dark:bg-green-900/50 border-green-500 ring-2 ring-green-500 text-green-800 dark:text-green-200`;
      }
      if (isSelected && !isCorrect) {
        return `${baseClasses} bg-red-100 dark:bg-red-900/50 border-red-500 text-red-800 dark:text-red-200`;
      }
      return `${baseClasses} border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400`;
    }

    if (userAnswer === option) {
      return `${baseClasses} bg-blue-100 dark:bg-blue-900/50 border-blue-500 ring-2 ring-blue-500`;
    }

    return `${baseClasses} border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:border-slate-400 dark:hover:border-slate-500`;
  };

  const renderFeedbackIcon = (option: AnswerOption) => {
    if (!showAnswers) return <div className="w-6 h-6"></div>;
    
    const isCorrect = option === question.correctAnswer;
    const isSelected = option === userAnswer;

    if (isCorrect) return <CheckIcon className="w-6 h-6 text-green-600 dark:text-green-400" />;
    if (isSelected && !isCorrect) return <XIcon className="w-6 h-6 text-red-600 dark:text-red-400" />;
    
    return <div className="w-6 h-6"></div>;
  };

  return (
    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-md mb-6 border border-slate-200 dark:border-slate-700">
      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-2">{`Question ${questionIndex + 1} of 5`}</p>
      <p className="text-lg font-medium text-slate-800 dark:text-slate-100 mb-4">{question.questionText}</p>
      <div>
        {(['A', 'B', 'C', 'D'] as AnswerOption[]).map((option) => (
          <button
            key={option}
            onClick={() => onAnswerSelect(questionIndex, option)}
            className={getOptionClasses(option)}
            disabled={showAnswers}
          >
            {renderFeedbackIcon(option)}
            <span className="flex-1">
              <span className="font-bold mr-2">{option}.</span>
              {question.options[option]}
            </span>
          </button>
        ))}
      </div>
      {showAnswers && (
        <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-900/70 rounded-lg border border-slate-200 dark:border-slate-700">
          <h4 className="font-bold text-slate-700 dark:text-slate-200">
            Explanation
            <span className="font-normal italic text-sm text-slate-500 dark:text-slate-400 ml-2">({question.questionType})</span>
          </h4>
          <p className="text-slate-600 dark:text-slate-300 mt-2">{question.explanation}</p>
        </div>
      )}
    </div>
  );
};
