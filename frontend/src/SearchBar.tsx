import { useState } from "react";
import TextField from "@mui/material/TextField";
import List from "./List"
import "./SearchBar.css";

function SearchBar() {
    const [inputText, setInputText] = useState("");
      let inputHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    var lowerCase = e.target.value.toLowerCase();
    setInputText(lowerCase);
  };

  return (
    <div className="search-bar-area">
      <div className="search">
        <TextField
          id="outlined-basic"
          onChange={inputHandler}
          variant="outlined"
          size="small"
          fullWidth
          label="Search"
          sx={{
            input: {color: 'white'},
            label: {color: 'white'},
            fieldset: {borderColor: 'white'}
          }}
        />
      </div>
      <List input={inputText}/>
    </div>
  );
}

export default SearchBar;