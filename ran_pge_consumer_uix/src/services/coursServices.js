const serverUrl = process.env.REACT_APP_SERVER_URL
/**
 * Provides a collection of service methods for interacting with the course API.
 * These methods are designed to facilitate the retrieval of course information based on the user's academic level,
 * offering a streamlined way to access and manage course-related data.
 */

const CoursServices = {

    /**
     * Asynchronously retrieves course information for a specific academic level.
     * Sends a request to the course API and returns the course data for the specified level.
     * This method is particularly useful within educational applications where access to course information is essential.
     * 
     * @param {string} level - The academic level for which course information is being requested (e.g., "Undergraduate", "Postgraduate").
     * @returns {Promise<{success: boolean, data: Object|undefined, error: string|undefined}>} A promise that resolves to an object indicating the success of the operation and containing the retrieved course data if successful, or an error message in case of failure.
     */
    async getInfosCours(level) {
        try {
            const response = await fetch( `${serverUrl}/get_user_courses/${level}`, {
                method: 'POST'
            });
    
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
            }
    
            const data = await response.json();
            //console.log(data[0])
            return { success: true, data: data[0] };
        } catch (error) {
            return { error: error };
        }
      },

      /**
     * Asynchronously sends a click event to the server to check and save the interaction.
     * This method is useful for tracking user interactions with course documents or other resources.
     * 
     * @param {string} userId - The ID of the user performing the click action.
     * @param {string} targetType - The type of the target being clicked (e.g., 'course' or 'document').
     * @param {string} targetId - The ID of the target being clicked (e.g., ID of the course or document).
     * @returns {Promise<{success: boolean, error: string|undefined}>} A promise that resolves to an object indicating the success of the operation or an error message in case of failure.
     */
    async sendClickBtn(userId, targetType, targetId) {
        try {
            const response = await fetch(`${serverUrl}/click_checkandsave`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    target_type: targetType,
                    target_id: targetId
                })
            });

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            //console.log(data)
            return { success: true, data: data };
        } catch (error) {
            return { error: error };
        }
    }

}

export default CoursServices;
