from io import BytesIO
import os
import base64
import cv2
import numpy as np
import torch
import clip
from PIL import Image

BASEPATH = "../files/"
device = "cuda" if torch.cuda.is_available() else "cpu"


def semantic_process_video(video_id: str, model_name: str = "ViT-B/32"):
    # split video into set of images
    # for each image, run semantic analysis
    # return semantic vectors
    vidpath = os.path.join(BASEPATH, video_id)

    # check valid
    if not os.path.isfile(vidpath):
        print("File not found")
        return False
    # check if it is a video file, mp4, mpg, etc

    # load video
    vids = cv2.VideoCapture(vidpath)
    vid_load_success, image = vids.read()
    fps = vids.get(cv2.CAP_PROP_FPS)

    if not vid_load_success:
        print("Failed to load video")
        return False

    count = 0
    diff_enough = True

    imgset = []
    timepoint = []
    smallimgbyte = []
    while vid_load_success:
        if diff_enough:
            imname = f"./tmp/{video_id}_frame{count}.jpg"
            cv2.imwrite(imname, image)
            imgset.append(imname)
            timepoint.append(count / fps)
            smallimg = cv2.resize(image, (256, 256))
            smallimg = Image.fromarray(smallimg)
            # make it into Base64 image
            buffered = BytesIO()
            smallimg.save(buffered, format="JPEG")
            img_str = base64.b64encode(buffered.getvalue())
            smallimgbyte.append(img_str)

        prv_img = image
        vid_load_success, image = vids.read()

        diff_enough = True
        # check if the difference between the current frame and the previous frame is large enough
        # using numpy
        if count > 0 and vid_load_success:
            diff = np.mean(np.abs(prv_img - image))
            print(diff)
            if diff < 10:
                diff_enough = False

        count += 1

    vids.release()

    # for each image, run semantic analysis

    img_obj = [Image.open(img) for img in imgset]

    model, preprocess = clip.load(model_name, device=device)

    img_obj = [preprocess(img).unsqueeze(0).to(device) for img in img_obj]
    img_obj = torch.cat(img_obj, dim=0)

    with torch.no_grad():
        out = model.encode_image(img_obj)

    out = out.cpu()
    torch.save([out, timepoint, smallimgbyte], "./tmpvec/" + video_id + ".pt")

    # remove tmp files
    for f in imgset:
        os.remove(f)

    return True


def simscore(video_id: str, text_qry: str, model_name: str = "ViT-B/32"):
    # load semantic vectors
    # load text query
    # compute similarity score
    # return similarity score
    vidvec, timepoint, smallimgbyte = torch.load("./tmpvec/" + video_id + ".pt")

    model, preprocess = clip.load(model_name, device=device)
    text_tok = clip.tokenize(text_qry).to(device)

    with torch.no_grad():
        out = model.encode_text(text_tok)

    out = out.cpu().reshape(-1, 1)
    print(out.shape, vidvec.shape)

    score = (vidvec @ out).cpu().flatten().tolist()
    score_time_img = list(zip(score, timepoint, smallimgbyte))
    score_time_img.sort(key=lambda x: x[0], reverse=True)

    return score_time_img[:10]
