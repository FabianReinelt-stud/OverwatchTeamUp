import selectTank from './assets/teamcomp_select_tank.png'
import selectDamage from './assets/teamcomp_select_damage.png'
import selectSupport from './assets/teamcomp_select_support.png'
import backgroundSupport from './assets/teamcomp_bg_support.png'
import backgroundDamage from './assets/teamcomp_bg_damage.png'
import backgroundTank from './assets/teamcomp_bg_tank.png'
import {Tooltip} from '@mui/material'
import type {HeroDto, TeamCompositionCreateUpdateDto, TeamCompositionDto} from "./data/api-dtos.tsx";
import './TeamComposition.css'
import {fetchJsonWithAuthRefresh} from "./auth.ts";

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
    updateTeamComp: (teamCompUp: TeamCompositionDto) => void,
    incrementNumTeamComps?: (num: number, isModifier: boolean) => void,
    numTeamComps: number,
}

interface TeamSlotProp extends BaseTeamCompProp {
    hero: HeroDto,
    slot: number,
    defaultRole: string,
}

interface TeamCompProp extends BaseTeamCompProp, LoginStateProp, SaveTeamProp {
    updateTeamCompViewState: () => void,
}

const isFullTeam = (team: TeamCompositionDto) => {
    return team.hero_1.hero_key != ""
        && team.hero_2.hero_key != ""
        && team.hero_3.hero_key != ""
        && team.hero_4.hero_key != ""
        && team.hero_5.hero_key != ""
}

export function Load({isLoggedIn, updateTeamCompViewState}: LoadTeamProp) {
    const handleLoad = () => {
        if (!isLoggedIn) {
            return;
        }
        updateTeamCompViewState();
    }

    return (
        <div className="team-button-wrapper">
            <Tooltip
                title={isLoggedIn ? "Click to open Team Comp table" : "Please login to use the load function for your existing team compositions."}>
                <button onClick={handleLoad} className={isLoggedIn ? 'loadBtn' : 'loadBtn-disabled'}></button>
            </Tooltip>
        </div>
    )
}

export function SaveUpdate({isLoggedIn, teamComp, updateTeamComp}: SaveTeamProp) {
    const updateExistingTeam = () => {
        if (!isLoggedIn) {
            alert("Please login or register to update your team composition.");
            return;
        }
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

        fetchJsonWithAuthRefresh("/api/team-compositions/" + teamComp.id + "/update/", {
            method: "PUT",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(teamCompUpdate)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Team composition could not be updated");
                }
                return response.json();
            })
            .then(response => {
                updateTeamComp(response);
                alert(teamComp.name + " was successfully updated");
            })
            .catch(error => {
                console.log("could not update team: ", error)
                alert("Sorry but your team comp could not be updated. Please try again later.")
            })
    }

    return (
        <div className="team-button-wrapper">
            <Tooltip
                title={isLoggedIn ? "Click to update current Team Comp" : "Please login to use the update function for your existing team compositions."}>
                <button className={isLoggedIn ? 'saveBtn-update' : 'saveBtn-update-disabled'}
                        onClick={updateExistingTeam}></button>
            </Tooltip>
        </div>
    )
}

export function SaveAdd({isLoggedIn, teamComp, incrementNumTeamComps, updateTeamComp, numTeamComps}: SaveTeamProp) {
    const confirmTeamSave = () => {
        if (!isLoggedIn) {
            alert("Please login or register to save your team composition.");
            return;
        }
        if (!teamComp || !isFullTeam(teamComp)) {
            alert("Please create a full team comp to save.");
            return;
        }

        const teamName = prompt("Please input the name of the team", "Team " + (numTeamComps + 1));
        if (teamName) {
            const teamCompSave: TeamCompositionCreateUpdateDto = {
                name: teamName,
                hero_1_key: teamComp.hero_1.hero_key,
                hero_2_key: teamComp.hero_2.hero_key,
                hero_3_key: teamComp.hero_3.hero_key,
                hero_4_key: teamComp.hero_4.hero_key,
                hero_5_key: teamComp.hero_5.hero_key,
            }
            fetchJsonWithAuthRefresh("/api/team-compositions/create/", {
                method: "POST",
                body: JSON.stringify(teamCompSave)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Team composition could not be saved");
                    }
                    return response.json();
                })
                .then(response => {
                    if(incrementNumTeamComps) {
                        incrementNumTeamComps(1, true);
                    }
                    updateTeamComp(response);
                })
                .catch(error => {
                    console.log("could not save team comp: ", error);
                    alert("Sorry but your team comp could not be saved. Please try again later.");
                })
        }
    }

    return (
        <div className="team-button-wrapper">
            <Tooltip
                title={isLoggedIn ? "Click to save current Team Comp" : "Please login or register to use the save function for your current team composition."}>
                <button className={isLoggedIn ? 'saveBtn-add' : 'saveBtn-add-disabled'}
                        onClick={confirmTeamSave}></button>
            </Tooltip>
        </div>
    )
}

export function TeamSlot({defaultRole, selectedHero, hero, slot, confirmHeroSelection}: TeamSlotProp) {
    const normalizedDefaultRole = defaultRole.toLowerCase();
    const handleSlotSelected = () => {
        if (selectedHero.hero_key == "") {
            return;
        } else if (selectedHero.hero_key != ""
            && selectedHero.hero_key != hero.hero_key
            && selectedHero.role.toLowerCase() == normalizedDefaultRole) {
            confirmHeroSelection(slot);
        }
    }

    let roleImage;
    let frameImage;
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
            <img
                className={selectedHero.role.toLowerCase() == normalizedDefaultRole && selectedHero.hero_key != "" ? 'role' : 'role-disabled'}
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
                             selectedHero,
                             numTeamComps
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
            <SaveAdd isLoggedIn={isLoggedIn} teamComp={teamComp} incrementNumTeamComps={incrementNumTeamComps}
                     updateTeamComp={updateTeamComp} numTeamComps={numTeamComps}></SaveAdd>
            <SaveUpdate isLoggedIn={isLoggedIn} teamComp={teamComp} numTeamComps={numTeamComps}
                        updateTeamComp={updateTeamComp}></SaveUpdate>
            <Load isLoggedIn={isLoggedIn} updateTeamCompViewState={updateTeamCompViewState}></Load>
        </div>)
}

export default TeamComposition;
