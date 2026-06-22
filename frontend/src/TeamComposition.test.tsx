import {beforeEach, describe, expect, vi} from "vitest";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
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

beforeEach(() => {
    vi.restoreAllMocks();
});

describe('Load', () => {
    it('should have load functionality disabled if not logged in', () => {
        const {container} = render(<Load updateTeamCompViewState={() => {
        }} isLoggedIn={false}></Load>)
        const disabledLoad = container.getElementsByClassName("loadBtn-disabled");
        expect(disabledLoad).not.toBeNull();
    })

    it('opens the team table when logged in', () => {
        const updateTeamCompViewState = vi.fn();
        render(<Load updateTeamCompViewState={updateTeamCompViewState} isLoggedIn={true}/>);
        fireEvent.click(screen.getByRole("button", {name: "Load team composition"}));
        expect(updateTeamCompViewState).toHaveBeenCalledOnce();
    })
})

describe('SaveUpdate', () => {
    it('should have save update functionality disabled if not logged in', () => {
        const {container} = render(<SaveUpdate teamComp={MockEmptyTeam} updateTeamComp={() => {
        }} isLoggedIn={false}></SaveUpdate>)
        const disabledUpdate = container.getElementsByClassName("saveBtn-update-disabled");
        expect(disabledUpdate).not.toBeNull();
    })

    it('updates a loaded team composition', async () => {
        const updatedTeam = {...teamDummyData[0], name: "Updated"};
        vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(updatedTeam), {status: 200}));
        vi.spyOn(window, "alert").mockImplementation(() => undefined);
        const updateTeamComp = vi.fn();
        render(<SaveUpdate teamComp={teamDummyData[0]} updateTeamComp={updateTeamComp}
                           isLoggedIn={true}/>);
        fireEvent.click(screen.getByRole("button", {name: "Update team composition"}));
        await waitFor(() => expect(updateTeamComp).toHaveBeenCalledWith(updatedTeam));
    })

    it('reports an update failure', async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, {status: 500}));
        const alertMock = vi.spyOn(window, "alert").mockImplementation(() => undefined);
        render(<SaveUpdate teamComp={teamDummyData[0]} updateTeamComp={vi.fn()}
                           isLoggedIn={true}/>);
        fireEvent.click(screen.getByRole("button", {name: "Update team composition"}));
        await waitFor(() => expect(alertMock).toHaveBeenCalled());
    })
})

describe('SaveAdd', () => {
    it('should have save add functionality disabled if not logged in', () => {
        const {container} = render(<SaveAdd teamComp={MockEmptyTeam} updateTeamComp={() => {
        }} numTeamComps={0} isLoggedIn={false}></SaveAdd>)
        const disabledAdd = container.getElementsByClassName("saveBtn-add-disabled");
        expect(disabledAdd).not.toBeNull();
    })

    it('rejects incomplete teams', () => {
        const alertMock = vi.spyOn(window, "alert").mockImplementation(() => undefined);
        render(<SaveAdd teamComp={MockEmptyTeam} updateTeamComp={vi.fn()}
                        numTeamComps={0} isLoggedIn={true}/>);
        fireEvent.click(screen.getByRole("button", {name: "Save new team composition"}));
        expect(alertMock).toHaveBeenCalledWith("Please create a full team comp to save.");
    })

    it('creates a complete team composition', async () => {
        const savedTeam = {...teamDummyData[0], id: 99, name: "My Team"};
        vi.spyOn(window, "prompt").mockReturnValue("My Team");
        vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(savedTeam), {status: 201}));
        const updateTeamComp = vi.fn();
        const incrementNumTeamComps = vi.fn();
        render(<SaveAdd teamComp={teamDummyData[0]} updateTeamComp={updateTeamComp}
                        incrementNumTeamComps={incrementNumTeamComps} numTeamComps={2} isLoggedIn={true}/>);
        fireEvent.click(screen.getByRole("button", {name: "Save new team composition"}));
        await waitFor(() => expect(updateTeamComp).toHaveBeenCalledWith(savedTeam));
        expect(incrementNumTeamComps).toHaveBeenCalledWith(1, true);
    })
});

describe('TeamSlot', () => {
    it('should make a team slot interactable if hero has the corresponding role', () => {
        const {container} = render(<TeamSlot hero={MockEmptyHero} slot={0} defaultRole={"Support"}
                                             selectedHero={heroDummyData} confirmHeroSelection={() => {
        }}></TeamSlot>)
        const teamSlot = container.getElementsByClassName("role");
        expect(teamSlot).toHaveLength(1);
    })

    it('confirms selection on an enabled matching slot', () => {
        const confirmHeroSelection = vi.fn();
        render(<TeamSlot hero={MockEmptyHero} slot={4} defaultRole={"support"}
                         selectedHero={heroDummyData} confirmHeroSelection={confirmHeroSelection}/>);
        fireEvent.click(screen.getByRole("button", {name: "Select hero for support team slot"}));
        expect(confirmHeroSelection).toHaveBeenCalledWith(4);
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
        expect(disabledSlots).toHaveLength(2);
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

        expect(teamSlots).toHaveLength(5);
        expect(teamCompMenuButtons).toHaveLength(3);
    })
})
