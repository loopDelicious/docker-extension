import { createContext, FC, useContext, useState } from "react";

interface IApiContext {
    apiKey: string,
    setApiKey: (v: string) => void,
}
const ApiContext = createContext<IApiContext>({
    apiKey: '',
    setApiKey: () => undefined,
});

const LOCAL_STORAGE_KEY = 'newman::apiKey';

export const ApiContextProvider: FC = ({children}) => {
    const [apiKey, setApiKey] = useState(localStorage.getItem(LOCAL_STORAGE_KEY) || '');
    const setApiKeyInLocalStorage = (value: string) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, value);
        setApiKey(value);
    }
    return <ApiContext.Provider value={{apiKey, setApiKey: setApiKeyInLocalStorage}}>{children}</ApiContext.Provider>
}

export const useApiContext = () => useContext(ApiContext);