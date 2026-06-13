import selectTank from './assets/teamcomp_select_tank.png'
import selectDamage from './assets/teamcomp_select_damage.png'
import selectSupport from './assets/teamcomp_select_support.png'
import backgroundSupport from './assets/teamcomp_bg_support.png'
import backgroundDamage from './assets/teamcomp_bg_damage.png'
import backgroundTank from './assets/teamcomp_bg_tank.png'
import {Tooltip} from '@mui/material'
import type {HeroDto, TeamCompositionCreateUpdateDto, TeamCompositionDto} from "./data/api-dtos.tsx";
import './TeamComposition.css'

interface BaseTeamCompProp {
    selectedHero: HeroDto,
    confirmHeroSelection: (slot: number) => void
}

interface LoginStateProp {
    isLoggedIn: boolean
}

interface LoadTeamProp extends LoginStateProp {
    updateTeamCompViewState: () => void
}

interface SaveTeamProp extends LoginStateProp {
    teamComp: TeamCompositionDto,
    incrementNumTeamComps: () => void
    updateTeamComp: (teamCompUp: TeamCompositionDto) => void
}

interface TeamSlotProp extends BaseTeamCompProp {
    hero: HeroDto,
    slot: number,
    defaultRole: string,
}

interface TeamCompProp extends BaseTeamCompProp, LoginStateProp, SaveTeamProp {
    updateTeamCompViewState: () => void,
}

export function Load({isLoggedIn, updateTeamCompViewState}: LoadTeamProp) {
    return (
        <Tooltip
            title={isLoggedIn ? "Click to open Team Comp table" : "Please login or register to use the save function for your team composition."}>
            <button onClick={updateTeamCompViewState} className={isLoggedIn ? 'loadBtn' : 'loadBtn-disabled'}></button>
        </Tooltip>
    )
}

export function Save({isLoggedIn, teamComp, incrementNumTeamComps, updateTeamComp}: SaveTeamProp) {
    const confirmTeamSave = () => {
        if (!teamComp) {
            alert("Please create a team comp to save.");
            return;
        }
        const teamName = prompt("Please input the name of the team", "Team 01");
        if (teamName) {
            const teamCompSave: TeamCompositionCreateUpdateDto = {
                name: teamName,
                hero_1_key: teamComp.hero_1.hero_key,
                hero_2_key: teamComp.hero_2.hero_key,
                hero_3_key: teamComp.hero_3.hero_key,
                hero_4_key: teamComp.hero_4.hero_key,
                hero_5_key: teamComp.hero_5.hero_key,
            }
            fetch("/api/team-compositions/create/", {
                method: "POST",
                body: JSON.stringify(teamCompSave)
            })
                .then(response => response.json())
                .then(response => {
                    incrementNumTeamComps();
                    updateTeamComp(response);
                    console.log("created new team: ", response);
                    alert(teamName + " was successfully saved.");
                })
                .catch(error => {
                    console.log("could not save team comp: ", error);
                    alert("Sorry but your team comp could not be saved. Please try again later.");
                })
        }
    }

    const updateExistingTeam = () => {
        if (!teamComp) {
            alert("Something went wrong. Please reload the team you are trying to edit.")
            return;
        }

        const teamCompUpdate: TeamCompositionCreateUpdateDto = {
            name: teamComp.name,
            hero_1_key: teamComp.hero_1.hero_key,
            hero_2_key: teamComp.hero_2.hero_key,
            hero_3_key: teamComp.hero_3.hero_key,
            hero_4_key: teamComp.hero_4.hero_key,
            hero_5_key: teamComp.hero_5.hero_key,
        }

        fetch("/api/team-compositions/" + teamComp.id + "/update/", {
            method: "PUT",
            body: JSON.stringify(teamCompUpdate)
        })
            .then(response => response.json())
            .then(response => {
                updateTeamComp(response);
                console.log("updated existing team: ", response);
                alert(teamComp.name + " was successfully updated");
            })
            .catch(error => {
                console.log("could not update team: ", error)
                alert("Sorry but your team comp could not be updated. Please try again later.")
            })
    }

    return (
        <Tooltip
            title={isLoggedIn ? "Click to save current Team Comp" : "Please login or register to use the load function for your existing team compositions."}>
            <button className={isLoggedIn ? 'saveBtn' : 'saveBtn-disabled'}
                    onClick={teamComp.id == -1 ? confirmTeamSave : updateExistingTeam}></button>
        </Tooltip>
    )
}

function TeamSlot({defaultRole, selectedHero, hero, slot, confirmHeroSelection}: TeamSlotProp) {
    const heroRole = selectedHero.hero_key != "" ? selectedHero.role : "";
    heroRole.toLowerCase();
    defaultRole.toLowerCase();

    let roleImage;
    let frameImage;

    const handleSlotSelected = () => {
        if (selectedHero.hero_key == "") {
            return;
        } else if (selectedHero.hero_key != ""
            && selectedHero.hero_key != hero.hero_key
            && selectedHero.role == defaultRole) {
            console.log("placing hero " + hero.display_name + " into slot " + slot);
            confirmHeroSelection(slot);
        }
    }

    if (defaultRole === "tank") {
        roleImage = backgroundTank;
        frameImage = selectTank;
    } else if (defaultRole === "damage") {
        roleImage = backgroundDamage;
        frameImage = selectDamage;
    } else if (defaultRole === "support") {
        roleImage = backgroundSupport;
        frameImage = selectSupport;
    }

    return (
        <div className='team-role-select'>
            <img className={heroRole == defaultRole && selectedHero.hero_key != "" ? 'role' : 'role-disabled'}
                 src={hero.hero_key != "" ? hero.portrait_url : roleImage}
                 style={hero.hero_key != "" ? {
                     maskSize: "120%",
                     transform: "scale(0.85)"
                 } : {maskSize: "contain"}}
                 alt={defaultRole}
                 onClick={handleSlotSelected}></img>
            <img className='select-frame' src={frameImage} alt={defaultRole + " team slot frame"}></img>
        </div>
    )
}

function TeamComposition({
                             isLoggedIn,
                             updateTeamCompViewState,
                             confirmHeroSelection,
                             teamComp,
                             incrementNumTeamComps,
                             updateTeamComp,
                             selectedHero
                         }: TeamCompProp) {
    return (
        <div className='team-comp'>
            <TeamSlot defaultRole={"tank"} hero={teamComp.hero_1} selectedHero={selectedHero} slot={0}
                      confirmHeroSelection={confirmHeroSelection}></TeamSlot>
            <TeamSlot defaultRole={"damage"} hero={teamComp.hero_2} selectedHero={selectedHero} slot={1}
                      confirmHeroSelection={confirmHeroSelection}></TeamSlot>
            <TeamSlot defaultRole={"damage"} hero={teamComp.hero_3} selectedHero={selectedHero} slot={2}
                      confirmHeroSelection={confirmHeroSelection}></TeamSlot>
            <TeamSlot defaultRole={"support"} hero={teamComp.hero_4} selectedHero={selectedHero} slot={3}
                      confirmHeroSelection={confirmHeroSelection}></TeamSlot>
            <TeamSlot defaultRole={"support"} hero={teamComp.hero_5} selectedHero={selectedHero} slot={4}
                      confirmHeroSelection={confirmHeroSelection}></TeamSlot>
            <Save isLoggedIn={isLoggedIn} teamComp={teamComp} incrementNumTeamComps={incrementNumTeamComps}
                  updateTeamComp={updateTeamComp}></Save>
            <Load isLoggedIn={isLoggedIn} updateTeamCompViewState={updateTeamCompViewState}></Load>
        </div>)
}

export default TeamComposition;