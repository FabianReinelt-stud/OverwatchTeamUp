import {beforeEach, describe, expect, it, vi} from "vitest";
import {
    AUTH_CHANGED_EVENT,
    clearTokens,
    fetchJsonWithAuthRefresh,
    fetchWithAuthRefresh,
    getAuthHeaders,
    getJsonHeaders,
    isValidJwt,
    logoutUser,
} from "./auth.ts";

const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature";

describe("auth utilities", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it("builds authentication headers and validates JWTs", () => {
        expect(getAuthHeaders()).toEqual({});
        localStorage.setItem("accessToken", jwt);
        expect(getAuthHeaders()).toEqual({Authorization: `Bearer ${jwt}`});
        expect(getJsonHeaders()).toEqual({"Content-Type": "application/json", Authorization: `Bearer ${jwt}`});
        expect(isValidJwt(jwt)).toBe(true);
        expect(isValidJwt("invalid")).toBe(false);
        expect(isValidJwt(12)).toBe(false);
    });

    it("clears tokens and announces the authentication change", () => {
        localStorage.setItem("accessToken", jwt);
        localStorage.setItem("refreshToken", jwt);
        const listener = vi.fn();
        window.addEventListener(AUTH_CHANGED_EVENT, listener);
        clearTokens();
        expect(localStorage.getItem("accessToken")).toBeNull();
        expect(listener).toHaveBeenCalledOnce();
        window.removeEventListener(AUTH_CHANGED_EVENT, listener);
    });

    it("performs same-origin API requests with JSON headers", async () => {
        const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", {status: 200}));
        await fetchJsonWithAuthRefresh("/api/heroes/", {method: "POST"});
        const [, init] = fetchMock.mock.calls[0];
        expect(init?.headers).toMatchObject({"Content-Type": "application/json"});
    });

    it("rejects URLs outside the local API", async () => {
        await expect(fetchWithAuthRefresh("https://example.com/api/data")).rejects.toThrow("Invalid API URL");
        await expect(fetchWithAuthRefresh("/not-api/data")).rejects.toThrow("Invalid API URL");
        await expect(fetchWithAuthRefresh("/api/data#fragment")).rejects.toThrow("Invalid API URL");
    });

    it("refreshes an expired access token and retries the request", async () => {
        localStorage.setItem("refreshToken", jwt);
        const fetchMock = vi.spyOn(globalThis, "fetch")
            .mockResolvedValueOnce(new Response(null, {status: 401}))
            .mockResolvedValueOnce(new Response(JSON.stringify({access: jwt}), {status: 200}))
            .mockResolvedValueOnce(new Response("ok", {status: 200}));

        const response = await fetchWithAuthRefresh("/api/team-compositions/");
        expect(response.status).toBe(200);
        expect(fetchMock).toHaveBeenCalledTimes(3);
        expect(localStorage.getItem("accessToken")).toBe(jwt);
    });

    it("does not retry when refresh is unavailable or invalid", async () => {
        const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, {status: 401}));
        expect((await fetchWithAuthRefresh("/api/private/")).status).toBe(401);
        expect(fetchMock).toHaveBeenCalledTimes(1);

        localStorage.setItem("refreshToken", jwt);
        fetchMock.mockReset()
            .mockResolvedValueOnce(new Response(null, {status: 401}))
            .mockResolvedValueOnce(new Response(JSON.stringify({access: "invalid"}), {status: 200}));
        expect((await fetchWithAuthRefresh("/api/private/")).status).toBe(401);
        expect(localStorage.getItem("refreshToken")).toBeNull();
    });

    it("logs out locally with and without a server request", async () => {
        await logoutUser();
        localStorage.setItem("refreshToken", jwt);
        const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, {status: 204}));
        await logoutUser();
        expect(fetchMock).toHaveBeenCalledOnce();
        expect(localStorage.getItem("refreshToken")).toBeNull();
    });
});
