import supportIcon from './assets/support.png'
import damageIcon from './assets/dmg.png'
import tankIcon from './assets/tank.png'
import deleteIcon from './assets/delete.png'
import "./List.css"
import type {HeroSummaryDto, TeamCompositionDto} from "./data/api-dtos.tsx";
import * as React from "react";
import {useState} from "react";
import {fetchWithAuthRefresh} from "./auth.ts";

interface HeroListProp {
    input: string;
    heroList: HeroSummaryDto[];
    updateSelectedHero: (selectedHero: string) => void;
}

interface TeamCompListProp {
    input: string,
    teamCompList: TeamCompositionDto[],
    updateTeamComp: (teamCompUp: TeamCompositionDto) => void
}

interface TeamListButtonProp {
    team: TeamCompositionDto,
    updateTeamComp: (teamCompUp: TeamCompositionDto) => void
}

const loadErrorStyle: React.CSSProperties = {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
};

const teamHeroPreviewStyle: React.CSSProperties = {
    width: "16%",
    borderRadius: "5px",
    padding: "1%"
}

const deleteTeam = (id: number) => {
    if(id == -1) {
        console.log("team id was not valid");
        return;
    }
    fetchWithAuthRefresh("/api/team-compositions/"+ id + "/delete/", {
        method: "DELETE",
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Team could not be deleted");
            }
        })
        .catch(error => {
            console.log("team could not be deleted:", error);
            alert("Sorry but your team comp could not be deleted. Please try again later.");
        })
}

export function TeamList({input, teamCompList, updateTeamComp}: TeamCompListProp) {
    console.log("updating team list")
    const filteredTeamComps = teamCompList.filter((team) => {
        const normalizedInput = input.toLowerCase();
        if (normalizedInput === '') {
            return team;
        } else {
            return team.name.toLowerCase().includes(normalizedInput);
        }
    });


    let teamListItems;
    if (teamCompList.length == 0) {
        teamListItems =
            <div style={loadErrorStyle}><p>No Team Comps found.</p><p>Please create a new ones or try again later.</p>
            </div>;
    } else {
        teamListItems =
            <ul className="scrollable-list">
                {filteredTeamComps.map((team) => (
                    <TeamListButton team={team} updateTeamComp={updateTeamComp} key={team.id}></TeamListButton>
                ))}
            </ul>;
    }

    return (
        <div className="scrollable-container" style={{margin: "auto"}}>
            {teamListItems}
        </div>
    )
}

function TeamListButton({team, updateTeamComp}: TeamListButtonProp) {
    const [teamComp] = useState(team);
    const [isBeingDeleted, setIsBeingDeleted] = useState(false);
    const handleTeamSelected = () => {
        if (!teamComp) {
            console.log("This button does not have an assigned team composition");
            return;
        }
        console.log("sending update: ", teamComp);
        updateTeamComp(teamComp);
    }

    return (
        <li className="scrollable-item" style={isBeingDeleted? {opacity: 0.5, pointerEvents: "none"} : {}}>
            <div style={{
                display: "grid",
                gridTemplateColumns: "8fr 1fr"
            }}>
            <button
                className="team-comp-button"
                onClick={handleTeamSelected}>
                <p style={{
                    gridRowStart: "1",
                    gridColumn: "1",
                    margin: "auto",
                }}>{team.name}</p>
                <p style={{
                    gridRowStart: "1",
                    gridColumn: "2",
                    margin: "auto",
                }}>Avg WR: {team.average_winrate}</p>
                <div style={{
                    margin: "auto",
                    gridRow: "2",
                    gridColumn: "1/ span 2"
                }}>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-evenly"
                    }}>
                        <img
                            src={team.hero_1.portrait_url}
                            alt={team.hero_1.display_name}
                            style={teamHeroPreviewStyle}></img>
                        <img
                            src={team.hero_2.portrait_url}
                            alt={team.hero_2.display_name}
                            style={teamHeroPreviewStyle}></img>
                        <img
                            src={team.hero_3.portrait_url}
                            alt={team.hero_3.display_name}
                            style={teamHeroPreviewStyle}></img>
                        <img
                            src={team.hero_4.portrait_url}
                            alt={team.hero_4.display_name}
                            style={teamHeroPreviewStyle}></img>
                        <img
                            src={team.hero_5.portrait_url}
                            alt={team.hero_5.display_name}
                            style={teamHeroPreviewStyle}></img>
                    </div>
                </div>
            </button>
            <img className="delete-button"
                 src={deleteIcon}
                 style={{
                     width: "90%",
                     margin: "auto",
                     zIndex: 5,
                 }}
                 alt="team comp delete button"
                 onClick={() => {
                     deleteTeam(team.id);
                     setIsBeingDeleted(true);
                 }}></img>
            </div>
        </li>)
}

function List({input, heroList, updateSelectedHero}: HeroListProp) {
    const filteredHeroes = heroList.filter((hero) => {
        const normalizedInput = input.toLowerCase();
        if (normalizedInput === '') {
            return hero;
        } else {
            return hero.display_name.toLowerCase().includes(normalizedInput)
                || hero.role.toLowerCase().includes(normalizedInput);
        }
    });

    const getHeroRoleImg = (role: string) => {
        const normalizedRole = role.toLowerCase();
        if (normalizedRole == "tank") {
            return tankIcon;
        } else if (normalizedRole == "damage") {
            return damageIcon;
        }
        return supportIcon;
    }

    let heroListItems;
    if (heroList.length == 0) {
        heroListItems =
            <div style={loadErrorStyle}><p>List of Heroes could not be loaded.</p><p>Please try again later.</p></div>;
    } else {
        heroListItems =
            <ul className="scrollable-list">
                {filteredHeroes.map((hero) => (
                    <li className="scrollable-item" key={hero.hero_key}>
                        <button
                            onClick={() => updateSelectedHero(hero.hero_key)}
                            style={{
                                display: "grid",
                                gridTemplateColumns: "2.5fr 6fr 1.5fr",
                                width: "100%",
                                background: "transparent",
                                border: "none",
                                fontSize: "1vw",
                                textAlign: "center",
                                placeItems: "center",
                                margin: "auto"
                            }}>
                            <img className="hero-preview"
                                 src={hero.portrait_url}
                                 alt="ana"></img>{hero.display_name}
                            <img className="hero-role" src={getHeroRoleImg(hero.role)} alt='hero role'></img>
                        </button>
                    </li>
                ))}
            </ul>;
    }

    return (
        <div className="scrollable-container" style={{margin: "15px auto"}}>
            {heroListItems}
        </div>
    )
}

export default List
