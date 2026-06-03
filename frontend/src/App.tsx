import logo from './assets/logo.png'
import HeroView from './HeroView'
import TeamSlot, { Load, Save } from './TeamComposition'
import SideBar from './SideBar'
import { useState } from 'react'
import './App.css'

export interface UserContract{
  username: string
  access: string
  refresh: string
}


function App() {
  const [loginState, setLoginState] = useState<UserContract>()

  const updateLoginState = (user: UserContract) => {
    console.log("user login updated: ", user.username, user.access, user.refresh)
    setLoginState(user);
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
            <Save></Save>
            <Load></Load>
          </div>
        </div>
        <SideBar loginCb={updateLoginState}></SideBar>
      </div>
    </>
  )
}

export default App
