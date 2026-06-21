import {useState} from 'react';
import './UserContractView.css'
import {Button} from "@mui/material";
import * as React from "react";
import type {TokenResponseDto} from "./data/api-dtos.tsx";
import {logoutUser, sanitizeJwt} from "./auth.ts";

export interface UserContract {
    username: string
    token: TokenResponseDto
}

const View = {
    LOGIN: 0,
    LOGINSUCCESS: 1,
    REGISTER: 2,
    REGISTERSUCCESS: 3,
} as const;

type View = (typeof View)[keyof typeof View];


interface UserLogin {
    username: string;
    password: string;
}

interface ViewProp {
    readonly isLoggedIn: boolean,
    readonly updateLoginState: (isLoggedIn: boolean) => void,
    readonly toggleView: () => void
}

const usernamePattern = /^[a-z0-9_-]*$/i;

const getFormString = (formData: FormData, field: string): string => {
    const value = formData.get(field);
    return typeof value === "string" ? value : "";
};

const parseTokenResponse = (value: unknown): TokenResponseDto => {
    if (typeof value !== "object" || value === null) {
        throw new Error("Invalid token response");
    }

    const token = value as Record<string, unknown>;
    const access = sanitizeJwt(token.access);
    const refresh = sanitizeJwt(token.refresh);
    if (!access || !refresh) {
        throw new Error("Invalid token response");
    }

    return {access, refresh};
}

const getUserLoginData = (form: HTMLFormElement): UserLogin => {
    const formData = new FormData(form);
    return {
        username: getFormString(formData, "username"),
        password: getFormString(formData, "password"),
    };
}

const parseJsonResponse = async (response: Response) => {
    const responseText = await response.text();
    let responseBody;

    try {
        responseBody = responseText ? JSON.parse(responseText) : {};
    } catch {
        throw new Error(
            `Expected JSON but got status ${response.status}: ${responseText.slice(0, 200)}`
        );
    }

    if (!response.ok) {
        throw new Error(JSON.stringify(responseBody));
    }

    return responseBody;
}

const handleLogin = async (e: React.SyntheticEvent<HTMLFormElement>, userLoginData: UserLogin,
                           setLoginValidity: (isValid: boolean) => void,
                           updateLoginState: (user: UserContract) => void) => {
    e.preventDefault();

    try {
        const response = await fetch("/api/auth/token/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(userLoginData)
        });
        const token = parseTokenResponse(await parseJsonResponse(response));
        updateLoginState({
            username: userLoginData.username,
            token,
        });
    } catch (error) {
        console.log("could not login: ", error);
        setLoginValidity(false);
    }
}

const LoginView = (updateLoginState: (isLoggedIn: boolean) => void,
                   updateContractView: (view: View) => void) => {
    const [isLoginValid, setIsLoginValid] = useState(true);
    const updateUserContract = (user: UserContract) => {
        const accessToken = sanitizeJwt(user.token.access);
        const refreshToken = sanitizeJwt(user.token.refresh);
        if (!accessToken || !refreshToken) {
            throw new Error("Invalid token response");
        }

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        updateLoginState(true);
        updateContractView(View.LOGINSUCCESS);
    }

    const updateLoginValidity = (isValid: boolean) => {
        setIsLoginValid(isValid);
    }

    const validateUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
        return usernamePattern.exec(e.target.value) !== null;
    }

    return (
        <div className='login-wrapper'>
            <p className="view-name">Login</p>
            <form onSubmit={(e: React.SyntheticEvent<HTMLFormElement>) =>
                handleLogin(e, getUserLoginData(e.currentTarget), updateLoginValidity, updateUserContract)}>
                <label htmlFor="login-username">Username</label>
                <input type="text"
                       id="login-username"
                       name="username"
                       className={isLoginValid ? 'form-control' : 'error-control'}
                       pattern="^[a-zA-Z0-9]+"
                       title='Please only use upper-/lowercase letters and numbers'
                       onChange={(e) => {
                           if (validateUsername(e)) {
                               updateLoginValidity(true);
                           } else {
                               updateLoginValidity(false);
                           }
                       }}
                       required></input>
                <label htmlFor="login-password"><p></p>Password</label>
                <input type="password"
                       id="login-password"
                       name="password"
                       className={isLoginValid ? 'form-control' : 'error-control'}
                       pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                       title="Must contain at least one  number and one uppercase and lowercase letter, and at least 8 or more characters"
                       required></input>
                <div className='form-buttons'>
                    <button type="submit">Login</button>
                    <button type="reset" onClick={() => {
                        setIsLoginValid(true);
                        updateContractView(View.REGISTER);
                    }}>No Account? Register
                    </button>
                </div>
            </form>
        </div>
    );
}

const LoginSuccessView = (toggleView: () => void) => {
    return (
        <div className="login-success-wrapper">
            <p>You were successfully logged in.</p>
            <button type="button" onClick={toggleView}>Close</button>
        </div>
    )
}

const handleRegister = async (
    e: React.SyntheticEvent<HTMLFormElement>,
    userLoginData: UserLogin,
    updateContractView: (view: View) => void,
) => {
    e.preventDefault();

    try {
        const response = await fetch("/api/auth/register/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            body: JSON.stringify(userLoginData)
        });
        const user = await parseJsonResponse(response);
        console.log("registration was successful (id/username): ", user.id, user.username);
        updateContractView(View.REGISTERSUCCESS);
    } catch (error) {
        console.log("could not register: ", error);
    }
}

const RegisterView = (
    updateContractView: (view: View) => void) => {
    return (
        <div className='register-wrapper'>
            <p className="view-name">Registration</p>
            <form onSubmit={(e: React.SyntheticEvent<HTMLFormElement>) =>
                handleRegister(e, getUserLoginData(e.currentTarget), updateContractView)}>
                <label htmlFor="register-username">Username</label>
                <input type="text"
                       id="register-username"
                       name="username"
                       className='form-control'
                       pattern="^[a-zA-Z0-9]+"
                       title='Please only use upper-/lowercase letters and numbers'
                       required></input>
                <label htmlFor="register-password"><p></p>Password</label>
                <input type="password"
                       id="register-password"
                       name="password"
                       className='form-control'
                       pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                       title="Must contain at least one  number and one uppercase and lowercase letter, and at least 8 or more characters"
                       required></input>
                <div className='form-buttons'>
                    <button type="submit">Register</button>
                    <button type="reset" onClick={() => {
                        updateContractView(View.LOGIN)
                    }}>Login Instead
                    </button>
                </div>
            </form>
        </div>
    )
}

const RegisterSuccessView = (
    updateContractView: (view: View) => void) => {

    return (
        <div>
            <p>Registration was successful. Please login now.</p>
            <button type="reset" onClick={() => {
                updateContractView(View.LOGIN)
            }}>Go to Login
            </button>
        </div>
    );
}

function UserContractView({updateLoginState, toggleView, isLoggedIn}: ViewProp) {
    const [view, setView] = useState<View>(isLoggedIn ? View.LOGINSUCCESS : View.LOGIN);
    const updateContractView = (view: View) => setView(view);

    const loginView = LoginView(updateLoginState, updateContractView);
    const loginSuccessView = LoginSuccessView(toggleView);
    const registerView = RegisterView(updateContractView);
    const registerSuccessView = RegisterSuccessView(updateContractView);

    const switchView = (view: View) => {
        switch (view) {
            case View.LOGIN:
                return loginView;
            case View.LOGINSUCCESS:
                return loginSuccessView;
            case View.REGISTER:
                return registerView;
            case View.REGISTERSUCCESS:
                return registerSuccessView;
        }
    }

    const isLoginView = (view: View) => {
        return view == View.LOGIN || view == View.LOGINSUCCESS;
    }

    return (
        <div className="view-container"
             style={isLoginView(view) ? {backgroundColor: "#0f002b"} : {backgroundColor: "#001731"}}>
            {switchView(view)}
        </div>
    );
}

function UserContractViewToggle({updateLoginState, isLoggedIn}: {
    readonly updateLoginState: (hasLoggedIn: boolean) => void,
    readonly isLoggedIn: boolean
}) {
    const [showUserContract, setShowUserContract] = useState(false);
    const onClick = async () => {
        if (!isLoggedIn) {
            setShowUserContract(!showUserContract);
            return;
        }

        try {
            await logoutUser();
        } catch (error) {
            console.log("could not logout on backend: ", error);
        }

        updateLoginState(false);
        setShowUserContract(false);
    }

    return (
        <>
            <div className="login-button">
                <Button variant="contained" onClick={onClick}>{isLoggedIn ? "Logout" : "Login"}</Button>
            </div>
            <div className="login-view-container">
                {showUserContract ? <UserContractView updateLoginState={updateLoginState}
                                                      toggleView={() => setShowUserContract(!showUserContract)}
                                                      isLoggedIn={isLoggedIn}/> : null}
            </div>
        </>
    );
}

export default UserContractViewToggle;
