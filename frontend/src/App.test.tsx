import {beforeEach, describe, expect, it, vi} from "vitest";
import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import "@testing-library/jest-dom";
import type {HeroDto, TeamCompositionDto} from "./data/api-dtos.tsx";

interface MockSideBarProps {
    isLoggedIn: boolean;
    showTeamCompView: boolean;
    numTeamComps: number;
    updateLoginState: (value: boolean) => void;
    updateNumTeamComps: (value: number, isModifier: boolean) => void;
    updateSelectedHero: (heroKey: string) => void;
    updateTeamComp: (team: TeamCompositionDto) => void;
}

interface MockTeamCompositionProps {
    teamComp: TeamCompositionDto;
    updateTeamCompViewState: () => void;
    confirmHeroSelection: (slot: number) => void;
}

vi.mock("./HeroView", () => ({
    default: ({currentHero, loadingError}: {currentHero: {hero_key: string}, loadingError: boolean}) =>
        <div data-testid="hero-view">{currentHero.hero_key}:{String(loadingError)}</div>,
}));

vi.mock("./SideBar", () => ({
    default: (props: MockSideBarProps) => {
        const loadedHero: HeroDto = {
            hero_key: "ana", display_name: "Ana", role: "support", subrole: "", winrate: "", pickrate: "",
            health: 250, armor: 0, shields: 0, portrait_url: "", description: "", abilities: [],
        };
        return <div>
        <span data-testid="sidebar-state">{String(props.isLoggedIn)}:{String(props.showTeamCompView)}:{props.numTeamComps}</span>
        <button onClick={() => props.updateLoginState(!props.isLoggedIn)}>login-state</button>
        <button onClick={() => props.updateNumTeamComps(2, false)}>set-count</button>
        <button onClick={() => props.updateNumTeamComps(1, true)}>increment-count</button>
        <button onClick={() => props.updateSelectedHero("ana")}>select-hero</button>
        <button onClick={() => props.updateSelectedHero("../bad")}>select-invalid</button>
        <button onClick={() => props.updateTeamComp({
            id: 1, name: "Loaded", created_at: "", average_winrate: "",
            hero_1: {...loadedHero, hero_key: ""},
            hero_2: loadedHero,
            hero_3: loadedHero,
            hero_4: loadedHero,
            hero_5: loadedHero,
        })}>load-team</button>
    </div>},
}));

vi.mock("./TeamComposition", () => ({
    default: (props: MockTeamCompositionProps) => <div>
        <span data-testid="team-state">{props.teamComp.name}:{props.teamComp.hero_1.hero_key}:{props.teamComp.hero_2.hero_key}:{props.teamComp.hero_3.hero_key}:{props.teamComp.hero_4.hero_key}:{props.teamComp.hero_5.hero_key}</span>
        <button onClick={props.updateTeamCompViewState}>toggle-team-view</button>
        {[0, 1, 2, 3, 4].map(slot => <button key={slot} onClick={() => props.confirmHeroSelection(slot)}>slot-{slot}</button>)}
    </div>,
}));

import App from "./App.tsx";

const hero = {
    hero_key: "ana", display_name: "Ana", role: "support", subrole: "", winrate: "", pickrate: "",
    health: 250, armor: 0, shields: 0, portrait_url: "", description: "", abilities: [],
};

describe("App", () => {
    beforeEach(() => {
        localStorage.clear();
        vi.restoreAllMocks();
    });

    it("coordinates login, counters, team view and hero selection", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify(hero), {status: 200}));
        render(<App />);

        expect(screen.getByTestId("sidebar-state")).toHaveTextContent("false:false:0");
        fireEvent.click(screen.getByText("login-state"));
        fireEvent.click(screen.getByText("toggle-team-view"));
        fireEvent.click(screen.getByText("set-count"));
        fireEvent.click(screen.getByText("increment-count"));
        expect(screen.getByTestId("sidebar-state")).toHaveTextContent("true:true:3");

        fireEvent.click(screen.getByText("select-invalid"));
        fireEvent.click(screen.getByText("select-hero"));
        await waitFor(() => expect(screen.getByTestId("hero-view")).toHaveTextContent("ana:false"));
        fireEvent.click(screen.getByText("slot-0"));
        expect(screen.getByTestId("team-state")).toHaveTextContent("defaultName:ana");

        fireEvent.click(screen.getByText("load-team"));
        fireEvent.click(screen.getByText("slot-1"));
        fireEvent.click(screen.getByText("slot-2"));
        fireEvent.click(screen.getByText("slot-3"));
        fireEvent.click(screen.getByText("slot-4"));
        expect(screen.getByTestId("team-state")).toHaveTextContent("Loaded");

        fireEvent.click(screen.getByText("login-state"));
        expect(screen.getByTestId("sidebar-state")).toHaveTextContent("false:false:0");
    });

    it("shows a loading error after a failed hero request and reacts to auth events", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, {status: 500}));
        render(<App />);
        fireEvent.click(screen.getByText("select-hero"));
        await waitFor(() => expect(screen.getByTestId("hero-view")).toHaveTextContent(":true"));

        localStorage.setItem("accessToken", "token");
        window.dispatchEvent(new Event("auth-changed"));
        await waitFor(() => expect(screen.getByTestId("sidebar-state")).toHaveTextContent("true"));
    });
});
