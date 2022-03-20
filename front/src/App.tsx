import axios from "axios";
import React from "react";
// import NoticeWriteComponent from "./components/NoticeWriteComponent._tsx";
// import Uploader from "./components/UploadFiles._tsx";
import Logo from "./vender.svg";
// solved from https://github.com/facebook/create-react-app/issues/11770 here. svg is difficult..
import {
  Alert,
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
      videoId: "",
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
        processingState:
          "Video Uploaded, Processing... This can take upto few minutes. Please wait.",
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
    this.setState({
      textqueryResult: null,
    });

    if (this.state.textquery.length === 0) {
      alert("검색 단어를 입력해 주세요");
      return;
    }

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
      <Stack className="col-xs-6 col-lg-6 mx-auto" gap={4}>
        <Row style={{ margin: "2rem" }}>
          <Image src={Logo} />
        </Row>

        <Alert variant="primary">
          <Alert.Heading>Welcome to VENDRE</Alert.Heading>
          <p>
            VENDRE is a tool that allows CTRL + F in videos. It uses
            state-of-the-art multi-modal deep learning model to understand what
            you want to search for in a video.
          </p>
        </Alert>
        <Alert variant="danger">
          <p className="mb-0">
            DO NOTE THAT THIS IS A PROTOTYPE. YOUR DATA SENT TO OUR SERVER IS
            NOT GURANTEED TO BE SAFE NOR PRIVATE. USE THIS APPLICATION WITH YOUR
            OWN RISK.
          </p>
        </Alert>
        <Alert variant="danger">
          <p className="mb-0">THIS IS NOT AN OFFICIAL PRODUCT OF CORCA INC.</p>
        </Alert>
        <Card>
          <Card.Header as="h2">Upload Your Video</Card.Header>
          <Card.Body>
            <Stack gap={2}>
              <h5>(Video over 5 minute will decrease the sampling rate)</h5>
              <Form>
                <Form.Label></Form.Label>
                <Form.Group controlId="formFileLg" className="mb-12">
                  <Form.Control
                    type="file"
                    size="lg"
                    onChange={this.onChangeHandler}
                  />
                </Form.Group>
              </Form>

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
          </Card.Body>
        </Card>
        <Card>
          <Card.Header as="h2">Search for...</Card.Header>
          <Card.Body>
            <Form>
              <Form.Group className="mb-3" controlId="formTextquery">
                <Form.Label>What do you want to find?</Form.Label>
                <Form.Control
                  placeholder={"e.g. Cat"}
                  onChange={this.updateTextQueryValue}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="modelname">
                <Form.Label>Model Name (Optional)</Form.Label>
                <Form.Control placeholder="e.g. VIT B/32" />
              </Form.Group>

              <Button variant="primary" onClick={this.onTextQueryHandler}>
                Submit
              </Button>
            </Form>

            <div
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "left",
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
                    <Card
                      className="col-xs-2 mb-2"
                      key={time}
                      style={{ margin: "auto" }}
                    >
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
          </Card.Body>
        </Card>
        <p></p>
      </Stack>
    );
  }
}

export default App;
