import {describe, expect} from "vitest";
import {render} from "@testing-library/react";
import '@testing-library/jest-dom';
import teamDummyData from './data/TeamDummyData.json'
import heroDummyData from './data/HeroViewDummyData.json'
import TeamComposition, {Load, SaveAdd, SaveUpdate, TeamSlot} from "./TeamComposition.tsx";

const MockEmptyTeam = {
    id: 0,
    name: "",
    hero_1: {
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
    },
    hero_2: {
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
    },
    hero_3: {
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
    },
    hero_4: {
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
    },
    hero_5: {
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
    },
    created_at: "",
    average_winrate: ""
}

const MockEmptyHero = {
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

describe('Load', () => {
    it('should have load functionality disabled if not logged in', () => {
        const {container} = render(<Load updateTeamCompViewState={() => {
        }} isLoggedIn={false}></Load>)
        const disabledLoad = container.getElementsByClassName("loadBtn-disabled");
        expect(disabledLoad).not.toBeNull();
    })
})

describe('SaveUpdate', () => {
    it('should have save update functionality disabled if not logged in', () => {
        const {container} = render(<SaveUpdate teamComp={MockEmptyTeam} updateTeamComp={() => {
        }} numTeamComps={0} isLoggedIn={false}></SaveUpdate>)
        const disabledUpdate = container.getElementsByClassName("saveBtn-update-disabled");
        expect(disabledUpdate).not.toBeNull();
    })
})

describe('SaveAdd', () => {
    it('should have save add functionality disabled if not logged in', () => {
        const {container} = render(<SaveAdd teamComp={MockEmptyTeam} updateTeamComp={() => {
        }} numTeamComps={0} isLoggedIn={false}></SaveAdd>)
        const disabledAdd = container.getElementsByClassName("saveBtn-add-disabled");
        expect(disabledAdd).not.toBeNull();
    })
});

describe('TeamSlot', () => {
    it('should make a team slot interactable if hero has the corresponding role', () => {
        const {container} = render(<TeamSlot hero={MockEmptyHero} slot={0} defaultRole={"Support"}
                                             selectedHero={heroDummyData} confirmHeroSelection={() => {
        }}></TeamSlot>)
        const teamSlot = container.getElementsByClassName("role");
        expect(teamSlot.length).toBe(1);
    })

    it('should deactivate a team slot if hero does not have the corresponding role', () => {
        const {container} = render(
            <div>
                <TeamSlot hero={MockEmptyHero} slot={0} defaultRole={"Tank"}
                          selectedHero={heroDummyData} confirmHeroSelection={() => {
                }}></TeamSlot>
                <TeamSlot hero={MockEmptyHero} slot={0} defaultRole={"Damage"}
                          selectedHero={heroDummyData} confirmHeroSelection={() => {
                }}></TeamSlot>
            </div>)
        const disabledSlots = container.getElementsByClassName("role-disabled");
        expect(disabledSlots.length).toBe(2);
    })
})

describe('TeamComposition', () => {
    it('should render five team slots and the team comp menu', () => {
        const {container} = render(<TeamComposition
            updateTeamCompViewState={() => {
            }}
            selectedHero={MockEmptyHero}
            confirmHeroSelection={() => {
            }}
            isLoggedIn={false}
            teamComp={teamDummyData[0]}
            updateTeamComp={() => {
            }}
            numTeamComps={0}></TeamComposition>);

        const teamSlots = container.getElementsByClassName("team-role-select");
        const teamCompMenuButtons = container.getElementsByClassName("team-button-wrapper");

        expect(teamSlots.length).toBe(5);
        expect(teamCompMenuButtons.length).toBe(3);
    })
})