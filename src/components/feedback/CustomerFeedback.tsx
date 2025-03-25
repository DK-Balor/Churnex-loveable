
import React, { useState } from 'react';
import { useToast } from '../ui/use-toast';

interface Question {
  id: string;
  text: string;
  type: 'rating' | 'text';
}

interface FeedbackFormProps {
  onSubmit: (feedback: any) => void;
  onCancel: () => void;
  customerName: string;
}

const FEEDBACK_QUESTIONS: Question[] = [
  { id: 'satisfaction', text: 'How satisfied are you with our product overall?', type: 'rating' },
  { id: 'features', text: 'Which features do you find most valuable?', type: 'text' },
  { id: 'missing', text: 'What features or improvements would make you more likely to continue using our product?', type: 'text' },
  { id: 'competitors', text: 'Are you currently evaluating any alternative solutions?', type: 'text' },
  { id: 'recommendation', text: 'How likely are you to recommend our product to others?', type: 'rating' }
];

export default function CustomerFeedback({ onSubmit, onCancel, customerName }: FeedbackFormProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const { toast } = useToast();

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    const currentQuestionId = FEEDBACK_QUESTIONS[currentQuestion].id;
    if (!answers[currentQuestionId] && FEEDBACK_QUESTIONS[currentQuestion].type === 'rating') {
      toast({
        title: "Please provide an answer",
        description: "Please select a rating before continuing.",
        variant: "destructive",
      });
      return;
    }
    
    if (currentQuestion < FEEDBACK_QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = () => {
    // Check if we have at least some answers
    if (Object.keys(answers).length < 2) {
      toast({
        title: "Incomplete feedback",
        description: "Please answer at least a few questions to submit feedback.",
        variant: "destructive",
      });
      return;
    }
    
    onSubmit(answers);
    toast({
      title: "Feedback submitted",
      description: "Thank you for your valuable feedback!",
    });
  };

  const renderRatingQuestion = (question: Question) => {
    const currentRating = answers[question.id] || 0;
    
    return (
      <div>
        <p className="mb-4 text-gray-700">{question.text}</p>
        <div className="flex justify-center items-center space-x-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
            <button
              key={rating}
              onClick={() => handleAnswer(question.id, rating)}
              className={`h-10 w-10 rounded-full ${
                currentRating === rating
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Not at all</span>
          <span>Extremely</span>
        </div>
      </div>
    );
  };

  const renderTextQuestion = (question: Question) => {
    return (
      <div>
        <p className="mb-4 text-gray-700">{question.text}</p>
        <textarea
          value={answers[question.id] || ''}
          onChange={(e) => handleAnswer(question.id, e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
          placeholder="Type your answer here..."
        />
      </div>
    );
  };

  const currentQuestionData = FEEDBACK_QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / FEEDBACK_QUESTIONS.length) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Customer Feedback</h2>
            <button 
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-600">
              Help us understand how we can better serve {customerName}. Your feedback is valuable to us.
            </p>
          </div>
          
          <div className="mb-4 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="my-8">
            {currentQuestionData.type === 'rating' 
              ? renderRatingQuestion(currentQuestionData)
              : renderTextQuestion(currentQuestionData)
            }
          </div>
          
          <div className="flex justify-between mt-8">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className={`px-4 py-2 border border-gray-300 rounded-md ${
                currentQuestion === 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Previous
            </button>
            
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {currentQuestion < FEEDBACK_QUESTIONS.length - 1 ? 'Next' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
