import { useState } from 'react';
import './UserContractView.css'
import { Button } from "@mui/material";
import type { UserContract } from './App';

interface UserLogin {
  username: string;
  password: string;
}

const handleLogin = (e: React.SyntheticEvent<HTMLFormElement>, userLoginData: UserLogin,
  setLoginValidity: (isValid: boolean) => void,
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

const handleRegister = (e: React.SyntheticEvent<HTMLFormElement>, userLoginData: UserLogin) => {
  e.preventDefault();

  fetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ userLoginData })
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

const LoginView = (loginCb: (user: UserContract) => void,
  updateContractView: () => void) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginValid, setIsLoginValid] = useState(true);

  const validateUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target?.value && e.target.value.match(/^[a-zA-Z0-9_-]*$/i)) {
      setUsername(e.target.value)
      setIsLoginValid(true);
      return true;
    }
    setIsLoginValid(false);
    return false;
  }

  const updateLoginValidity = (isValid: boolean) => {
    setIsLoginValid(isValid);
  }

  return (
    <div className='register-wrapper'>
      <form onSubmit={(e: React.SyntheticEvent<HTMLFormElement>) =>
        handleLogin(e, { username, password }, updateLoginValidity, loginCb)}>
        <label>Username</label>
        <input type="text"
          className={isLoginValid ? 'form-control' : 'error-control'}
          pattern="^[a-zA-Z0-9]+"
          title='Please only use upper-/lowercase letters and numbers'
          onChange={(e) => validateUsername(e)}
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
          <button type="reset" onClick={updateContractView}>No Account? Register</button>
        </div>
      </form>
    </div>
  );
}

const RegisterView = (//TODO add register callback here
  updateContractView: () => void) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className='register-wrapper'>
      <form onSubmit={(e: React.SyntheticEvent<HTMLFormElement>) =>
        handleRegister(e, { username, password })}>
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
          <button type="reset" onClick={updateContractView}>Login Instead</button>
        </div>
      </form>
      </div>
  )
}

function UserContractView({ loginCb }: { loginCb: (user: UserContract) => void }) {
  const [showRegisterView, setIsRegister] = useState(false);
  const updateContractView = () => setIsRegister(!showRegisterView);

  let registerView = RegisterView(updateContractView);
  let loginView = LoginView(loginCb, updateContractView);

  return (
    <div className="view-container" style={showRegisterView? {backgroundColor: "#0f002b"} : {backgroundColor: "#001731"}}>
      {showRegisterView ?  registerView: loginView}
    </div>
  );
};

function UserContractViewToggle({ loginCb }: { loginCb: (user: UserContract) => void }) {
  const [showUserContract, setShowUserContract] = useState(false);
  const onClick = () => setShowUserContract(!showUserContract);
  return (
    <>
      <div className="login-button">
        <Button variant="contained" onClick={onClick}>Login</Button>
      </div>
      <div className="login-view-container">
        {showUserContract ? <UserContractView loginCb={loginCb} /> : null}
      </div>
    </>
  );
}

export default UserContractViewToggle;