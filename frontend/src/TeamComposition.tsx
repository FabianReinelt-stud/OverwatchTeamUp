import heroSelect from './assets/heroselect.png'
import support from './assets/support.png'
import damage from './assets/dmg.png'
import tank from './assets/tank.png'
import './TeamComposition.css'

export function Load() {
  return (
    <button className='loadBtn'></button>
  )
}

export function Save() {
  return (
    <button className='saveBtn'></button>
  )
}

function TeamSlot({role}: {role: string}) {
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