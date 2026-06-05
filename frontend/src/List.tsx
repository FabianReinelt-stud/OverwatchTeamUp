import support from './assets/support.png'
import damage from './assets/dmg.png'
import tank from './assets/tank.png'
import type { HeroSummary } from './SideBar';
import "./List.css"

interface ListProp {
    input: string;
    heroList: HeroSummary[];
}

function List({ input, heroList }: ListProp) {
    const filteredData = heroList.filter((el) => {
        if (input === '') {
            return el;
        } else {
            return el.display_name.toLowerCase().includes(input);
        }
    })


    const getHeroRoleImg = (role: string) => {
        role.toLowerCase();
        if (role == "tank") { return tank; }
        else if (role == "damage") { return damage; }
        return support;
    }

    let listItems;
    if (heroList === undefined || heroList.length == 0) {
        listItems = <div  style={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}><p>List of Heroes could not be loaded.</p><p>Please try again later.</p></div>
    } else {
        listItems = <ul className="scrollable-list">
            {filteredData.map((hero) => (
                <li className="scrollable-item" key={hero.hero_key}><img className="hero-preview" src={hero.portrait_url} alt="ana"></img> {hero.display_name} <img className="hero-role" src={getHeroRoleImg(hero.role)} alt='hero role'></img></li>
            ))}
        </ul>;
    }

    return (
        <div className="scrollable-container">
            {listItems}
        </div>
    )
}

export default List