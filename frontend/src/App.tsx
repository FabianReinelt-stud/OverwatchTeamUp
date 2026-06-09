import logo from './assets/logo.png'
import HeroView from './HeroView'
import TeamSlot, { Load, Save } from './TeamComposition'
import type {TokenResponseDto} from "./data/api-dtos.tsx";
import SideBar from './SideBar'

import { useState } from 'react'
import './App.css'
import './fonts/big_noodle_titling.ttf'
import './fonts/big_noodle_titling_oblique.ttf'

export interface UserContract{
  username: string
 token: TokenResponseDto
}

function App() {
  const [userContract, setUserContract] = useState<UserContract>()
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const updateLoginState = (user: UserContract) => {
    setUserContract(user);
    setIsLoggedIn(true);
    if(userContract)
    console.log("user login updated with: ", userContract.username, userContract.token.access, userContract.token.refresh)
  }

  return (
    <>
      <div className='overwatch-team-comp'>
          <p className="small-screen">We're sorry but this website is best viewed and used at a taller screen ratio.</p>
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
