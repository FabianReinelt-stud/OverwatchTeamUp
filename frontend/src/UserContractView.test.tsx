import {beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
import UserContractView from "./UserContractView.tsx";

const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature";

const openLogin = () => {
    fireEvent.click(screen.getByRole("button", {name: "Login"}));
};

const fillCredentials = (username = "tester", password = "Password1") => {
    fireEvent.change(screen.getByLabelText("Username"), {target: {value: username}});
    fireEvent.change(screen.getByLabelText("Password"), {target: {value: password}});
};

const submitLogin = () => {
    const loginButtons = screen.getAllByRole("button", {name: "Login"});
    fireEvent.click(loginButtons[loginButtons.length - 1]);
};

describe("UserContractView", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it("opens and closes the login form", () => {
        render(<UserContractView updateLoginState={vi.fn()} isLoggedIn={false}/>);
        openLogin();
        expect(screen.getByText("No Account? Register")).toBeInTheDocument();
        fireEvent.click(screen.getByText("No Account? Register"));
        expect(screen.getByText("Registration")).toBeInTheDocument();
        fireEvent.click(screen.getByText("Login Instead"));
        expect(screen.getByText("Login", {selector: ".view-name"})).toBeInTheDocument();
    });

    it("logs in, validates tokens, stores them and closes the success view", async () => {
        const updateLoginState = vi.fn();
        vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({access: jwt, refresh: jwt}), {status: 200}));
        render(<UserContractView updateLoginState={updateLoginState} isLoggedIn={false}/>);
        openLogin();
        fillCredentials();
        submitLogin();

        await waitFor(() => expect(screen.getByText("You were successfully logged in.")).toBeInTheDocument());
        expect(localStorage.getItem("accessToken")).toBe(jwt);
        expect(updateLoginState).toHaveBeenCalledWith(true);
        fireEvent.click(screen.getByText("Close"));
        expect(screen.queryByText("You were successfully logged in.")).not.toBeInTheDocument();
    });

    it("marks login invalid for malformed credentials responses", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({access: "bad", refresh: "bad"}), {status: 200}));
        render(<UserContractView updateLoginState={vi.fn()} isLoggedIn={false}/>);
        openLogin();
        fillCredentials();
        submitLogin();
        await waitFor(() => expect(screen.getByLabelText("Username")).toHaveClass("error-control"));

        fireEvent.change(screen.getByLabelText("Username"), {target: {value: "valid_name"}});
        expect(screen.getByLabelText("Username")).toHaveClass("form-control");
        fireEvent.change(screen.getByLabelText("Username"), {target: {value: "!"}});
        expect(screen.getByLabelText("Username")).toHaveClass("error-control");
    });

    it("registers a user and returns to login", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({id: 1, username: "tester"}), {status: 201}));
        render(<UserContractView updateLoginState={vi.fn()} isLoggedIn={false}/>);
        openLogin();
        fireEvent.click(screen.getByText("No Account? Register"));
        fillCredentials();
        fireEvent.click(screen.getByRole("button", {name: "Register"}));
        await waitFor(() => expect(screen.getByText("Registration was successful. Please login now.")).toBeInTheDocument());
        fireEvent.click(screen.getByText("Go to Login"));
        expect(screen.getByText("Login", {selector: ".view-name"})).toBeInTheDocument();
    });

    it("handles invalid JSON during registration", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("not-json", {status: 500}));
        render(<UserContractView updateLoginState={vi.fn()} isLoggedIn={false}/>);
        openLogin();
        fireEvent.click(screen.getByText("No Account? Register"));
        fillCredentials();
        fireEvent.click(screen.getByRole("button", {name: "Register"}));
        await waitFor(() => expect(screen.getByText("Registration")).toBeInTheDocument());
    });

    it("logs an authenticated user out", async () => {
        localStorage.setItem("refreshToken", jwt);
        vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, {status: 204}));
        const updateLoginState = vi.fn();
        render(<UserContractView updateLoginState={updateLoginState} isLoggedIn={true}/>);
        fireEvent.click(screen.getByRole("button", {name: "Logout"}));
        await waitFor(() => expect(updateLoginState).toHaveBeenCalledWith(false));
    });
});
