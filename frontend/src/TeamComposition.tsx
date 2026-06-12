import selectTank from './assets/teamcomp_select_tank.png'
import selectDamage from './assets/teamcomp_select_damage.png'
import selectSupport from './assets/teamcomp_select_support.png'
import backgroundSupport from './assets/teamcomp_bg_support.png'
import backgroundDamage from './assets/teamcomp_bg_damage.png'
import backgroundTank from './assets/teamcomp_bg_tank.png'
import './TeamComposition.css'
import {Tooltip} from '@mui/material'
import type {HeroDto} from "./data/api-dtos.tsx";
import {useState} from "react";

interface LoadTeamProp {
    isLoggedIn: boolean,
    updateTeamCompViewState: () => void
}

interface BaseTeamCompProp{
    hero: HeroDto
    confirmHeroSelection: (slot: number) => void
}

interface TeamCompProp extends BaseTeamCompProp {
    isLoggedIn: boolean,
    updateTeamCompViewState: () => void,
}

interface TeamSlotProp extends BaseTeamCompProp{
    slot: number,
    defaultRole: string,
}

export function Load({isLoggedIn, updateTeamCompViewState}: LoadTeamProp) {
    return (
        <Tooltip
            title={isLoggedIn ? "Click to open Team Comp table" : "Please login or register to use the save function for your team composition."}>
            <button onClick={updateTeamCompViewState} className={isLoggedIn ? 'loadBtn' : 'loadBtn-disabled'}></button>
        </Tooltip>
    )
}

export function Save({isLoggedIn}: { isLoggedIn: boolean }) {
    return (
        <Tooltip
            title={isLoggedIn ? "Click to save current Team Comp" : "Please login or register to use the load function for your existing team compositions."}>
            <button className={isLoggedIn ? 'saveBtn' : 'saveBtn-disabled'}></button>
        </Tooltip>
    )
}

function TeamSlot({defaultRole, hero, slot, confirmHeroSelection}: TeamSlotProp) {
    const [slotNumber] = useState(slot);
    const [roleImage, setRoleImage] = useState("");
    const [currentHero, setCurrentHero] = useState<HeroDto>();

    const heroRole = hero ? hero.role : "";
    heroRole.toLowerCase();
    defaultRole.toLowerCase();

    let roleImg;
    let frameImg;

    const handleSlotSelected = () => {
        if(!hero) {
            return;
        }
        else if (!currentHero ||hero.hero_key != currentHero.hero_key
            && hero.role == defaultRole) {
            console.log("placing hero " + hero.display_name +" into slot "+ slotNumber);
            setRoleImage(hero.portrait_url);
            setCurrentHero(hero);
            confirmHeroSelection(slotNumber);
        }
    }

    if (defaultRole === "tank") {
        roleImg = <img className={heroRole == defaultRole && !currentHero ? 'role' : 'role-disabled'} src={currentHero? roleImage : backgroundTank} alt='tank role'
                       onClick={handleSlotSelected}></img>;
        frameImg = <img className='select-frame' src={selectTank} alt='select frame for tank role'></img>;
    }
    else if (defaultRole === "damage") {
        roleImg = <img className={heroRole == defaultRole && !currentHero ? 'role' : 'role-disabled'} src={currentHero? roleImage : backgroundDamage} alt='damage role'
                       onClick={handleSlotSelected}></img>;
        frameImg = <img className='select-frame' src={selectDamage} alt='select frame for damage role'></img>;
    }
    else if (defaultRole === "support") {
        roleImg = <img className={heroRole == defaultRole && !currentHero ? 'role' : 'role-disabled'} src={currentHero? roleImage : backgroundSupport} alt='support role'
                       onClick={handleSlotSelected}></img>;
        frameImg = <img className='select-frame' src={selectSupport} alt='select frame for support role'></img>;
    }

    return (
        <div className='team-role-select'>
            {roleImg}
            {frameImg}
        </div>
    )
}

function TeamComposition({isLoggedIn, updateTeamCompViewState, hero, confirmHeroSelection}: TeamCompProp) {

    return (
        <div className='team-comp'>
            <TeamSlot defaultRole={"tank"} hero={hero} slot={0} confirmHeroSelection={confirmHeroSelection}></TeamSlot>
            <TeamSlot defaultRole={"damage"} hero={hero} slot={1} confirmHeroSelection={confirmHeroSelection}></TeamSlot>
            <TeamSlot defaultRole={"damage"} hero={hero} slot={2} confirmHeroSelection={confirmHeroSelection}></TeamSlot>
            <TeamSlot defaultRole={"support"} hero={hero} slot={3} confirmHeroSelection={confirmHeroSelection}></TeamSlot>
            <TeamSlot defaultRole={"support"} hero={hero} slot={4} confirmHeroSelection={confirmHeroSelection}></TeamSlot>
            <Save isLoggedIn={isLoggedIn}></Save>
            <Load isLoggedIn={isLoggedIn} updateTeamCompViewState={updateTeamCompViewState}></Load>
        </div>)
}

export default TeamComposition;