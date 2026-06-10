import TextField from "@mui/material/TextField";
import "./SearchBar.css";
import * as React from "react";

interface SearchBarProp {
    inputHandler: (e: React.ChangeEvent<HTMLInputElement>) => void
    searchBarAreaStyle: React.CSSProperties,
    searchFieldStyle: React.CSSProperties,
    label: string
}

function SearchBar(
    {inputHandler, searchBarAreaStyle, searchFieldStyle, label}:  SearchBarProp
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
          label={label}
          sx={{
            input: {color: 'white'},
            label: {color: '#b8b8b9'},
            fieldset: {borderColor: 'white'}
          }}
        />
      </div>
    </div>
  );
}

export default SearchBar;