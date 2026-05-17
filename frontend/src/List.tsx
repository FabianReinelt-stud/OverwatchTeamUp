import data from "./DummyListData.json"
import heroPortrait from './assets/ana.png'
import heroRole from './assets/support.png'
import "./List.css"

interface ListProp{
    input: string;
}

function List({input}: ListProp) {
    const filteredData = data.filter((el) =>{
        if(input === ''){
            return el;
        } else{
            return el.text.toLowerCase().includes(input);
        }
    })

    /*TODO: */
    return (
        <div className="scrollable-container">
        <ul className="scrollable-items">
            {filteredData.map((item) => (
                <li key={item.id}><img className="hero-preview" src={heroPortrait} alt="ana"></img> {item.text} <img className="hero-role" src={heroRole} alt='hero role'></img></li>
            ))}
        </ul>
        </div>
    )
}

export default List