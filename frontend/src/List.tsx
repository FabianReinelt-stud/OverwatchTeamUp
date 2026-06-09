import support from './assets/support.png'
import damage from './assets/dmg.png'
import tank from './assets/tank.png'
import "./List.css"
import type {HeroSummaryDto, TeamCompositionDto} from "./data/api-dtos.tsx";
import * as React from "react";

interface HeroListProp {
    input: string;
    heroList: HeroSummaryDto[];
}

interface TeamCompListProp {
    input: string;
    teamCompList: TeamCompositionDto[];
}

const loadErrorStyle: React.CSSProperties = {
    height: '100%',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
};

export function TeamList({input, teamCompList}: TeamCompListProp) {
    const filteredTeamComps = teamCompList.filter((team) => {
        if (input === '') {
            return team;
        } else {
            return team.name.toLowerCase().includes(input);
        }
    });

    let teamListItems;

    if (teamCompList.length == 0) {
        teamListItems = <div style={loadErrorStyle}><p>No Team Comps found.</p><p>Please create a new one or try again later.</p></div>;
    } else {
        teamListItems =
            <ul className="scrollable-list">
                {filteredTeamComps.map((team) => (
                    <li className="scrollable-item" key={team.id}>{team.name}</li>
                ))}
            </ul>;
    }

    return (
        <div className="scrollable-container"
             style={{
                 gridColumn: '1 / span 2',
                 gridRowStart: '5'
             }}>
            {teamListItems}
        </div>
    )
}

function List({input, heroList}: HeroListProp) {
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
        heroListItems = <div style={loadErrorStyle}><p>List of Heroes could not be loaded.</p><p>Please try again later.</p></div>;;
    } else {
        heroListItems =
            <ul className="scrollable-list">
                {filteredHeroes.map((hero) => (
                    <li className="scrollable-item" key={hero.hero_key}>
                        <img className="hero-preview"
                             src={hero.portrait_url}
                             alt="ana"></img>{hero.display_name}
                        <img className="hero-role" src={getHeroRoleImg(hero.role)} alt='hero role'></img></li>
                ))}
            </ul>;
    }

    return (
        <div className="scrollable-container"
             style={{
                 gridColumn: '1 / span 2',
                 gridRowStart: '3'
             }}>
            {heroListItems}
        </div>
    )
}

export default List