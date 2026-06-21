import logo from './assets/logo.png'
import HeroView from './HeroView'
import SideBar from './SideBar'
import {useCallback, useEffect, useState} from 'react'
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

const isValidHeroKey = (heroKey: string) => /^[a-z0-9-]{1,30}$/.test(heroKey);

const selectHeroForTeamSlot = (
    teamSlot: number,
    selectedHero: HeroDto,
    currentTeamComp: TeamCompositionDto,
): TeamCompositionDto => {
    const isInTeam = isHeroInTeam(selectedHero.hero_key, currentTeamComp);
    const replacesHero = (otherSlotHero: HeroDto) => isInTeam && selectedHero.hero_key === otherSlotHero.hero_key;

    switch (teamSlot) {
        case 0:
            return {...currentTeamComp, hero_1: selectedHero};
        case 1:
            return replacesHero(currentTeamComp.hero_3)
                ? {...currentTeamComp, hero_2: selectedHero, hero_3: emptyHero}
                : {...currentTeamComp, hero_2: selectedHero};
        case 2:
            return replacesHero(currentTeamComp.hero_2)
                ? {...currentTeamComp, hero_2: emptyHero, hero_3: selectedHero}
                : {...currentTeamComp, hero_3: selectedHero};
        case 3:
            return replacesHero(currentTeamComp.hero_5)
                ? {...currentTeamComp, hero_4: selectedHero, hero_5: emptyHero}
                : {...currentTeamComp, hero_4: selectedHero};
        case 4:
            return replacesHero(currentTeamComp.hero_4)
                ? {...currentTeamComp, hero_4: emptyHero, hero_5: selectedHero}
                : {...currentTeamComp, hero_5: selectedHero};
        default:
            return currentTeamComp;
    }
};

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem("accessToken")));

    useEffect(() => {
        const updateAuthState = () => setIsLoggedIn(Boolean(localStorage.getItem("accessToken")));

        globalThis.addEventListener(AUTH_CHANGED_EVENT, updateAuthState);
        return () => globalThis.removeEventListener(AUTH_CHANGED_EVENT, updateAuthState);
    }, []);

    useEffect(() => {
        if (!isLoggedIn) {
            setNumTeamComps(0);
            setShowTeamCompView(false);
            setCurrentTeamComp(structuredClone(emptyTeamComp));
        }
    }, [isLoggedIn]);

    const updateLoginState = useCallback((isLoggedIn: boolean) => {
        setIsLoggedIn(isLoggedIn);
    }, []);

    const [showTeamCompView, setShowTeamCompView] = useState(false);
    const [numTeamComps, setNumTeamComps] = useState(0);
    const [currentTeamComp, setCurrentTeamComp] = useState<TeamCompositionDto>(structuredClone(emptyTeamComp));

    const updateTeamCompViewState = useCallback(() => {
        setShowTeamCompView(!showTeamCompView);
    }, [showTeamCompView]);

    const updateNumTeamComps = useCallback((num: number, isModifier: boolean) => {
        if(isModifier){
            setNumTeamComps(numTeamComps => numTeamComps + num);
        } else {
            setNumTeamComps(num);
        }
    }, []);

    const updateTeamComp = useCallback((teamComp: TeamCompositionDto) => {
        setCurrentTeamComp(teamComp);
    }, []);

    const [selectedHero, setSelectedHero] = useState<HeroDto>(emptyHero);
    const [heroLoadingError, setHeroLoadingError] = useState(false);

    const updateSelectedHero = (heroKey: string) => {
        console.log("updated selected hero: ", heroKey)
        if (isValidHeroKey(heroKey)) {
            const encodedHeroKey = encodeURIComponent(heroKey);
            fetch(`/api/heroes/${encodedHeroKey}/`, {method: "GET"})
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Hero detail request failed");
                    }
                    return response.json();
                })
                .then(response => {
                    setSelectedHero(response);
                    setHeroLoadingError(false);
                })
                .catch(() => {
                    console.error("Could not load hero data for view");
                    setHeroLoadingError(true);
                });
        }
    }

    const confirmHeroSelection = (teamSlot: number) => {
        setCurrentTeamComp(selectHeroForTeamSlot(teamSlot, selectedHero, currentTeamComp));
    }

    return (
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
                        incrementNumTeamComps={updateNumTeamComps}
                        updateTeamComp={updateTeamComp}
                        numTeamComps={numTeamComps}
                    ></TeamComposition>
                </div>
                <SideBar updateLoginState={updateLoginState}
                         updateTeamComp={updateTeamComp}
                         updateSelectedHero={updateSelectedHero}
                         showTeamCompView={showTeamCompView}
                         updateNumTeamComps={updateNumTeamComps}
                         numTeamComps={numTeamComps}
                         isLoggedIn={isLoggedIn}></SideBar>
        </div>
    )
}

export default App
