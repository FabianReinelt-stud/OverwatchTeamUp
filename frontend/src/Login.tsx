import { useState } from "react";
import './Login.css'
import { Button } from "@mui/material";

function LoginButton() {
  const [showLoginView, setShowLoginView] = useState(false);
  const onClick = () => setShowLoginView(!showLoginView);
  return (
    <>
      <div className="login-button">
        <Button variant="contained" onClick={onClick}>Login</Button>
      </div>
      <div className="login-view-container">
        {showLoginView ? <LoginView /> : null}
      </div>
    </>
  );
}

function LoginView() {
  const [email, setEmail] = useState("email@domain.com");
  const [password, setPassword] = useState("");

  // const handleLogin = () => {};

  return (
    <div className="login-wrapper">
        <form>
          <label><p>Email</p>
            <input type="text"
              onChange={(e) => setEmail(e.target.value)}></input>
          </label>
          <label><p>Password</p>
            <input type="text"
              onChange={(e) => setPassword(e.target.value)}></input>
          </label>
          <div>
            <button type="submit">Login</button>
          </div>
        </form>
      </div>
  );
};

export default LoginButton;