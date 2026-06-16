import List, {TeamList} from './List.tsx'
import {useEffect, useState} from "react";
import UserContractViewToggle from "./UserContractView";
import SearchBar from "./SearchBar";
import type {HeroSummaryDto, TeamCompositionDto} from "./data/api-dtos.tsx";
import * as React from "react";
import {fetchWithAuthRefresh} from "./auth.ts";

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

interface SideBarProp {
    updateNumTeamComps: (num: number, isModifier: boolean) => void,
    numTeamComps: number,
    updateLoginState: (isLoggedIn: boolean) => void,
    isLoggedIn: boolean,
    updateSelectedHero: (heroKey: string) => void,
    updateTeamComp: (teamCompUp: TeamCompositionDto) => void
    showTeamCompView: boolean,
}

function SideBar({
                     updateLoginState,
                     showTeamCompView,
                     updateSelectedHero,
                     numTeamComps,
                     updateTeamComp,
                     updateNumTeamComps,
                     isLoggedIn
                 }: SideBarProp) {
    const [heroList, setHeroList] = useState<HeroSummaryDto[]>([]);
    const [heroText, setHeroText] = useState("");
    const [teamList, setTeamList] = useState<TeamCompositionDto[]>([]);
    const [teamText, setTeamText] = useState("");

    useEffect(() => {
        fetch("/api/heroes/", {
            method: "GET"
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error("Hero list request failed");
                }
                return response.json();
            })
            .then(response => {
                console.log("hero data successfully loaded: ", response);
                setHeroList(Array.isArray(response) ? response : []);
            })
            .catch(error => {
                console.log("could not load hero data: ", error);
            });
    }, []);

    useEffect(() => {
        if (showTeamCompView) {
            fetchWithAuthRefresh("/api/team-compositions/", {
                method: "GET",
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Team composition request failed");
                    }
                    return response.json();
                })
                .then(response => {
                    console.log("team data successfully loaded: ", response);
                    setTeamList(Array.isArray(response) ? response : []);
                    updateNumTeamComps(Array.isArray(response) ? response.length : 0, false);
                })
                .catch(error => {
                    console.log("could not load team data: ", error);
                    setTeamList([]);
                });
        }
    }, [showTeamCompView, numTeamComps, updateNumTeamComps]);

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
                }} searchBarAreaStyle={heroListAreaStyle} searchFieldStyle={heroListFieldStyle}
                           label={"Search Heroes"}></SearchBar>
                <UserContractViewToggle updateLoginState={updateLoginState} isLoggedIn={isLoggedIn}/>
            </div>
            <List input={heroText} heroList={heroList} updateSelectedHero={updateSelectedHero}/>
            {showTeamCompView ?
                <SearchBar
                    inputHandler={
                        (e: React.ChangeEvent<HTMLInputElement>) => {
                            const lowerCase = e.target.value.toLowerCase();
                            setTeamText(lowerCase);
                        }}
                    searchBarAreaStyle={teamListAreaStyle}
                    searchFieldStyle={teamListFieldStyle}
                    label={"Search " + numTeamComps + " Team Compositions"}>
                </SearchBar> :
                null}
            {showTeamCompView ?
                <TeamList teamCompList={teamList} input={teamText} updateTeamComp={updateTeamComp} updateNumTeamComps={updateNumTeamComps}></TeamList> :
                null}
        </div>
    );
}

export default SideBar;
