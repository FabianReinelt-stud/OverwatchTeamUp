import hero from './assets/ana.png'
import './HeroView.css'

interface HeroStatProp {
  statName: string;
  statValue: string;
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
    Text Some Text Some Text Some Text Some Text Some Text Some Text
    Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some 
    Text Some Text Some Text Some Text Some Text Some Text Some Text
    Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some 
    Text Some Text Some Text Some Text Some Text Some Text Some Text
    Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some 
    Text Some Text Some Text Some Text Some Text Some Text Some Text
    Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some 
    Text Some Text Some Text Some Text Some Text Some Text Some Text
    Some Text Some Text  Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some 
    Text Some Text Some Text Some Text Some Text Some Text Some Text
    Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some 
    Text Some Text Some Text Some Text Some Text Some Text Some Text
    Some Text Some Text     Text Some Text Some Text Some Text Some Text Some Text Some Text
    Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some 
    Text Some Text Some Text Some Text Some Text Some Text Some Text
    Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some 
    Text Some Text Some Text Some Text Some Text Some Text Some Text
    Some Text Some Text  Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some 
    Text Some Text Some Text Some Text Some Text Some Text Some Text
    Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some 
    Text Some Text Some Text Some Text Some Text Some Text Some Text
    Some Text Some Text    Text Some Text Some Text Some Text Some Text Some Text Some Text
    Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some 
    Text Some Text Some Text Some Text Some Text Some Text Some Text
    Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some 
    Text Some Text Some Text Some Text Some Text Some Text Some Text
    Some Text Some Text  Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some 
    Text Some Text Some Text Some Text Some Text Some Text Some Text
    Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some Text Some 
    Text Some Text Some Text Some Text Some Text Some Text Some Text
    Some Text Some Text'>
          </HeroStatRow>
        </div>
      </div>
    </>
  )
}

function HeroStatRow({ statName, statValue }: HeroStatProp) {
  return (
    <div className='hero-stat-row'>
      <div className='stat-name'><p>{statName}</p></div>
      <div className='stat-value'>{statValue}</div>
    </div>
  )
}

export default HeroView;