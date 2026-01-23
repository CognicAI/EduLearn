'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

// 15 assessment questions from VisionOva model
const ASSESSMENT_QUESTIONS = [
    { id: 1, text: "When I am studying or listening in class, I find it difficult to stay focused for a long period, even when the topic is important.", category: "Attention" },
    { id: 2, text: "I begin homework or assignments with good intention, but my attention shifts to other things before I finish.", category: "Attention" },
    { id: 3, text: "When I am expected to sit quietly (in class or while studying), I feel restless or feel the need to move, fidget, or walk around.", category: "Attention" },
    { id: 4, text: "I forget instructions, homework, or deadlines even when teachers explain them clearly or write them down.", category: "Memory" },
    { id: 5, text: "Reading textbooks, notes, or exam questions takes me more time compared to other students.", category: "Reading" },
    { id: 6, text: "While reading or writing, I sometimes confuse letters, words, spellings, or skip lines unintentionally.", category: "Reading" },
    { id: 7, text: "I understand lessons better when the teacher explains them out loud rather than only giving written material.", category: "Learning" },
    { id: 8, text: "When my daily schedule or routine suddenly changes, I feel uncomfortable, anxious, or upset.", category: "Adaptability" },
    { id: 9, text: "Loud noises, bright lights, strong smells, or crowded places disturb or overwhelm me.", category: "Sensory" },
    { id: 10, text: "I feel more comfortable working alone than working in groups or participating in group discussions.", category: "Social" },
    { id: 11, text: "I prefer instructions that are clear, specific, and step-by-step rather than open-ended or vague tasks.", category: "Learning" },
    { id: 12, text: "I worry a lot about making mistakes in class, tests, or assignments, even when I am prepared.", category: "Anxiety" },
    { id: 13, text: "I feel nervous, anxious, or uncomfortable when speaking or presenting in front of others.", category: "Anxiety" },
    { id: 14, text: "When I feel stressed, anxious, or afraid, it becomes difficult for me to start or complete tasks.", category: "Anxiety" },
    { id: 15, text: "I learn best when lessons are connected to my interests or include visuals, examples, or practical demonstrations.", category: "Learning" }
];

const ANSWER_OPTIONS = [
    { value: 0, label: "Never", description: "This never happens to me" },
    { value: 1, label: "Sometimes", description: "This happens occasionally" },
    { value: 2, label: "Often", description: "This happens frequently" },
    { value: 3, label: "Almost Always", description: "This happens most of the time" }
];

interface AssessmentQuestionsProps {
    answers: number[];
    onAnswersChange: (answers: number[]) => void;
    onComplete: () => void;
    onBack: () => void;
}

export function AssessmentQuestions({
    answers,
    onAnswersChange,
    onComplete,
    onBack
}: AssessmentQuestionsProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [errors, setErrors] = useState<string[]>([]);

    const progress = ((currentQuestion + 1) / ASSESSMENT_QUESTIONS.length) * 100;
    const isLastQuestion = currentQuestion === ASSESSMENT_QUESTIONS.length - 1;
    const currentAnswer = answers[currentQuestion];

    const handleAnswerChange = (value: string) => {
        const newAnswers = [...answers];
        newAnswers[currentQuestion] = parseInt(value, 10);
        onAnswersChange(newAnswers);
        setErrors([]);
    };

    const handleNext = () => {
        if (currentAnswer === undefined || currentAnswer === null) {
            setErrors(['Please select an answer before continuing']);
            return;
        }

        if (isLastQuestion) {
            // Validate all questions are answered
            const unanswered = answers.findIndex((a, i) => a === undefined || a === null);
            if (unanswered !== -1) {
                setErrors([`Please answer all questions. Question ${unanswered + 1} is unanswered.`]);
                setCurrentQuestion(unanswered);
                return;
            }
            onComplete();
        } else {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setErrors([]);
        } else {
            onBack();
        }
    };

    const question = ASSESSMENT_QUESTIONS[currentQuestion];

    return (
        <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="space-y-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl">Learning Style Assessment</CardTitle>
                    <span className="text-sm text-muted-foreground">
                        Question {currentQuestion + 1} of {ASSESSMENT_QUESTIONS.length}
                    </span>
                </div>
                <CardDescription>
                    Help us personalize your learning experience by answering a few questions
                </CardDescription>
                <Progress value={progress} className="h-2" />
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Disclaimer */}
                <Alert>
                    <InfoIcon className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                        This assessment helps us personalize your learning experience. Your responses are
                        confidential and used only to adapt content to your learning preferences. This is
                        not a medical diagnosis.
                    </AlertDescription>
                </Alert>

                {/* Question */}
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-lg font-semibold">
                            {question.text}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                            Category: {question.category}
                        </p>
                    </div>

                    {/* Answer Options */}
                    <RadioGroup
                        key={currentQuestion} // Force re-render when question changes
                        value={currentAnswer !== undefined && currentAnswer !== null ? currentAnswer.toString() : undefined}
                        onValueChange={handleAnswerChange}
                        className="grid grid-cols-1 md:grid-cols-2 gap-3"
                    >
                        {ANSWER_OPTIONS.map((option) => (
                            <div
                                key={option.value}
                                className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent transition-colors cursor-pointer"
                            >
                                <RadioGroupItem
                                    value={option.value.toString()}
                                    id={`q${currentQuestion}-${option.value}`}
                                />
                                <Label
                                    htmlFor={`q${currentQuestion}-${option.value}`}
                                    className="flex-1 cursor-pointer"
                                >
                                    <div className="font-medium">{option.label}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {option.description}
                                    </div>
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                </div>

                {/* Errors */}
                {errors.length > 0 && (
                    <div className="text-sm text-destructive">
                        {errors.map((error, index) => (
                            <p key={index}>{error}</p>
                        ))}
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handlePrevious}
                    >
                        {currentQuestion === 0 ? 'Back to Info' : 'Previous'}
                    </Button>

                    <Button
                        type="button"
                        onClick={handleNext}
                        disabled={currentAnswer === undefined || currentAnswer === null}
                    >
                        {isLastQuestion ? 'Complete Registration' : 'Next'}
                    </Button>
                </div>

                {/* Progress Dots */}
                <div className="flex justify-center gap-1.5 pt-2">
                    {ASSESSMENT_QUESTIONS.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            onClick={() => setCurrentQuestion(index)}
                            className={`h-2 w-2 rounded-full transition-all ${index === currentQuestion
                                ? 'bg-primary w-6'
                                : answers[index] !== undefined && answers[index] !== null
                                    ? 'bg-primary/50'
                                    : 'bg-muted'
                                }`}
                            aria-label={`Go to question ${index + 1}`}
                        />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
