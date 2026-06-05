import List from './List'
import { useState } from "react";
import UserContractViewToggle from "./UserContractView";
import SearchBar from "./SearchBar";
import type { UserContract } from './App';
import dummyData from "./DummyListData.json"
import './SideBar.css'

export interface HeroSummary {
    hero_key: string;
    display_name: string;
    portrait_url: string;
    role: string;
}

function SideBar({loginCb}: {loginCb: (user: UserContract) => void}) {
  const [inputText, setInputText] = useState("");
  let inputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    var lowerCase = e.target.value.toLowerCase();
    setInputText(lowerCase);
  };

  const [heroSummaries, setHeroSummaries] = useState<HeroSummary[]>(dummyData);

  
    fetch("/api/heroes/", {
    method: "GET"
  })
    .then(response => response.json())
    .then(response => {
      console.log("hero data successfully loaded: ", response);
      setHeroSummaries(response);
    })
    .catch(error => {
      console.log("could not load hero data: ", error);
    }); 

  return (
    <div className='side-bar'>
      <SearchBar inputHandler={inputHandler}></SearchBar>
      <UserContractViewToggle loginCb={loginCb}/>
      <List input={inputText} heroList={heroSummaries} />
    </div>
  );
}

export default SideBar;