import logo from './assets/logo.png'
import HeroView from './HeroView'
import SideBar from './SideBar'
import {useEffect, useState} from 'react'
import './App.css'
import './fonts/big_noodle_titling.ttf'
import './fonts/big_noodle_titling_oblique.ttf'
import TeamComposition from "./TeamComposition";
import type {HeroDto, TeamCompositionDto} from "./data/api-dtos.tsx";
import {AUTH_CHANGED_EVENT} from "./auth.ts";

const emptyHero = {
    hero_key: "",
    display_name: "",
    role: "",
    subrole: "",
    winrate: "",
    pickrate: "",
    health: 0,
    armor: 0,
    shields: 0,
    portrait_url: "",
    description: "",
    abilities: []
}

const emptyTeamComp = {
    id: -1,
    name: "defaultName",
    hero_1: emptyHero,
    hero_2: emptyHero,
    hero_3: emptyHero,
    hero_4: emptyHero,
    hero_5: emptyHero,
    created_at: "undefined",
    average_winrate: "undefined"
}

const isHeroInTeam = (heroKey: string, currentTeamComp: TeamCompositionDto) => {
    return heroKey == currentTeamComp.hero_1.hero_key
        || heroKey == currentTeamComp.hero_2.hero_key
        || heroKey == currentTeamComp.hero_3.hero_key
        || heroKey == currentTeamComp.hero_4.hero_key
        || heroKey == currentTeamComp.hero_5.hero_key;
}

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem("accessToken")));

    useEffect(() => {
        const updateAuthState = () => setIsLoggedIn(Boolean(localStorage.getItem("accessToken")));

        window.addEventListener(AUTH_CHANGED_EVENT, updateAuthState);
        return () => window.removeEventListener(AUTH_CHANGED_EVENT, updateAuthState);
    }, []);

    const updateLoginState = (isLoggedIn: boolean) => {
        setIsLoggedIn(isLoggedIn);
    }

    const [showTeamCompView, setShowTeamCompView] = useState(false);
    const [numTeamComps, setNumTeamComps] = useState(0);
    const [currentTeamComp, setCurrentTeamComp] = useState<TeamCompositionDto>(JSON.parse(JSON.stringify(emptyTeamComp)));

    const updateTeamCompViewState = () => {
        setShowTeamCompView(!showTeamCompView);
    }

    const incrementNumTeamComps = () => {
        setNumTeamComps(numTeamComps => numTeamComps + 1);
    }

    const updateTeamComp = (teamComp: TeamCompositionDto) => {
        setCurrentTeamComp(teamComp);
        console.log("updated team composition: ", teamComp)
    }

    const [selectedHero, setSelectedHero] = useState<HeroDto>(emptyHero);
    const [heroLoadingError, setHeroLoadingError] = useState(false);

    const updateSelectedHero = (heroKey: string) => {
        console.log("updated selected hero: ", heroKey)
        if (heroKey != "" && !isHeroInTeam(heroKey, currentTeamComp)) {
            fetch("/api/heroes/" + heroKey + "/", {method: "GET"})
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Hero detail request failed");
                    }
                    return response.json();
                })
                .then(response => {
                    console.log("hero data successfully loaded for view: ", response);
                    setSelectedHero(response);
                    setHeroLoadingError(false);
                })
                .catch(error => {
                    console.log("could not load hero data for view: ", error);
                    setHeroLoadingError(true);
                });
        }
    }

    const confirmHeroSelection = (teamSlot: number) => {
        if (!selectedHero) {
            return;
        }
        const isInTeam = isHeroInTeam(selectedHero.hero_key, currentTeamComp);

        switch (teamSlot) {
            case 0:
                setCurrentTeamComp({...currentTeamComp, hero_1: selectedHero});
                break;
            case 1:
                if (isInTeam && selectedHero.hero_key == currentTeamComp.hero_3.hero_key) {
                    setCurrentTeamComp({...currentTeamComp, hero_2: selectedHero, hero_3: emptyHero})
                } else {
                    setCurrentTeamComp({...currentTeamComp, hero_2: selectedHero})
                }
                break;
            case 2:
                if (isInTeam && selectedHero.hero_key == currentTeamComp.hero_2.hero_key) {
                    setCurrentTeamComp({...currentTeamComp, hero_2: emptyHero, hero_3: selectedHero})
                } else {
                    setCurrentTeamComp({...currentTeamComp, hero_3: selectedHero})
                }
                break;
            case 3:
                if (isInTeam && selectedHero.hero_key == currentTeamComp.hero_5.hero_key) {
                    setCurrentTeamComp({...currentTeamComp, hero_4: selectedHero, hero_5: emptyHero})
                } else {
                    setCurrentTeamComp({...currentTeamComp, hero_4: selectedHero})
                }
                break;
            case 4:
                if (isInTeam && selectedHero.hero_key == currentTeamComp.hero_4.hero_key) {
                    setCurrentTeamComp({...currentTeamComp, hero_4: emptyHero, hero_5: selectedHero})
                } else {
                    setCurrentTeamComp({...currentTeamComp, hero_5: selectedHero})
                }
                break;
        }
    }

    return (
        <>
            <div className='overwatch-team-comp'>
                <p className="small-screen">We're sorry but this website is best viewed and used at a taller screen
                    ratio.</p>
                <div className='main-view'>
                    <div className='logo'>
                        <img className='logo-img' src={logo} alt='logo'></img>
                    </div>
                    <HeroView currentHero={selectedHero} loadingError={heroLoadingError}></HeroView>
                    <TeamComposition
                        isLoggedIn={isLoggedIn}
                        updateTeamCompViewState={updateTeamCompViewState}
                        selectedHero={selectedHero}
                        confirmHeroSelection={confirmHeroSelection}
                        teamComp={currentTeamComp}
                        incrementNumTeamComps={incrementNumTeamComps}
                        updateTeamComp={updateTeamComp}
                    ></TeamComposition>
                </div>
                <SideBar updateLoginState={updateLoginState}
                         updateTeamComp={updateTeamComp}
                         updateSelectedHero={updateSelectedHero}
                         showTeamCompView={showTeamCompView}
                         numTeamComps={numTeamComps}></SideBar>
            </div>
        </>
    )
}

export default App
