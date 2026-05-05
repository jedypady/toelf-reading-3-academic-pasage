import React, { useState, useCallback, useEffect } from 'react';
import { generatePassageAndQuestions } from './services/geminiService';
import { PassageContent, Question, AnswerOption } from './types';
import { QuestionCard } from './components/QuestionCard';

const App: React.FC = () => {
  const [passageContent, setPassageContent] = useState<PassageContent | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, AnswerOption>>({});
  const [showAnswers, setShowAnswers] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [vocabularyWord, setVocabularyWord] = useState<string | null>(null);

  useEffect(() => {
    if (passageContent) {
      const vocabQuestion = passageContent.questions.find(
        (q) => q.questionType === 'Vocabulary in Context'
      );
      if (vocabQuestion) {
        // Extracts the word from a format like "The word 'exquisite' in the passage..."
        const match = vocabQuestion.questionText.match(/'([^']+)'/);
        if (match && match[1]) {
          setVocabularyWord(match[1]);
        } else {
          setVocabularyWord(null);
        }
      } else {
        setVocabularyWord(null);
      }
    } else {
        setVocabularyWord(null);
    }
  }, [passageContent]);

  const handleGenerate = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setPassageContent(null);
    setUserAnswers({});
    setShowAnswers(false);

    try {
      const content = await generatePassageAndQuestions();
      setPassageContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAnswerSelect = (questionIndex: number, answer: AnswerOption) => {
    if (showAnswers) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };
  
  const allQuestionsAnswered = passageContent ? Object.keys(userAnswers).length === passageContent.questions.length : false;

  const renderHighlightedPassage = (passage: string, word: string | null) => {
    if (!word) {
      return passage.split('\n').map((paragraph, index) => (
        paragraph.trim() ? <p key={index}>{paragraph}</p> : null
      ));
    }

    const regex = new RegExp(`(\\b${word}\\b)`, 'gi');

    return passage.split('\n').map((paragraph, pIndex) => {
      if (!paragraph.trim()) return null;
      
      const parts = paragraph.split(regex);

      return (
        <p key={pIndex}>
          {parts.map((part, partIndex) =>
            part.toLowerCase() === word.toLowerCase() ? (
              <mark key={partIndex} className="bg-yellow-300 dark:bg-yellow-700/80 text-slate-900 dark:text-slate-100 px-1 rounded-md font-semibold">
                {part}
              </mark>
            ) : (
              <React.Fragment key={partIndex}>{part}</React.Fragment>
            )
          )}
        </p>
      );
    });
  };

  const MainContent: React.FC = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-medium">Generating your practice set...</p>
          <p className="text-slate-500 dark:text-slate-400">This may take a moment.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center p-8 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-lg">
          <h3 className="text-xl font-bold mb-2">An Error Occurred</h3>
          <p>{error}</p>
          <p className="mt-2 text-sm">Please check your API key and network connection, then try again.</p>
        </div>
      );
    }
    
    if (!passageContent) {
      return (
        <div className="text-center py-16 px-4">
          <h2 className="text-3xl font-bold mb-2">Welcome to TOEFL Reading Practice</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300">Click the button below to generate a new academic passage and questions.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-12">
        <div className="lg:sticky top-8 self-start">
          <article className="bg-white dark:bg-slate-800/50 p-6 rounded-xl shadow-md border border-slate-200 dark:border-slate-700">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">{passageContent.title}</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-justify space-y-4">
              {renderHighlightedPassage(passageContent.passage, vocabularyWord)}
            </div>
          </article>
        </div>
        <div>
          {passageContent.questions.map((q, i) => (
            <QuestionCard
              key={i}
              question={q}
              questionIndex={i}
              userAnswer={userAnswers[i]}
              showAnswers={showAnswers}
              onAnswerSelect={handleAnswerSelect}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen font-sans">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100">
            TOEFL<span className="font-light text-slate-500 dark:text-slate-400"> Reading Practice</span>
          </h1>
          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75 transition-all duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generating..." : "New Passage"}
          </button>
        </div>
      </header>
      
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        <MainContent />
      </main>

      {passageContent && !isLoading && (
        <footer className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky bottom-0 z-10 border-t border-slate-200 dark:border-slate-700 py-4">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
            <button
              onClick={() => setShowAnswers(!showAnswers)}
              disabled={!allQuestionsAnswered}
              className="px-8 py-3 bg-green-600 text-white font-bold text-lg rounded-lg shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 transition-all duration-200 disabled:bg-slate-400 disabled:text-slate-200 disabled:cursor-not-allowed"
            >
              {showAnswers ? "Practice Again" : "Check Answers"}
            </button>
          </div>
          {!allQuestionsAnswered && !showAnswers && (
             <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-2">
              Please answer all questions before checking.
            </p>
          )}
        </footer>
      )}
    </div>
  );
};

export default App;
