import List, {TeamList} from './List.tsx'
import {useState} from "react";
import UserContractViewToggle from "./UserContractView";
import SearchBar from "./SearchBar";
import type {UserContract} from './App';
import dummyData from "./data/HeroDummyData.json"
import teamDummyData from "./data/TeamDummyData.json"
import type {HeroSummaryDto, TeamCompositionDto} from "./data/api-dtos.tsx";
import * as React from "react";

const heroListAreaStyle = {
    gridRow: '1 / 1'
}

const heroListFieldStyle = {
    width: '90%',
    marginTop: '75px',
    marginBottom: '10px'
}

const teamListAreaStyle = {
    gridRowStart: '4',
    gridColumnStart: '1',
    gridColumnEnd: 'span 2'
}

const teamListFieldStyle = {
    width: '85%',
    margin: '15px auto 10px auto'
}

function SideBar({loginCb}: { loginCb: (user: UserContract) => void }) {
    const [heroList, setHeroList] = useState<HeroSummaryDto[]>(dummyData); //TODO: replace dummyData with empty [] later
    const [heroText, setHeroText] = useState("");

    fetch("/api/heroes/", {
        method: "GET"
    })
        .then(response => response.json())
        .then(response => {
            console.log("hero data successfully loaded: ", response);
            setHeroList(response);
        })
        .catch(error => {
            console.log("could not load hero data: ", error);
        });

    const [teamList, setTeamList] = useState<TeamCompositionDto[]>(teamDummyData);
    const [teamText, setTeamText] = useState("");

    fetch("/api/team-compositions/", {
        method: "GET"
    })
        .then(response => response.json())
        .then(response => {
            console.log("team data successfully loaded: ", response);
            setTeamList(response);
        })
        .catch(error => {
            console.log("could not load team data: ", error);
        });

    return (
        <div className='side-bar' style={{
            display: "flex",
            flexDirection: "column",
            height: "98vh"
        }}>
            <div style={{
                display: "grid",
                gridTemplateColumns: "3fr 1fr"
            }}>
                <SearchBar inputHandler={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const lowerCase = e.target.value.toLowerCase();
                    setHeroText(lowerCase);
                }} searchBarAreaStyle={heroListAreaStyle} searchFieldStyle={heroListFieldStyle} label={"Search Heroes"}></SearchBar>
                <UserContractViewToggle loginCb={loginCb}/>
            </div>
            <List input={heroText} heroList={heroList}/>
            <SearchBar inputHandler={(e: React.ChangeEvent<HTMLInputElement>) => {
                const lowerCase = e.target.value.toLowerCase();
                setTeamText(lowerCase);
            }} searchBarAreaStyle={teamListAreaStyle} searchFieldStyle={teamListFieldStyle} label={"Search Team Compositions"}></SearchBar>
            <TeamList teamCompList={teamList} input={teamText}></TeamList>
        </div>
    );
}

export default SideBar;