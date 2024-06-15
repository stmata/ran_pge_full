const serverUrl = process.env.REACT_APP_SERVER_URL
const processDataUrl = process.env.REACT_APP_MIDDLEWARE_AGENT
/**
 * Collection of service methods related to evaluation functionalities. 
 * These methods include generating quiz questions, saving evaluation notes, and retrieving a user's evaluation notes,
 * facilitating interactions with a remote server to manage and retrieve evaluation-related data.
 */
const Evaluationservices = {

    /**
     * Generates quiz questions for a specific evaluation.
     * Sends a POST request to the server to retrieve a predefined set of questions for an evaluation quiz.
     * 
     * @returns {Promise<{success: boolean, data: Object|undefined, error: string|undefined}>} A promise that resolves to an object indicating the success of the operation and containing the fetched questions, or an error message if the operation fails.
     */
    async generateQuestions (module,level,chapterName,nbrinnerList) {
        try {
            const response = await fetch(`${serverUrl}/evalutionwithprompt`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    module : module,
                    level : level,
                    topicsName : chapterName,
                    nbrinnerList : nbrinnerList
                }),
            });
   
            if (!response.ok) {
                throw new Error('Failed to fetch questions');
            }

            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { error: error };
        }
    },

    /**
     * Saves a user's evaluation note to the server.
     * Submits evaluation details including the course name, note (score), time spent, and chapter name to the server.
     * The server processes these details and saves them accordingly.
     * 
     * @param {string} userId - The ID of the user for whom the evaluation note is being saved.
     * @param {Object} noteData - The evaluation data to be saved, structured as follows:
     *                            {
     *                              "courseName": "Marketing",
     *                              "note": "90",
     *                              "time": 500,
     *                              "chapterName": "Chapter 1"
     *                            }
     * @returns {Promise<{success: boolean, data: Object|undefined, error: string|undefined}>} A promise that resolves to an object indicating the success of the operation and containing the saved evaluation data, or an error message if the operation fails.
     */

    async saveNote(userId, noteData) {
        try {
            const response = await fetch(`${serverUrl}/users/${userId}/evaluation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(noteData)
            });

            if (!response.ok) {
                throw new Error('Failed to save note');
            }

            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { error: error.message || "An unexpected error occurred." };
        }
        
    },

    /**
     * Retrieves saved evaluation notes for a specific user from the server.
     * Sends a GET request to fetch all evaluation notes related to a user, which may include detailed scores and responses.
     * 
     * @param {string} userId - The ID of the user whose evaluation notes are to be retrieved.
     * @returns {Promise<{success: boolean, data: Object|undefined, error: string|undefined}>} A promise that resolves to an object indicating the success of the operation and containing the user's evaluation notes, or an error message if the operation fails.
     */
    async getEvaluationNotes(userId) {
        try {
            const response = await fetch(`${serverUrl}/users/${userId}/evaluation`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            //console.log(response)
            if (response.status === 404) {
                // User has no evaluation notes
                return { success: false, message: 'No evaluation notes found for this user' };
            }
    
            if (!response.ok) {
                throw new Error('Failed to fetch evaluation notes');
            }
    
            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { error: error.message || "An unexpected error occurred." };
        }
    },
    
    /**
 * Sends evaluation data to the server for storage.
 * This function accepts optional documentName and selectedValue parameters. If provided, they will be included in the request data.
 *
 * @param {string} level - The level of the document (e.g. "beginner", "intermediate", etc.)
 * @param {string} module - The name of the module of the document
 * @param {string} userId - The unique identifier of the user
 * @param {string} [documentName] - Optional. The name of the document
 * @param {string} [selectedValue] - Optional. The name of the selected chapter
 * @returns {Promise<{success: boolean, data: boolean|undefined, error: boolean|undefined}>} An object with a success property indicating whether the request was successful, and a data property indicating whether the server successfully stored the evaluation data.
 */
    async sendEvaluationData(level, module, documentName = null) {
        let requestData;

        if (documentName !== null) {
            requestData = {
            level: level,
            module: module,
            topicsName: documentName
            };
        } else {
            requestData = {
            level: level,
            module: module,
            };
        }
        try {
            const response = await fetch(`${serverUrl}/evalution`, { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });
            if (!response.ok) {
              throw new Error("Failed to send evaluation data");
            }
            const data = await response.json();
            return { success: true, data: data.success };
        } catch (error) {
            return {  error: "Error sending data: " + error.message };
        }
    },
    /**
         * Asynchronous function to check data reference.
         * @async
         * @function checkReference
         * @param {object} data The data to process.
         * @returns {Promise<{success: boolean, response: string|undefined, error: string|undefined}>} A promise containing an object with processed data in case of success and an error indication in case of failure.
         */
    async checkReference(data) {
        try {
            // Performs a POST request to process the data
          const response = await fetch(`${processDataUrl}/process-data`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({question : data})
          });
          // Checks if the response of the request is OK
          if (!response.ok) {
            throw new Error('Failed to process data');
          }
          // Returns an object indicating success with the processed data
          const processedData = await response.json();
          return { success: true, data: processedData };
        } catch (error) {
          return { error: error.message || "An unexpected error occurred." };
        }
      },

    /**
     * Adds initial evaluation data for a user.
     * Sends a POST request to the server to add initial evaluation data for a user.
     *
     * @param {string} userId - The ID of the user for whom the initial evaluation data is being added.
     * @param {Object} evaluationData - The initial evaluation data to be added, structured as follows:
     *                                  {
     *                                    "courseName": "Marketing",
     *                                    "quizEvaluated": false/true or "openEvaluated": true/false,
     *                                    "date": "2024-05-13"
     *                                  }
     * @returns {Promise<{success: boolean, data: Object|undefined, error: string|undefined}>} A promise that resolves to an object indicating the success of the operation and containing the added evaluation data, or an error message if the operation fails.
     */
    async addInitialEvaluation(userId, evaluationData) {
        try {
            const response = await fetch(`${serverUrl}/users/${userId}/add_evaluation_initiale`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(evaluationData)
            });

            if (!response.ok) {
                throw new Error('Failed to add initial evaluation data');
            }

            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { error: error.message || "An unexpected error occurred." };
        }
    },

    /**
     * Updates initial evaluation data for a user.
     * Sends a PUT request to the server to update initial evaluation data for a user.
     *
     * @param {string} userId - The ID of the user for whom the initial evaluation data is being updated.
     * @param {Object} updatedData - The updated evaluation data, structured as follows:
     *                                  {
     *                                    "courseName": "Marketing",
     *                                    "quizEvaluated": true,
     *                                    "openEvaluated": false
     *                                  }
     * @returns {Promise<{success: boolean, data: Object|undefined, error: string|undefined}>} A promise that resolves to an object indicating the success of the operation and containing the updated evaluation data, or an error message if the operation fails.
     */
    async updateInitialEvaluation(userId, updatedData) {
        try {
            const response = await fetch(`${serverUrl}/users/${userId}/up_evaluation_initiale`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedData)
            });

            if (!response.ok) {
                throw new Error('Failed to update initial evaluation data');
            }

            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { error: error.message || "An unexpected error occurred." };
        }
    },

    /**
     * Retrieves initial evaluation data for a user.
     * Sends a GET request to the server to retrieve initial evaluation data for a user.
     *
     * @param {string} userId - The ID of the user for whom the initial evaluation data is to be retrieved.
     * @returns {Promise<{success: boolean, data: Object|undefined, error: string|undefined}>} A promise that resolves to an object indicating the success of the operation and containing the initial evaluation data for the user, or an error message if the operation fails.
     */
    async getInitialEvaluation(userId) {
        try {
            const response = await fetch(`${serverUrl}/users/${userId}/get_evaluation_initiale`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 404) {
                // User has no initial evaluation data
                return { success: false, message: 'No initial evaluation data found for this user' };
            }

            if (!response.ok) {
                throw new Error('Failed to fetch initial evaluation data');
            }

            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { error: error.message || "An unexpected error occurred." };
        }
    },

    /**
     * Fetches evaluation data along with a dataframe from the server for a specific subfolder.
     * @param {string} subfolderName - The name of the subfolder for which evaluation data is requested.
     * @returns {Promise<{success: boolean, data: any} | {error: string}>} A promise that resolves with an object containing the evaluation data and dataframe if successful, or an error message if unsuccessful.
     */
    async getEvaluationGeneral(courseName,level,subfolderName) {
        try {
            const response = await fetch(`${serverUrl}/evalgeneralwithdatafram/${subfolderName}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    courseName : courseName,
                    level : level
                })
            });
            if (!response.ok) {
                throw new Error('Failed to fetch evaluation questions');
            }

            const data = await response.json();
            //console.log(data)
            return { success: true, data: data };
        } catch (error) {
            return { error: error.message || 'An unexpected error occurred.' };
        }
    },

    /**
     * Fetches open questions along with a dataframe from the server for a specific file.
     * @param {string} fileName - The name of the file for which open questions are requested.
     * @returns {Promise<{success: boolean, data: any} | {error: string}>} A promise that resolves with an object containing the open questions and dataframe if successful, or an error message if unsuccessful.
     */
    async getOpenQuestions(courseName,level,fileName) {
        try {
            const response = await fetch(`${serverUrl}/qouvertewithdatafram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    courseName: courseName,
                    level: level, 
                    fileName: fileName 
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch open questions');
            }

            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { error: error.message || 'An unexpected error occurred.' };
        }
    },

    /**
     * Fetches QCM (multiple-choice questions) along with a dataframe from the server for a specific file.
     * @param {string} fileName - The name of the file for which QCM questions are requested.
     * @returns {Promise<{success: boolean, data: any} | {error: string}>} A promise that resolves with an object containing the QCM questions and dataframe if successful, or an error message if unsuccessful.
     */
    async getQCMQuestions(courseName,level,fileName) {
        try {
            const response = await fetch(`${serverUrl}/qcmwithdatafram`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    courseName: courseName,
                    level: level,
                    fileName: fileName 
                })
            });

            if (!response.ok) {
                throw new Error('Failed to fetch QCM questions');
            }

            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { error: error.message || 'An unexpected error occurred.' };
        }
    },

    /**
     * Récupère les références à partir du serveur.
     *
     * @param {string} folder - Le nom du sous-dossier contenant le fichier DataFrame.
     * @param {string} [fileName] - Le nom du fichier DataFrame (optionnel).
     * @returns {Promise<{success: boolean, data: Object|undefined, error: string|undefined}>} - Une promesse qui résout avec un objet indiquant le succès de l'opération et contenant les références récupérées, ou un message d'erreur en cas d'échec.
     */
    async getReferences(courseName,level,folder, fileName = null) {
        try {
            let endpoint = `${serverUrl}/getReferenceswithdatafram`;

            const requestOptions = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    courseName: courseName,
                    level: level,
                    folder: folder,
                    fileName: fileName
                })
            };

            const response = await fetch(endpoint, requestOptions);

            if (!response.ok) {
                throw new Error('Failed to fetch references');
            }

            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { error: error.message || 'An unexpected error occurred.' };
        }
    },

    /**
     * Compares a list of user answers with the correct answers using the backend.
     *
     * @param {Array} responsesList - List of objects containing questions, user responses, and correct responses.
     * @returns {Promise<{success: boolean, results: Array|undefined, error: string|undefined}>} A promise that resolves to an object indicating the success of the operation and containing the comparison results, or an error message if the operation fails.
     */
    async compareAnswers(responsesList) {
        try {
            const response = await fetch(`${serverUrl}/compare_answers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ listToCorrect :responsesList })
            });

            if (!response.ok) {
                throw new Error('Failed to compare answers');
            }

            const data = await response.json();
            return { success: true, results: data.results };
        } catch (error) {
            return { error: error.message || 'An unexpected error occurred.' };
        }
    },

    /**
     * Generates a study plan for the student based on the questions they answered incorrectly.
     * Sends a POST request to the server to retrieve a detailed study plan for each module based on the provided questions.
     * 
     * @param {Object} questionsByModule - A dictionary where the keys are module names and values are arrays of question texts.
     * @param {string} cours - The name of the course.
     * @param {string} level - The level of the course.
     * @returns {Promise<{success: boolean, data: Object|undefined, error: string|undefined}>} A promise that resolves to an object indicating the success of the operation and containing the generated study plans, or an error message if the operation fails.
     */
    async generateStudyPlan(questionsByModule, cours, level) {
        try {
            const response = await fetch(`${serverUrl}/getPlans`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    questions: questionsByModule,
                    cours: cours,
                    level: level
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate study plan');
            }

            const data = await response.json();
            return { success: true, data: data };
        } catch (error) {
            return { error: error.message || 'An unexpected error occurred.' };
        }
    },

    /**
     * Retrieves the status of data from the server for a specific course, level, and evaluation type.
     * Sends a GET request to fetch the status of data stored on the server for a given course, level, and evaluation type.
     * 
     * @param {string} course - The name of the course for which data status is requested.
     * @param {string} level - The level of the course for which data status is requested.
     * @param {string} evaluation_type - The type of evaluation for which data status is requested.
     * @returns {Promise<{success: boolean, data: boolean|string|undefined, error: string|undefined}>} A promise that resolves to an object indicating the success of the operation and containing the status of the requested data, or an error message if the operation fails.
     */
    async getStatus(course, level, evaluation_type) {
        try {
            const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/checkstatusofdatafram/${course}/${level}/${evaluation_type}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to get status');
            }

            const data = await response.json();
            return { success: true, data: data.status };
        } catch (error) {
            return { error: error.message || "An unexpected error occurred." };
        }
    }

};

export default Evaluationservices;
