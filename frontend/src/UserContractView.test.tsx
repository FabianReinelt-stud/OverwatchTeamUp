import {describe, expect} from "vitest";
import {render, screen} from "@testing-library/react";
import '@testing-library/jest-dom'
import UserContractViewToggle from "./UserContractView.tsx";
import UserContractView from "./UserContractView.tsx";

describe('UserContractView', () => {
    it('should show Login screen if user is not logged in', () => {
        const {container} = render(
            <UserContractView updateLoginState={() => {}} isLoggedIn={false}></UserContractView>)

        const loginScreen = container.getElementsByClassName("login-wrapper");
        expect(loginScreen).not.toBeNull();
    })

    it('should show LoginSuccess screen if user is logged in', () => {
        const {container} = render(
            <UserContractView updateLoginState={() => {}} isLoggedIn={true}></UserContractView>)

        const loginSuccessScreen = container.getElementsByClassName("login-success-wrapper");
        expect(loginSuccessScreen).not.toBeNull();
    })
})