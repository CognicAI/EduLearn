'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X, CheckCircle, Clock, Brain, Zap } from 'lucide-react';

export function AssessmentBuilder() {
  const [questions, setQuestions] = useState([
    {
      id: 1,
      type: 'multiple-choice',
      question: 'What is the primary purpose of React hooks?',
      options: ['State management', 'DOM manipulation', 'API calls', 'Styling'],
      correct: 0,
      difficulty: 'Medium'
    }
  ]);
  
  const [showPreview, setShowPreview] = useState(false);

  const addQuestion = () => {
    const newQuestion = {
      id: questions.length + 1,
      type: 'multiple-choice',
      question: '',
      options: ['', '', '', ''],
      correct: 0,
      difficulty: 'Medium'
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: number, field: string, value: any) => {
    setQuestions(questions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <Badge className="mb-4 bg-purple-100/80 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
          🎯 AI Assessment Builder Demo
        </Badge>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Create Smart Assessments in Minutes
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Build interactive quizzes with AI-powered question generation and automatic grading.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Builder Interface */}
        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg text-gray-900 dark:text-white">Assessment Builder</CardTitle>
              <Button 
                onClick={() => setShowPreview(!showPreview)}
                variant="outline" 
                size="sm"
                className="hover:scale-105 transition-transform duration-200"
              >
                {showPreview ? 'Edit' : 'Preview'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Assessment Title
                </label>
                <Input 
                  placeholder="React Fundamentals Quiz" 
                  className="input-enhanced"
                  defaultValue="React Fundamentals Quiz"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <Textarea 
                  placeholder="Test your knowledge of React basics..." 
                  className="input-enhanced resize-none"
                  rows={3}
                  defaultValue="Test your knowledge of React basics including components, hooks, and state management."
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time Limit
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <Input type="number" placeholder="30" className="input-enhanced" defaultValue="30" />
                    <span className="text-sm text-gray-500">minutes</span>
                  </div>
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Passing Score
                  </label>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    <Input type="number" placeholder="70" className="input-enhanced" defaultValue="70" />
                    <span className="text-sm text-gray-500">%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Generation Tools */}
          <Card className="glass-card bg-gradient-to-br from-purple-50/50 to-blue-50/50 dark:from-purple-900/20 dark:to-blue-900/20">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                AI Question Generator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Topic or Content
                </label>
                <Input 
                  placeholder="React hooks and state management" 
                  className="input-enhanced"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Question Type
                  </label>
                  <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                    <option>Multiple Choice</option>
                    <option>True/False</option>
                    <option>Short Answer</option>
                  </select>
                </div>
              </div>
              
              <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 cta-button">
                <Zap className="h-4 w-4 mr-2" />
                Generate Questions with AI
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Questions List or Preview */}
        <div className="space-y-4">
          {showPreview ? (
            /* Assessment Preview */
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Assessment Preview</CardTitle>
                <p className="text-sm text-gray-600 dark:text-gray-400">Student view of the assessment</p>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">React Fundamentals Quiz</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Test your knowledge of React basics including components, hooks, and state management.
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      30 minutes
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      70% to pass
                    </span>
                  </div>
                </div>

                {questions.map((q, index) => (
                  <div key={q.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {index + 1}. {q.question || 'Sample question text...'}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {q.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {q.options.map((option, optionIndex) => (
                        <label key={optionIndex} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 p-2 rounded">
                          <input 
                            type="radio" 
                            name={`question-${q.id}`} 
                            className="text-blue-600"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {option || `Option ${optionIndex + 1}`}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}

                <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  Submit Assessment
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* Question Builder */
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Questions ({questions.length})</h3>
                <Button 
                  onClick={addQuestion}
                  size="sm" 
                  className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Question
                </Button>
              </div>

              {questions.map((question, index) => (
                <Card key={question.id} className="glass-card interactive-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Question {index + 1}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {question.difficulty}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeQuestion(question.id)}
                          className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      placeholder="Enter your question..."
                      value={question.question}
                      onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                      className="input-enhanced"
                    />
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Options:</label>
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${question.id}`}
                            checked={question.correct === optionIndex}
                            onChange={() => updateQuestion(question.id, 'correct', optionIndex)}
                            className="text-green-600"
                          />
                          <Input
                            placeholder={`Option ${optionIndex + 1}`}
                            value={option}
                            onChange={(e) => {
                              const newOptions = [...question.options];
                              newOptions[optionIndex] = e.target.value;
                              updateQuestion(question.id, 'options', newOptions);
                            }}
                            className="input-enhanced flex-1"
                          />
                          <CheckCircle className={`h-4 w-4 ${question.correct === optionIndex ? 'text-green-500' : 'text-gray-300 dark:text-gray-600'}`} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center gap-4">
        <Button variant="outline" className="hover:scale-105 transition-transform duration-200">
          Save as Draft
        </Button>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 cta-button hover:scale-105 transition-transform duration-200">
          Publish Assessment
        </Button>
      </div>
    </div>
  );
}
