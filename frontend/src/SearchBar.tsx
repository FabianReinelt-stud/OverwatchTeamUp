import TextField from "@mui/material/TextField";
import "./SearchBar.css";
import * as React from "react";

interface SearchBarProp {
    inputHandler: (e: React.ChangeEvent<HTMLInputElement>) => void
    searchBarAreaStyle: React.CSSProperties,
    searchFieldStyle: React.CSSProperties
}

function SearchBar(
    {inputHandler, searchBarAreaStyle, searchFieldStyle}:  SearchBarProp
    ) {
  return (
    <div className="search-bar-area" style={searchBarAreaStyle}>
      <div className="search-field" style={searchFieldStyle}>
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
    </div>
  );
}

export default SearchBar;