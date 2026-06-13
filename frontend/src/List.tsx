import support from './assets/support.png'
import damage from './assets/dmg.png'
import tank from './assets/tank.png'
import "./List.css"
import type {HeroSummaryDto, TeamCompositionDto} from "./data/api-dtos.tsx";
import * as React from "react";
import {useState} from "react";

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

export function TeamList({input, teamCompList, updateTeamComp}: TeamCompListProp) {
    const filteredTeamComps = teamCompList.filter((team) => {
        if (input === '') {
            return team;
        } else {
            return team.name.toLowerCase().includes(input);
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
    const handleTeamSelected = () => {
        if(!teamComp){
            console.log("This button does not have an assigned team composition");
            return;
        }
        console.log("sending update: ", teamComp);
        updateTeamComp(teamComp);
    }

    return (
        <li className="scrollable-item">
            <button
                style={{
                    display: "grid",
                    gridTemplateColumns: "3fr 2fr",
                    gridTemplateRows: "0.5fr 1fr",
                    fontSize: "0.7em",
                    background: "transparent",
                    border: "none",
                }}
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
                            src={team.hero_3.portrait_url}
                            alt={team.hero_3.display_name}
                            style={teamHeroPreviewStyle}></img>
                        <img
                            src={team.hero_3.portrait_url}
                            alt={team.hero_3.display_name}
                            style={teamHeroPreviewStyle}></img>
                    </div>
                </div>
            </button>
        </li>)
}

function List({input, heroList, updateSelectedHero}: HeroListProp) {
    const filteredHeroes = heroList.filter((hero) => {
        if (input === '') {
            return hero;
        } else {
            return hero.display_name.toLowerCase().includes(input);
        }
    });

    const getHeroRoleImg = (role: string) => {
        role.toLowerCase();
        if (role == "tank") {
            return tank;
        } else if (role == "damage") {
            return damage;
        }
        return support;
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