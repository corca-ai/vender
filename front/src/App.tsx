import axios from "axios";
import React from "react";
// import NoticeWriteComponent from "./components/NoticeWriteComponent._tsx";
// import Uploader from "./components/UploadFiles._tsx";
//css
import "./App.css";

interface State {
  selectedFile: File | null;
}

class App extends React.Component<{}, State> {

  constructor(props: any) {
    super(props);
    this.state = {
      selectedFile: null
    }

  }


  onChangeHandler = (event: any) => {
    this.setState({
      selectedFile: event.target.files[0],
    })
  }

  onClickHandler = () => {
    const data = new FormData()
    console.log(this.state.selectedFile)
    if (this.state.selectedFile) {
      data.append('file', this.state.selectedFile)
    }
    axios.post("http://localhost:4000/storage/upload", data, { // receive two parameter endpoint url ,form data 
    })
      .then(res => { // then print response status
        console.log(res.statusText)
      })


  }

  render() {
    return (

      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <form method="post" action="#" id="#">
              <div className="form-group files">
                <label>Upload Your File </label>
                <input type="file" className="form-control" onChange={this.onChangeHandler} />
              </div>
            </form>
          </div>
        </div>
        <button type="button" className="btn btn-success btn-block" onClick={this.onClickHandler}>Upload</button>

      </div>
    )
  };
}

export default App;
