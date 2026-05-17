import hero from './assets/ana.png'
import heroSelect from './assets/heroselect.png'
import support from './assets/support.png'
import damage from './assets/dmg.png'
import tank from './assets/tank.png'
import save from './assets/save.png'
import load from './assets/openfile.png'
import SearchBar from './SearchBar'
import './App.css'

interface HeroStatProp {
  statName: string;
  statValue: string;
}

const TeamRole = {
  TANK: 0,
  DAMAGE: 1,
  SUPPORT: 2
} as const;

type TeamRole = (typeof TeamRole)[keyof typeof TeamRole];

interface TeamRoleProp {
  role: TeamRole;
}

function HeroView() {
  return (
    <>
      <div className='hero-view'>
        <img className='hero-portrait' src={hero} alt='hero'></img>
        <div className='stat-view'>
          <div className='hero-name'>Ana</div>
          <HeroStatRow statName='Role' statValue='Support'></HeroStatRow>
          <HeroStatRow statName='Health' statValue='250'></HeroStatRow>
          <HeroStatRow statName='Abilities' statValue='Ability 01, Ability 02'></HeroStatRow>
          <HeroStatRow statName='Description' statValue='Some Text Some Text 
    Some Text Some Text Some Text Some Text Some Text Some Text Some 
    Text Some Text Some Text Some Text Some Text Some Text Some Text'>
          </HeroStatRow>
        </div>
      </div>
    </>
  )
}

function HeroStatRow({ statName, statValue }: HeroStatProp) {
  return (
    <div className='hero-stat-row'>
      <div className='stat-name'>{statName}</div>
      <div className='stat-val'>{statValue}</div>
    </div>
  )
}

function TeamSlot({ role }: TeamRoleProp) {
  let roleImage;
  if (role == TeamRole.TANK) {
    roleImage = <img className='role' src={tank} width='75' height='75' alt='tank role'></img>
  }
  if (role == TeamRole.DAMAGE) {
    roleImage = <img className='role' src={damage} width='75' height='75' alt='damage role'></img>
  }
  if (role == TeamRole.SUPPORT) {
    roleImage = <img className='role' src={support} width='75' height='75' alt='support role'></img>
  }
  return (
    <div className='team-role-select'>
      <img className='select-frame' src={heroSelect} width='75' height='75' alt='select frame'></img>
      {roleImage}
    </div>
  )
}

function Load() {
  return (
    <img className='load' src={load} width='25' height='25' alt='load'></img>
  )
}

function Save() {
  return (
    <img className='save' src={save} width='25' height='25' alt='save'></img>
  )
}

function App() {
  return (
    <>
      <div className='overwatch-team-comp'>
        <div className='main-view'>
          <h1>Overwatch Team Comp</h1>
          <HeroView></HeroView>
          <div className='team-comp-select'>
            <TeamSlot role={TeamRole.TANK}></TeamSlot>
            <TeamSlot role={TeamRole.DAMAGE}></TeamSlot>
            <TeamSlot role={TeamRole.DAMAGE}></TeamSlot>
            <TeamSlot role={TeamRole.SUPPORT}></TeamSlot>
            <TeamSlot role={TeamRole.SUPPORT}></TeamSlot>
            <Save></Save>
            <Load></Load>
          </div>
        </div>
        <div className='side-bar'>
          <SearchBar></SearchBar>
        </div>
      </div>
    </>
  )
}

export default App
