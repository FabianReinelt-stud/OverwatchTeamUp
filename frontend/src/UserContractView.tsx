import {useState} from 'react';
import './UserContractView.css'
import {Button} from "@mui/material";
import * as React from "react";
import type {TokenResponseDto} from "./data/api-dtos.tsx";

export interface UserContract{
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

const handleLogin = (e: React.SyntheticEvent<HTMLFormElement>, userLoginData: UserLogin,
                     setLoginValidity: (isValid: boolean) => void,
                     updateLoginState: (user: UserContract) => void) => {
    e.preventDefault();

    fetch("/api/auth/token/", {
        method: "POST",
        body: JSON.stringify({userLoginData})
    })
        .then(response => response.json())
        .then(response => {
            console.log("login was successful (access/ refresh): ", response.access, response.refresh);
            updateLoginState((userLoginData.username, response.access, response.refresh))
        })
        .catch(error => {
            console.log("could not login: ", error);
            setLoginValidity(false);
        });
}

const LoginView = (updateLoginState: (isLoggedIn: boolean) => void,
                   updateContractView: (view: View) => void) => {
    const [userContract, setUserContract] = useState<UserContract>()
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoginValid, setIsLoginValid] = useState(true);
    const updateUserContract = (user: UserContract) => {
        setUserContract(user);
        updateLoginState(true);
        if(userContract) {
            console.log("user login updated with: ", userContract.username, userContract.token.access, userContract.token.refresh)
        }
    }

    const updateLoginValidity = (isValid: boolean) => {
        setIsLoginValid(isValid);
    }

    const validateUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
        return e.target?.value && e.target.value.match(/^[a-zA-Z0-9_-]*$/i);
    }

    return (
        <div className='register-wrapper'>
            <p className="view-name">Login</p>
            <form onSubmit={(e: React.SyntheticEvent<HTMLFormElement>) =>
                handleLogin(e, {username, password}, updateLoginValidity, updateUserContract)}>
                <label>Username</label>
                <input type="text"
                       className={isLoginValid ? 'form-control' : 'error-control'}
                       pattern="^[a-zA-Z0-9]+"
                       title='Please only use upper-/lowercase letters and numbers'
                       onChange={(e) => {
                           if(validateUsername(e)) {
                               setUsername(e.target.value)
                               updateLoginValidity(true);
                           } else {
                               updateLoginValidity(false);
                           }
                       }}
                       required></input>
                <label><p></p>Password</label>
                <input type="password"
                       className={isLoginValid ? 'form-control' : 'error-control'}
                       pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                       title="Must contain at least one  number and one uppercase and lowercase letter, and at least 8 or more characters"
                       onChange={(e) => setPassword(e.target.value)}
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
    //TODO: add tokens timer
    return (
        <div>
            <p>You were successfully logged in.</p>
            <button type="button" onClick={toggleView}>Close</button>
        </div>
    )
}

const handleRegister = (e: React.SyntheticEvent<HTMLFormElement>, userLoginData: UserLogin) => {
    e.preventDefault();

    fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({userLoginData})
    })
        .then(response => response.json())
        .then(response => {
            console.log("registration was successful (id/username): ", response.id, response.username);
            //TODO view callback to switch to login view
        })
        .catch(error => {
            console.log("could not register: ", error);
            //TODO registration feedback
        })
}

const RegisterView = (//TODO add register callback here
    updateContractView: (view: View) => void) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className='register-wrapper'>
            <p className="view-name">Registration</p>
            <form onSubmit={(e: React.SyntheticEvent<HTMLFormElement>) =>
                handleRegister(e, {username, password})}>
                <label>Username</label>
                <input type="text"
                       className='form-control'
                       pattern="^[a-zA-Z0-9]+"
                       title='Please only use upper-/lowercase letters and numbers'
                       onChange={(e) => setUsername(e.target.value)}
                       required></input>
                <label><p></p>Password</label>
                <input type="password"
                       className='form-control'
                       pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
                       title="Must contain at least one  number and one uppercase and lowercase letter, and at least 8 or more characters"
                       onChange={(e) => setPassword(e.target.value)}
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

interface ViewProp {
    updateLoginState: (isLoggedIn: boolean) => void,
    toggleView: () => void
}

function UserContractView({updateLoginState, toggleView}: ViewProp) {
    const [view, setView] = useState<View>(View.LOGIN);
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

function UserContractViewToggle({updateLoginState}: { updateLoginState: (isLoggedIn: boolean) => void }) {
    const [showUserContract, setShowUserContract] = useState(false);
    const onClick = () => setShowUserContract(!showUserContract);
    return (
        <>
            <div className="login-button">
                <Button variant="contained" onClick={onClick}>Login</Button>
            </div>
            <div className="login-view-container">
                {showUserContract ? <UserContractView updateLoginState={updateLoginState}
                                                      toggleView={() => setShowUserContract(!showUserContract)}/> : null}
            </div>
        </>
    );
}

export default UserContractViewToggle;