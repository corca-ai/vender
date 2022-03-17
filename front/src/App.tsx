import axios from "axios";
import React from "react";
// import NoticeWriteComponent from "./components/NoticeWriteComponent._tsx";
// import Uploader from "./components/UploadFiles._tsx";
//css

import {
  Button,
  Card,
  Container,
  Form,
  Image,
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
  textqueryResult: any;
}

class App extends React.Component<{}, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      selectedFile: null,
      processingState: "No Video Assigned",
      videoProgress: null,
      videoId: "ddee7af8f2188f7fc975f0dba5f177e1",
      textquery: "",
      textqueryResult: null,
    };
  }

  onChangeHandler = (event: any) => {
    this.setState({
      selectedFile: event.target.files[0],
    });
  };

  updateTextQueryValue = (event: any) => {
    const val = event.target.value;
    console.log(val);
    this.setState({
      textquery: val,
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
      this.setState({
        textqueryResult: res.data,
      });
    }
  };

  render() {
    return (
      <Container>
        <Stack gap={3}>
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
          <Form>
            <Form.Group className="mb-3" controlId="formTextquery">
              <Form.Label>What do you want to find?</Form.Label>
              <Form.Control
                placeholder={this.state.textquery}
                onChange={this.updateTextQueryValue}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="modelname">
              <Form.Label>Model Name</Form.Label>
              <Form.Control placeholder="e.g. VIT B/32" />
            </Form.Group>

            <Button variant="primary" onClick={this.onTextQueryHandler}>
              Submit
            </Button>
          </Form>
          <Container className="col-md-9 mx-auto">
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
              }}
            >
              {this.state.textqueryResult &&
                this.state.textqueryResult.map((item: any) => {
                  const score = item[0];
                  const scoreStr = score.toFixed(2);

                  const time = item[1];
                  const timeStr = time.toFixed(2) + "s";

                  const imgBase64Raw = item[2];
                  return (
                    <Card className="col-md-3" key={item[0]}>
                      <Card.Img
                        variant="top"
                        src={`data:image/png;base64,${imgBase64Raw}`}
                      />
                      <Card.Body>
                        <Card.Text>Score: {scoreStr}</Card.Text>
                        <Card.Text>Time: {timeStr}</Card.Text>
                      </Card.Body>
                    </Card>
                  );
                })}
            </div>
          </Container>
        </Stack>
      </Container>
    );
  }
}

export default App;
