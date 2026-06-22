import {describe, expect} from "vitest";
import {render} from "@testing-library/react";
import '@testing-library/jest-dom';
import SideBar from "./SideBar.tsx";

describe('SideBar', () => {
    it('should always show Hero Table and corresponding search bar', () => {
        const {container} = render(
            <SideBar updateNumTeamComps={() => {
            }} numTeamComps={0} updateLoginState={() => {
            }} isLoggedIn={false} updateSelectedHero={() => {
            }} updateTeamComp={() => {
            }} showTeamCompView={false}></SideBar>)

        const visibleSearchBars = container.getElementsByClassName("search-bar-area");
        const visibleSearchTables = container.getElementsByClassName("scrollable-container");

        expect(visibleSearchBars).toHaveLength(1);
        expect(visibleSearchTables).toHaveLength(1);
    })

    it('should only show Team Table and corresponding search bar if toggled on', () => {
        const {container} = render(
            <div>
                <SideBar updateNumTeamComps={() => {
                }} numTeamComps={0} updateLoginState={() => {
                }} isLoggedIn={false} updateSelectedHero={() => {
                }} updateTeamComp={() => {
                }} showTeamCompView={true}></SideBar>
            </div>);

        const visibleSearchBars = container.getElementsByClassName("search-bar-area");
        const visibleSearchTables = container.getElementsByClassName("scrollable-container");

        expect(visibleSearchBars).toHaveLength(2);
        expect(visibleSearchTables).toHaveLength(2);
    })
})
