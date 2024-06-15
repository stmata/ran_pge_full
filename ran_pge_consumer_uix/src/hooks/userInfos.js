import { useMemo } from 'react';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { getInitials, getUsername } from '../utils/userUtils'; 

/**
 * Custom hook that provides the current authenticated user's username and initials derived from their email.
 * Utilizes `useAuthUser` to access user authentication details, and employs `getInitials` and `getUsername`
 * from `userUtils` to calculate the username and initials.
 * 
 * The hook calculates these details only when the user's email changes to optimize performance.
 * If no email is found, it returns default values for the username and initials.
 * 
 * @returns {{ username: string, initials: string }} An object containing `username` and `initials` of the authenticated user.
 * `username` is derived from the email, and `initials` are the first letters of the split parts of the email before the @ symbol.
 * Returns default values if the user's email is not available.
 */

export function useUserInfos() {
    const auth = useAuthUser();
    const email = auth?.email;

    // useMemo to recompute only if email changes
    const userDetails = useMemo(() => {
        if (email) {
            const initials = getInitials(email); // Compute initials from email
            const username = getUsername(email); // Compute username from email
            return { username, initials };
        }
        // Default values if no email
        return { username: '!User', initials: '🚫' };
    }, [email]);

    return userDetails;
}
