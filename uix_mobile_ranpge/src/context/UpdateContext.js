// UpdateContext.js
import React, { useContext, useState, useCallback } from 'react';

const UpdateContext = React.createContext({
  refresh: () => {},
  triggerRefresh: () => {},
});

export const useUpdate = () => useContext(UpdateContext);

export const UpdateProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
  }, []);

  return (
    <UpdateContext.Provider value={{ refresh: refreshKey, triggerRefresh }}>
      {children}
    </UpdateContext.Provider>
  );
};
