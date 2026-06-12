import './HeroView.css'
import {useState} from "react";
import type {AbilityDto, HeroDto} from "./data/api-dtos.tsx";

interface HeroStatProp {
    statName: string;
    statValue: string | number;
    statColor: string;
    rowStyle: React.CSSProperties;
}

interface HeroAbilityProp {
    abilities: AbilityDto[];
    abilityColor: string;
    rowStyle: React.CSSProperties;
}

interface HeroViewProp {
    heroKey: string
}

const messageStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
    height: "65%",
    border: "5px solid white",
    backgroundColor: "#050505",
    borderRadius: "10px",
    marginLeft: "10px",
    justifyContent: "safe center",
    alignItems: "center",
    lineHeight: "1.2"
}

const statRowStyle: React.CSSProperties = {
    gridTemplateColumns: "1fr 4.5fr"
}

const abilityRowStyle: React.CSSProperties = {
    gridTemplateColumns: "1fr 3fr",
    borderTop: "2px solid dimgrey"
}

function HeroView({heroKey}: HeroViewProp) {
    const [currentHeroKey, setCurrentHeroKey] = useState("");
    const [currentHero, setCurrentHero] = useState<HeroDto>();
    const [loadingError, setLoadingError] = useState(false);

    if (heroKey != currentHeroKey && currentHeroKey != "") {
        fetch("/api/heroes/" + heroKey + "/", {
            method: "GET"
        })
            .then(response => response.json())
            .then(response => {
                console.log("hero data successfully loaded for view: ", response);
                setCurrentHeroKey(response.hero_key);
                setCurrentHero(response);
                setLoadingError(false);
            })
            .catch(error => {
                console.log("could not load hero data for view: ", error);
                setLoadingError(true);
            });
    }

    let heroView;
    if (currentHero) {
        heroView = <HeroStats hero={currentHero}/>;
    } else {
        heroView = <div className="introduction" style={messageStyle}>
            <h2 style={{
                fontFamily: "BigNoodle, serif",
                fontSize: "1.8vw",
                color: "#fa9c1e",
                textDecoration: "overline"
            }}>Welcome to Overwatch Team Comps!</h2>
            <div style={{
                width: "65%",
                textAlign: "justify"
            }}>
                <p>This website is for finding the perfect <span>hero team compositions</span> to
                    stomp
                    all your enemies into dust during ranked.</p>
                <p>You can look up a hero's stats via the <span>search table on the right</span>.
                    The requested info will be displayed here.</p>
                <p>You can add the currently selected hero to your team
                    by <span>clicking on the desired team spot</span> at the bottom.</p>
                <p>With an account, <span>current team compositions can then be saved</span> or already <span>existing ones can be loaded in</span>.
                </p>
            </div>
        </div>;
    }

    return (
        <>
            {loadingError ?
                <div style={messageStyle}>The requested hero could not be loaded. Please try again
                    later.</div> : heroView}
        </>
    )
}

function HeroStats({hero}: { hero: HeroDto }) {
    return (<div className='hero-view'>
        <img className='hero-portrait' src={hero.portrait_url} alt='hero'></img>
        <div className='stat-view'>
            <div className='hero-name'>{hero.display_name}</div>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 2fr"}}>
                <HeroStatRow statName='Pickrate' statValue={hero.pickrate} statColor="#ffc70e"
                             rowStyle={statRowStyle}></HeroStatRow>
                <HeroStatRow statName='Winrate' statValue={hero.winrate} statColor="#ffc70e"
                             rowStyle={statRowStyle}></HeroStatRow>
            </div>
            <HeroStatRow statName='Role' statValue={hero.role} statColor="#ffc70e"
                         rowStyle={statRowStyle}></HeroStatRow>
            <HeroStatRow statName='Sub-Role' statValue={hero.subrole} statColor="#ffc70e"
                         rowStyle={statRowStyle}></HeroStatRow>
            <HeroStatRow statName='Health' statValue={hero.health} statColor="#ffc70e"
                         rowStyle={statRowStyle}></HeroStatRow>
            <HeroStatRow statName='Armor' statValue={hero.armor} statColor="#ffc70e"
                         rowStyle={statRowStyle}></HeroStatRow>
            <HeroStatRow statName='Shields' statValue={hero.shields} statColor="#ffc70e"
                         rowStyle={statRowStyle}></HeroStatRow>
            <HeroStatRow statName='Description' statValue={hero.description} statColor="#ffc70e" rowStyle={statRowStyle}>
            </HeroStatRow>
            <HeroAbilityRow abilities={hero.abilities} abilityColor="#ffc70e" rowStyle={abilityRowStyle}></HeroAbilityRow>
        </div>
    </div>);
}

function HeroAbilityRow({abilities, abilityColor, rowStyle}: HeroAbilityProp) {
    return (
        <div className='hero-stat-row' style={statRowStyle}>
            <div className='stat-name'>
                <p style={{backgroundColor: "#ffc70e"}}>Abilities</p></div>
            <div className='stat-value'>{
                abilities.map((ability) => (
                        <div style={{display: "grid"}}>
                            <div className="hero-stat-row" style={rowStyle}>
                                <div className="stat-name" style={{display: "flex", flexDirection: "column"}}>
                                    <p style={{backgroundColor: abilityColor}}>{ability.name}</p>
                                    <img
                                        src={ability.icon}
                                        style={{
                                            objectFit: "contain",
                                            width: "60%",
                                            height: "60%",
                                            margin: "auto"
                                        }}/>
                                </div>
                                <div className='stat-value'>{ability.description}</div>
                            </div>
                        </div>
                    )
                )
            }</div>
        </div>
    )
}

function HeroStatRow({statName, statValue, statColor, rowStyle}: HeroStatProp) {
    return (
        <div className='hero-stat-row' style={rowStyle}>
            <div className='stat-name'>
                <p style={{
                    backgroundColor: statColor
                }}>{statName}</p></div>
            <div className='stat-value'>{statValue}</div>
        </div>
    )
}

export default HeroView;