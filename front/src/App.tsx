import React from "react";
import Uploader from "./components/Uploader";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Uploader/>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
