import logo from './assets/logo.png'
import HeroView from './HeroView'
import SideBar from './SideBar'
import {useState} from 'react'
import './App.css'
import './fonts/big_noodle_titling.ttf'
import './fonts/big_noodle_titling_oblique.ttf'
import TeamComposition from "./TeamComposition";
import type {HeroDto, TeamCompositionDto} from "./data/api-dtos.tsx";

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
    id: 0,
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
    const [isLoggedIn, setIsLoggedIn] = useState(true);

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

    const [selectedHeroKey, setSelectedHeroKey] = useState("");
    const [selectedHero, setSelectedHero] = useState<HeroDto>(JSON.parse(JSON.stringify(emptyHero)));
    const [heroLoadingError, setHeroLoadingError] = useState(false);

    const updateSelectedHero = (heroKey: string) => {
        console.log("updated selected hero: ", heroKey)
        if (selectedHeroKey != "" && !isHeroInTeam(heroKey, currentTeamComp)) {
            fetch("/api/heroes/" + selectedHeroKey + "/", {method: "GET"})
                .then(response => response.json())
                .then(response => {
                    console.log("hero data successfully loaded for view: ", response);
                    setSelectedHeroKey(response.hero_key);
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
        if (!selectedHero || isHeroInTeam(selectedHero.hero_key, currentTeamComp)) return;
        switch (teamSlot) {
            case 0:
                setCurrentTeamComp({...currentTeamComp, hero_1: selectedHero});
                break;
            case 1:
                setCurrentTeamComp({...currentTeamComp, hero_2: selectedHero})
                break;
            case 2:
                setCurrentTeamComp({...currentTeamComp, hero_3: selectedHero})
                break;
            case 3:
                setCurrentTeamComp({...currentTeamComp, hero_4: selectedHero})
                break;
            case 4:
                setCurrentTeamComp({...currentTeamComp, hero_5: selectedHero})
                break;
        }
        setSelectedHero(JSON.parse(JSON.stringify(emptyHero)));
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
                        hero={selectedHero}
                        confirmHeroSelection={confirmHeroSelection}
                        teamComp={currentTeamComp}
                        incrementNumTeamComps={incrementNumTeamComps}
                    ></TeamComposition>
                </div>
                <SideBar updateLoginState={updateLoginState}
                         showTeamCompView={showTeamCompView}
                         updateSelectedHero={updateSelectedHero}
                         numTeamComps={numTeamComps}></SideBar>
            </div>
        </>
    )
}

export default App
