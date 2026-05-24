import TextField from "@mui/material/TextField";
import "./SearchBar.css";

interface InputHandlingProp{
  inputHandler: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function SearchBar({inputHandler}: InputHandlingProp) {
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
    </div>
  );
}

export default SearchBar;