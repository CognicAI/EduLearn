import axios, { AxiosError } from 'axios';

const VISIONOVA_API_URL = process.env.VISIONOVA_API_URL || 'http://localhost:5000';
const VISIONOVA_API_TIMEOUT = parseInt(process.env.VISIONOVA_API_TIMEOUT || '10000', 10);

export type LearningStyleClassification =
    | 'ADHD'
    | 'Dyslexia'
    | 'Anxiety'
    | 'Autism Spectrum'
    | 'Neurotypical';

export type DatabaseLearningStyle =
    | 'ADHD'
    | 'Dyslexia'
    | 'Anxiety'
    | 'Autism Spectrum'
    | 'General';

interface VisionOvaResponse {
    prediction: LearningStyleClassification;
}

interface VisionOvaErrorResponse {
    error: string;
}

/**
 * Maps VisionOva ML classification to database learning style values
 * Neurotypical -> General (as per user requirement)
 */
function mapClassificationToDbValue(classification: LearningStyleClassification): DatabaseLearningStyle {
    if (classification === 'Neurotypical') {
        return 'General';
    }
    return classification as DatabaseLearningStyle;
}

/**
 * Validates assessment answers array
 * Must be exactly 15 numbers, each between 0-3
 */
function validateAnswers(answers: number[]): boolean {
    if (!Array.isArray(answers) || answers.length !== 15) {
        return false;
    }

    return answers.every(answer =>
        typeof answer === 'number' &&
        answer >= 0 &&
        answer <= 3 &&
        Number.isInteger(answer)
    );
}

/**
 * Classifies user's learning style based on assessment answers
 * Calls VisionOva ML service and maps result to database values
 * 
 * @param answers - Array of 15 integers (0-3) representing assessment responses
 * @returns Database learning style value or 'General' on failure
 */
export async function classifyLearningStyle(answers: number[]): Promise<DatabaseLearningStyle> {
    try {
        // Validate input
        if (!validateAnswers(answers)) {
            console.error('[VisionOva] Invalid assessment answers:', answers);
            return 'General';
        }

        console.log('[VisionOva] Calling ML service for classification...');

        // Call VisionOva ML service
        const response = await axios.post<VisionOvaResponse>(
            `${VISIONOVA_API_URL}/predict`,
            { answers },
            {
                timeout: VISIONOVA_API_TIMEOUT,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        const classification = response.data.prediction;
        const dbValue = mapClassificationToDbValue(classification);

        console.log(`[VisionOva] Classification successful: ${classification} -> ${dbValue}`);

        return dbValue;
    } catch (error) {
        // Handle errors gracefully - always fallback to 'General'
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError<VisionOvaErrorResponse>;

            if (axiosError.code === 'ECONNREFUSED') {
                console.error('[VisionOva] Service unavailable - connection refused');
            } else if (axiosError.code === 'ETIMEDOUT' || axiosError.code === 'ECONNABORTED') {
                console.error('[VisionOva] Service timeout - request took too long');
            } else if (axiosError.response) {
                console.error('[VisionOva] Service error:', axiosError.response.status, axiosError.response.data);
            } else {
                console.error('[VisionOva] Network error:', axiosError.message);
            }
        } else {
            console.error('[VisionOva] Unexpected error:', error);
        }

        console.log('[VisionOva] Falling back to "General" learning style');
        return 'General';
    }
}

/**
 * Checks if VisionOva service is available
 * Used for health checks and monitoring
 */
export async function checkVisionOvaHealth(): Promise<boolean> {
    try {
        const response = await axios.get(`${VISIONOVA_API_URL}/health`, {
            timeout: 5000,
        });
        return response.status === 200;
    } catch (error) {
        console.error('[VisionOva] Health check failed:', error);
        return false;
    }
}

/**
 * Gets VisionOva service configuration
 */
export function getVisionOvaConfig() {
    return {
        apiUrl: VISIONOVA_API_URL,
        timeout: VISIONOVA_API_TIMEOUT,
    };
}
