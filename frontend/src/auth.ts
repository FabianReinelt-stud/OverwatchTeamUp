export const getAuthHeaders = (): Record<string, string> => {
    const accessToken = localStorage.getItem("accessToken");
    return accessToken ? {Authorization: `Bearer ${accessToken}`} : {};
}

export const getJsonHeaders = (): Record<string, string> => ({
    "Content-Type": "application/json",
    ...getAuthHeaders(),
});

export const AUTH_CHANGED_EVENT = "auth-changed";

const jwtPattern = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

export const sanitizeJwt = (value: unknown): string | null => {
    if (typeof value !== "string" || value.length > 8192) {
        return null;
    }

    const sanitizedValue = value.replace(/[^A-Za-z0-9_.-]/g, "");
    return sanitizedValue === value && jwtPattern.test(sanitizedValue) ? sanitizedValue : null;
}

export const isValidJwt = (value: unknown): value is string => sanitizeJwt(value) !== null;

const notifyAuthChanged = () => {
    window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export const clearTokens = () => {
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

    const token: unknown = await response.json();
    if (typeof token !== "object" || token === null) {
        clearTokens();
        return null;
    }

    const accessToken = sanitizeJwt((token as Record<string, unknown>).access);
    if (!accessToken) {
        clearTokens();
        return null;
    }

    localStorage.setItem("accessToken", accessToken);
    notifyAuthChanged();
    return accessToken;
}

type AuthRequestInit = Omit<RequestInit, "headers"> & {
    headers?: Record<string, string>;
};

const getSafeApiUrl = (input: string): URL => {
    const url = new URL(input, window.location.origin);
    if (url.origin !== window.location.origin
        || !url.pathname.startsWith("/api/")
        || url.username
        || url.password
        || url.hash) {
        throw new Error("Invalid API URL");
    }

    return url;
}

const withAuthHeader = (init: AuthRequestInit = {}, accessToken?: string): RequestInit => ({
    ...init,
    headers: {
        ...(init.headers || {}),
        ...(accessToken ? {Authorization: `Bearer ${accessToken}`} : getAuthHeaders()),
    },
});

export const fetchWithAuthRefresh = async (
    input: string,
    init: AuthRequestInit = {},
): Promise<Response> => {
    const apiUrl = getSafeApiUrl(input);
    const response = await fetch(apiUrl, withAuthHeader(init));
    if (response.status !== 401) {
        return response;
    }

    const refreshedAccessToken = await refreshAccessToken();
    if (!refreshedAccessToken) {
        return response;
    }

    return fetch(apiUrl, withAuthHeader(init, refreshedAccessToken));
}

export const fetchJsonWithAuthRefresh = async (
    input: string,
    init: AuthRequestInit = {},
): Promise<Response> => fetchWithAuthRefresh(input, {
    ...init,
    headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
    },
});

export const logoutUser = async (): Promise<void> => {
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
        clearTokens();
        return;
    }

    try {
        await fetchJsonWithAuthRefresh("/api/auth/logout/", {
            method: "POST",
            body: JSON.stringify({refresh: refreshToken}),
        });
    } finally {
        clearTokens();
    }
}
