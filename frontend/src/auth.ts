export const getAuthHeaders = (): Record<string, string> => {
    const accessToken = localStorage.getItem("accessToken");
    return accessToken ? {Authorization: `Bearer ${accessToken}`} : {};
}

export const getJsonHeaders = (): Record<string, string> => ({
    "Content-Type": "application/json",
    ...getAuthHeaders(),
});

export const AUTH_CHANGED_EVENT = "auth-changed";

const notifyAuthChanged = () => {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

const clearTokens = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    notifyAuthChanged();
}

const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
        clearTokens();
        return null;
    }

    const response = await fetch("/api/auth/token/refresh/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({refresh: refreshToken}),
    });

    if (!response.ok) {
        clearTokens();
        return null;
    }

    const token = await response.json();
    localStorage.setItem("accessToken", token.access);
    notifyAuthChanged();
    return token.access;
}

type AuthRequestInit = Omit<RequestInit, "headers"> & {
    headers?: Record<string, string>;
};

const withAuthHeader = (init: AuthRequestInit = {}, accessToken?: string): RequestInit => ({
    ...init,
    headers: {
        ...(init.headers || {}),
        ...(accessToken ? {Authorization: `Bearer ${accessToken}`} : getAuthHeaders()),
    },
});

export const fetchWithAuthRefresh = async (
    input: RequestInfo | URL,
    init: AuthRequestInit = {},
): Promise<Response> => {
    const response = await fetch(input, withAuthHeader(init));
    if (response.status !== 401) {
        return response;
    }

    const refreshedAccessToken = await refreshAccessToken();
    if (!refreshedAccessToken) {
        return response;
    }

    return fetch(input, withAuthHeader(init, refreshedAccessToken));
}

export const fetchJsonWithAuthRefresh = async (
    input: RequestInfo | URL,
    init: AuthRequestInit = {},
): Promise<Response> => fetchWithAuthRefresh(input, {
    ...init,
    headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
    },
});
