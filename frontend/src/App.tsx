import logo from './assets/logo.png'
import HeroView from './HeroView'
import TeamSlot, { Load, Save } from './TeamComposition'
import SideBar from './SideBar'
import { useState } from 'react'
import './App.css'
import './fonts/big_noodle_titling.ttf'
import './fonts/big_noodle_titling_oblique.ttf'

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [showTeamCompView, setShowTeamCompView] = useState(false);
  const [selectedHeroKey, setSelectedHeroKey] = useState("");

  const updateLoginState = (isLoggedIn: boolean) => {
      setIsLoggedIn(isLoggedIn);
    }

  const updateTeamCompViewState = () => {
      setShowTeamCompView(!showTeamCompView);
  }

  const updateSelectedHero = (heroKey: string) => {
      console.log("updated selected hero: ", heroKey)
      setSelectedHeroKey(heroKey);
  }

  return (
    <>
      <div className='overwatch-team-comp'>
          <p className="small-screen">We're sorry but this website is best viewed and used at a taller screen ratio.</p>
        <div className='main-view'>
          <div className='logo'>
            <img className='logo-img' src={logo} alt='logo'></img>
          </div>
            <HeroView heroKey={selectedHeroKey}></HeroView>
          <div className='team-comp'>
            <TeamSlot role={"tank"}></TeamSlot>
            <TeamSlot role={"damage"}></TeamSlot>
            <TeamSlot role={"damage"}></TeamSlot>
            <TeamSlot role={"support"}></TeamSlot>
            <TeamSlot role={"support"}></TeamSlot>
            <Save isLoggedIn={isLoggedIn}></Save>
            <Load isLoggedIn={isLoggedIn} updateTeamCompViewState={updateTeamCompViewState}></Load>
          </div>
        </div>
        <SideBar updateLoginState={updateLoginState} showTeamCompView={showTeamCompView} updateSelectedHero={updateSelectedHero}></SideBar>
      </div>
    </>
  )
}

export default App
