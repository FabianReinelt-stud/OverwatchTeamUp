import { useState } from 'react';
import './Login.css'
import { Button } from "@mui/material";
import type { UserContract } from './App';

interface UserLogin {
  username: string;
  password: string;
}

const handleLogin = (e: React.SyntheticEvent<HTMLFormElement>, userLoginData: UserLogin,
   setLoginValidity : (isValid: boolean) => void,
  loginCb: (user: UserContract) => void) => {
  e.preventDefault();

  fetch("/api/auth/token/", {
    method: "POST",
    body: JSON.stringify({ userLoginData })
  })
    .then(response => response.json())
    .then(response => {
      console.log("login was successful (access/ refresh): ", response.access, response.refresh);
      loginCb((userLoginData.username, response.access, response.refresh))
    })
    .catch(error => {
      console.log("could not login: ", error);
      setLoginValidity(false);
    });
}

function LoginViewToggle({ loginCb }: { loginCb: (user: UserContract) => void }) {
  const [showLoginView, setShowLoginView] = useState(false);
  const onClick = () => setShowLoginView(!showLoginView);
  return (
    <>
      <div className="login-button">
        <Button variant="contained" onClick={onClick}>Login</Button>
      </div>
      <div className="login-view-container">
        {showLoginView ? <LoginView loginCb={loginCb} /> : null}
      </div>
    </>
  );
}

function LoginView({ loginCb }: { loginCb: (user: UserContract) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [validLogin, setIsLoginValid] = useState(true);

  const validUsernameRegex = /^[a-zA-Z0-9_-]*$/i;

  const validateUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.value && e.target.value.match(validUsernameRegex)) {
      setUsername(e.target.value)
      setIsLoginValid(true);
      return true;
    }
    setIsLoginValid(false);
    return false;
  }

  const setLoginValidity = (isValid: boolean) => {
    setIsLoginValid(isValid);
  }

  return (
    <div className="login-wrapper">
      <form onSubmit={(e) => handleLogin(e, { username: username, password }, setLoginValidity, loginCb)}>
        <label><p>Username</p>
          <input type="text"
            className={validLogin ? 'form-control' : 'error-control'}
            pattern="^[a-zA-Z0-9]+"
            title='Please only use upper-/lowercase letters and numbers'
            onChange={(e) => validateUsername(e)}
            required></input>
        </label>
        <label><p>Password</p>
          <input type="password"
            className={validLogin ? 'form-control' : 'error-control'}
            pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
            title="Must contain at least one  number and one uppercase and lowercase letter, and at least 8 or more characters"
            onChange={(e) => setPassword(e.target.value)}
            required></input>
        </label>
        <div>
          <button type="submit">Login</button>
        </div>
      </form>
    </div>
  );
};

export default LoginViewToggle;

