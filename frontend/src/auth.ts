export const getAuthHeaders = (): Record<string, string> => {
    const accessToken = localStorage.getItem("accessToken");
    return accessToken ? {Authorization: `Bearer ${accessToken}`} : {};
}

export const getJsonHeaders = (): Record<string, string> => ({
    "Content-Type": "application/json",
    ...getAuthHeaders(),
});
