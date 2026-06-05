import logo from './assets/logo.png'
import HeroView from './HeroView'
import TeamSlot, { Load, Save } from './TeamComposition'
import SideBar from './SideBar'
import { useState } from 'react'

import './App.css'
import './fonts/big_noodle_titling.ttf'
import './fonts/big_noodle_titling_oblique.ttf'

export interface UserContract{
  username: string
  access: string
  refresh: string
}


function App() {
  const [userContract, setUserContract] = useState<UserContract>()
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const updateLoginState = (user: UserContract) => {
    setUserContract(user);
    setIsLoggedIn(true);
    if(userContract)
    console.log("user login updated with: ", userContract.username, userContract.access, userContract.refresh)
  }

  const [selectedHero, setSelectedHero] = useState("");

  const updateSelectedHero = (key: string) => {
    setSelectedHero(key);
    console.log("current selected hero: ", selectedHero);
  }

  return (
    <>
      <div className='overwatch-team-comp'>
        <div className='main-view'>
          <div className='logo'>
            <img className='logo-img' src={logo} alt='logo'></img>
          </div>
          <HeroView></HeroView>
          <div className='team-comp'>
            <TeamSlot role={"tank"}></TeamSlot>
            <TeamSlot role={"damage"}></TeamSlot>
            <TeamSlot role={"damage"}></TeamSlot>
            <TeamSlot role={"support"}></TeamSlot>
            <TeamSlot role={"support"}></TeamSlot>
            <Save isLoggedIn={isLoggedIn}></Save>
            <Load isLoggedIn={isLoggedIn}></Load>
          </div>
        </div>
        <SideBar loginCb={updateLoginState}></SideBar>
      </div>
    </>
  )
}

export default App
