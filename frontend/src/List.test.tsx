import {describe, expect} from "vitest";
import {render, screen} from "@testing-library/react";
import List, {TeamList} from "./List.tsx";
import '@testing-library/jest-dom';
import teamDummyData from './data/TeamDummyData.json'
import heroDummyData from './data/HeroDummyData.json'

/* NOTE:
- teamDummyData has 3 team comps defined with names: Team01, Team02, Team03
- heroDummyData has 4 heroes defined (name and role correct only): Ana, Winston, Genji, Mizuki
*/
const MockFunction = () => {
    return;
}

describe("TeamList", () => {
    it("should always render an error message when team list is empty", () => {
        render(<TeamList input={""} teamCompList={[]} updateTeamComp={MockFunction}
                         updateNumTeamComps={MockFunction}></TeamList>);

        const errorText = screen.getByText('No Team Comps found.');
        expect(errorText).toBeInTheDocument();
    })

    it("should render full list as TeamListButtons when input is empty", () => {
        const {container} = render(<TeamList input={""} teamCompList={teamDummyData} updateTeamComp={MockFunction}
                                             updateNumTeamComps={MockFunction}></TeamList>);

        const listButtons = container.getElementsByClassName("scrollable-item");
        expect(listButtons).toHaveLength(3);
    })

    it("should render reduced list when filtering by input", () => {
        const {container} = render(<TeamList input={"03"} teamCompList={teamDummyData} updateTeamComp={MockFunction}
                                             updateNumTeamComps={MockFunction}></TeamList>);

        const listButtons = container.getElementsByClassName("scrollable-item");
        expect(listButtons).toHaveLength(1);
    })
})

describe("(Hero)List", () => {
    it("should always render an error message when hero list is empty", () => {
        render(<List input={""} heroList={[]} updateSelectedHero={MockFunction}></List>);

        const errorText = screen.getByText('List of Heroes could not be loaded.');
        expect(errorText).toBeInTheDocument();
    })

    it("should render all heroes as buttons in list when input is empty", () => {
        const {container} = render(<List input={""} heroList={heroDummyData} updateSelectedHero={MockFunction}></List>);

        const listButtons = container.getElementsByClassName("scrollable-item");
        expect(listButtons).toHaveLength(4);
    })

    it("should only render hero corresponding to name input", () => {
        const {container} = render(<List input={"Mizuki"} heroList={heroDummyData}
                                         updateSelectedHero={MockFunction}></List>);

        const listButtons = container.getElementsByClassName("scrollable-item");
        expect(listButtons).toHaveLength(1);
    })

    it("should only render heroes according to team role input", () => {
        const {container} = render(<List input={"support"} heroList={heroDummyData}
                                         updateSelectedHero={MockFunction}></List>);

        const listButtons = container.getElementsByClassName("scrollable-item");
        expect(listButtons).toHaveLength(2);
    })

    it("should render correct team role icon according to hero role", () => {
        const {container} = render(<List input={"mizuki"} heroList={heroDummyData}
                                         updateSelectedHero={MockFunction}></List>);

        const heroRoleImage = container.getElementsByClassName("hero-role") as unknown as HTMLImageElement[];
        expect(heroRoleImage[0].alt.toLowerCase()).toContain("support");
    })
})
