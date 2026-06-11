import heroSelect from './assets/heroselect.png'
import support from './assets/support.png'
import damage from './assets/dmg.png'
import tank from './assets/tank.png'
import './TeamComposition.css'
import { Tooltip } from '@mui/material'

interface LoadTeamProp{
isLoggedIn: boolean,
updateTeamCompViewState: () => void
}

export function Load({isLoggedIn, updateTeamCompViewState}: LoadTeamProp) {
  return (
    <Tooltip title={isLoggedIn ? "Click to open Team Comp table" : "Please login or register to use the save function for your team composition."}>
      <button onClick={updateTeamCompViewState} className={isLoggedIn ? 'loadBtn' : 'loadBtn-disabled'} ></button>
    </Tooltip>
  )
}

export function Save({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <Tooltip title={isLoggedIn ? "Click to save current Team Comp" : "Please login or register to use the load function for your existing team compositions."}>
      <button className={isLoggedIn ? 'saveBtn' : 'saveBtn-disabled'}></button>
    </Tooltip>
  )
}

function TeamSlot({ role }: { role: string }) {
  role.toLowerCase();
  let roleImage;
  if (role === "tank") {
    roleImage = <img className='role' src={tank} alt='tank role'></img>
  }
  if (role === "damage") {
    roleImage = <img className='role' src={damage} alt='damage role'></img>
  }
  if (role === "support") {
    roleImage = <img className='role' src={support} alt='support role'></img>
  }
  return (
    <div className='team-role-select'>
      <img className='select-frame' src={heroSelect} alt='select frame'></img>
      {roleImage}
    </div>
  )
}

export default TeamSlot;