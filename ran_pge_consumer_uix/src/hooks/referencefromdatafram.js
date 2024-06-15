import { useState } from 'react';
import Evaluationservices from '../services/evaluationServices';

/**
 * Custom hook that retrieves references corresponding to the provided questions from the backend.
 * @returns {{ loading: boolean, error: string|null, getQuestionReferences: function }} An object containing loading state, error message, and the function to retrieve question references.
 * `loading` indicates whether the operation is in progress.
 * `error` contains the error message, if any.
 * `getQuestionReferences` is the function to retrieve question references.
 */
const useGetReferencesFromDatafram = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Retrieves references corresponding to the provided questions from the backend.
     * @param {string[]} questions - List of questions.
     * @param {string} folder_name - Name of the folder containing the data.
     * @param {string|null} file_name - Name of the file containing the data (optional).
     * @returns {string[]} Array of references corresponding to the questions.
     */
    const getQuestionReferences = async (questions, coursSelected,level,folder_name, file_name = null) => {
        try {
            setLoading(true);

            let referencesData;
            if (file_name) {
                const { success, data } = await Evaluationservices.getReferences(coursSelected,level,folder_name, file_name);
                if (!success) {
                    throw new Error(data.message || 'Failed to fetch references');
                }
                referencesData = data;
            } else {
                const { success, data } = await Evaluationservices.getReferences(coursSelected,level,folder_name);
                if (!success) {
                    throw new Error(data.message || 'Failed to fetch references');
                }
                referencesData = data;
            }

            // Filter references corresponding to the questions
            const questionReferences = questions.map(question => {
                const reference = referencesData.find(item => item[0] === question);
                return reference ? reference[1] : 'Reference not found';
            });

            setLoading(false);
            return questionReferences;
        } catch (error) {
            setLoading(false);
            setError(error.message || 'An unexpected error occurred.');
            return [];
        }
    };

    return { loading, error, getQuestionReferences };
};

export default useGetReferencesFromDatafram;
