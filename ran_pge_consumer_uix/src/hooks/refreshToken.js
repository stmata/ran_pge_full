import createRefresh from 'react-auth-kit/createRefresh';

/**
 * Function for refreshing authentication tokens.
 *
 * @typedef {Object} RefreshResult
 * @property {boolean} isSuccess - Indicates whether the refresh was successful.
 * @property {string|null} newAuthToken - The new access token generated during the refresh.
 * @property {Date|null} newAuthTokenExpireIn - The expiration date of the new access token.
 * @property {Date|null} newRefreshTokenExpiresIn - The expiration date of the new refresh token.
 *
 * @param {Object} param - The parameters required for the refresh.
 * @param {string} param.authToken - The current access token.
 * @returns {Promise<RefreshResult>} A promise that resolves with the refresh result.
 */
const serverUrl = process.env.REACT_APP_SERVER_URL
const refresh = createRefresh({
    interval: 20,
    refreshApiCallback: async (param) => {
        try {
            const response = await fetch(`${serverUrl}/refresh`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${param.authToken}`
                },
                body: JSON.stringify(param)
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            console.log("Refreshing");
            const newAuthTokenExpireIn = new Date(data.accessTokenExpiresAt);
            const newRefreshTokenExpiresIn = new Date(data.refreshTokenExpiresAt);
            return {
                isSuccess: true,
                newAuthToken: data.accessToken,
                newAuthTokenExpireIn: newAuthTokenExpireIn,
                newRefreshTokenExpiresIn: newRefreshTokenExpiresIn
            };
        } catch(error) {
            console.error(error);
            return {
                isSuccess: false
            };
        }
    }
});

export default refresh;
