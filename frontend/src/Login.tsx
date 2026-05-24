import {
  Button
} from "@mui/material";
import { useState } from "react";
import './Login.css'

function LoginButton(){
  return(
    <div className="login-button">
    <Button variant="contained">Login</Button>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {};

  return (
    <>
    
    </>
  );
};

export default LoginButton;