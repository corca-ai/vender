import axios from "axios";
import React from "react";
// import NoticeWriteComponent from "./components/NoticeWriteComponent._tsx";
// import Uploader from "./components/UploadFiles._tsx";
//css

import { Form, ProgressBar } from "react-bootstrap";
import axiosPostVideo from "./axios";

interface State {
  selectedFile: File | null;
  processingState: string;
  videoProgress: number;
}

class App extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      selectedFile: null,
      processingState: "No Video Uploaded",
      videoProgress: 0,
    };
  }

  onChangeHandler = (event: any) => {
    this.setState({
      selectedFile: event.target.files[0],
    });
  };

  onClickHandler = async () => {
    const data = new FormData();
    console.log(this.state.selectedFile);
    if (this.state.selectedFile) {
      data.append("file", this.state.selectedFile);
    } else {
      alert("영상을 업로드해 주세요");
      return;
    }

    this.setState({
      processingState: "Uploading...",
    });

    const res = await axiosPostVideo.post("/storage/upload", data, {
      onUploadProgress: (data) => {
        this.setState({
          videoProgress: Math.round((data.loaded / data.total) * 100),
        });
      },
    });

    if (res.status === 201) {
      this.setState({
        processingState: "Video Uploaded, Processing...",
      });

      const filename = res.data.filename;
      console.log(filename);

      const res2 = await axios.get("http://localhost:4005/process", {
        params: {
          filename: filename,
        },
      });

      return;
    }
    this.setState({
      processingState: "Video Upload Failed",
    });
  };

  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col-md-6">
            <form method="post" action="#" id="#">
              <div className="form-group files">
                <label>Upload Your File </label>
                <Form>
                  <Form.Group controlId="formFileLg" className="mb-3">
                    <Form.Label>Large file input example</Form.Label>
                    <Form.Control
                      type="file"
                      size="lg"
                      onChange={this.onChangeHandler}
                    />
                  </Form.Group>
                </Form>
              </div>
            </form>
          </div>
        </div>
        <button
          type="button"
          className="btn btn-success btn-block"
          onClick={this.onClickHandler}
        >
          Upload
        </button>
        {/* Video Processing State */}
        {this.state.videoProgress && (
          <ProgressBar
            now={this.state.videoProgress}
            label={`${this.state.videoProgress}%`}
          />
        )}
        <div className="row">
          <div className="col-md-6">
            <div className="alert alert-info">
              <strong>{this.state.processingState}</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
