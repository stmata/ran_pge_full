import { useMemo } from 'react';
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { getInitials, getUsername } from '../utils/userUtils'; 

export function useUserInfos() {
    const auth = useAuthUser();
    const email = auth?.email;

    const userDetails = useMemo(() => {
        if (email) {
            const initials = getInitials(email);
            const username = getUsername(email);
            return { username, initials };
        }
        return { username: '!User', initials: '🚫' };
    }, [email]);

    return userDetails;
}
