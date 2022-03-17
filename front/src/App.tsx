import axios from "axios";
import React from "react";
// import NoticeWriteComponent from "./components/NoticeWriteComponent._tsx";
// import Uploader from "./components/UploadFiles._tsx";
//css

import {
  Button,
  Container,
  Form,
  ProgressBar,
  Row,
  Stack,
} from "react-bootstrap";

import { axiosPostVideo, axiosAnalyzeVideo } from "./axios";

interface State {
  selectedFile: File | null;
  processingState: string;
  videoProgress: number | null;
  videoId: string;
  textquery: string;
}

class App extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      selectedFile: null,
      processingState: "No Video Assigned",
      videoProgress: null,
      videoId: "",
      textquery: "",
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

      const videoId = res.data.videoId;
      console.log(videoId);

      const res2 = await axiosAnalyzeVideo.get("/process", {
        params: {
          videoId: videoId,
        },
      });

      if (res2.status === 200) {
        this.setState({
          processingState: "Video Processed",
          videoId: videoId,
        });
      } else {
        this.setState({
          processingState: "Video Processing Failed, Perhaps Retry?",
        });
      }

      return;
    }
    this.setState({
      processingState: "Video Upload Failed",
    });
  };

  onTextQueryHandler = async () => {
    const res = await axiosAnalyzeVideo.get("/textsim", {
      params: {
        videoId: this.state.videoId,
        textquery: this.state.textquery,
      },
    });
    if (res.status === 200) {
      console.log(res.data);
    }
  };

  render() {
    return (
      <Container>
        <Stack gap={3}>
          <Form>
            <Form.Group className="mb-3" controlId="formTextquery">
              <Form.Label>What do you want to find?</Form.Label>
              <Form.Control type="email" placeholder="e.g. Dog" />
            </Form.Group>

            <Form.Group className="mb-3" controlId="modelname">
              <Form.Label>Model Name</Form.Label>
              <Form.Control type="model" placeholder="e.g. VIT B/32" />
            </Form.Group>

            <Button variant="primary" type="submit">
              Submit
            </Button>
          </Form>

          <Row>
            <div className="form-group files">
              <Form>
                <Form.Group controlId="formFileLg" className="mb-12">
                  <Form.Control
                    type="file"
                    size="lg"
                    onChange={this.onChangeHandler}
                  />
                </Form.Group>
              </Form>
            </div>
          </Row>
          <Stack className="col-md-5 mx-auto">
            <Button variant="primary" onClick={this.onClickHandler}>
              Upload
            </Button>

            {/* Video Processing State */}
            {this.state.videoProgress && (
              <ProgressBar
                now={this.state.videoProgress}
                label={`${this.state.videoProgress}%`}
                variant="secondary"
              />
            )}

            <div className="alert alert-info">
              <strong>{this.state.processingState}</strong>
            </div>
          </Stack>
        </Stack>
      </Container>
    );
  }
}

export default App;
