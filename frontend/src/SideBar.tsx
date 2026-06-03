import List from './List'
import { useState } from "react";
import LoginViewToggle from "./Login";
import SearchBar from "./SearchBar";
import type { UserContract } from './App';
import './SideBar.css'

function SideBar({loginCb}: {loginCb: (user: UserContract) => void}) {
  const [inputText, setInputText] = useState("");
  let inputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    var lowerCase = e.target.value.toLowerCase();
    setInputText(lowerCase);
  };

  return (
    <div className='side-bar'>
      <SearchBar inputHandler={inputHandler}></SearchBar>
      <LoginViewToggle loginCb={loginCb}/>
      <List input={inputText}/>
    </div>
  );
}

export default SideBar;