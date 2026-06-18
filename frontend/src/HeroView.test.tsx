import {describe, expect} from "vitest";
import {render, screen} from "@testing-library/react";
import '@testing-library/jest-dom'
import HeroView, {HeroAbilityRow, HeroStats} from "./HeroView.tsx";
import heroViewDummyData from "./data/HeroViewDummyData.json"

/* NOTES:
* heroViewDummyData defines a hero with two abilities and placeholder text
* */

describe('HeroAbilityRow', () => {
    it('should render each hero ability nested under the Ability header', () => {
        const {container} = render(<HeroAbilityRow abilities={heroViewDummyData.abilities} abilityColor="#ffc70e"
                                                   rowStyle={{}}></HeroAbilityRow>)
        const abilityRowComponents = container.getElementsByClassName("stat-value");
        expect(abilityRowComponents.length).toBe(3);
    })
})

describe('HeroStats', () => {
    it('should render all hero stats', () => {
        const {container} = render(<HeroStats hero={heroViewDummyData}></HeroStats>)
        const heroStats = container.getElementsByClassName("hero-stat-row");
        expect(heroStats.length).toBe(11);
    })
})

describe('HeroView', () => {
    it('should render an introductory screen when no hero is selected', () => {
        const {container} = render(<HeroView currentHero={{
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
        }} loadingError={false}></HeroView>)
        const introduction = container.getElementsByClassName("introduction");
        expect(introduction).not.toBeNull();
    })

    it('should display an error message when there was a loading error', () => {
        render(<HeroView currentHero={{
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
        }} loadingError={true}></HeroView>);
        const errorText = screen.getByText("The requested hero could not be loaded. Please try again later.")
        expect(errorText).toBeInTheDocument();
    })

    it('should display an error message when there was a loading error', () => {
        const {container} = render(<HeroView currentHero={heroViewDummyData} loadingError={false}></HeroView>);
        const heroView = container.getElementsByClassName("hero-view");
        expect(heroView).not.toBeNull();
    })
})