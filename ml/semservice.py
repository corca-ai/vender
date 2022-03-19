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

    total_frames = int(vids.get(cv2.CAP_PROP_FRAME_COUNT))
    sample_rate = max(int(total_frames / 500), 15)
    print(sample_rate, total_frames, fps)

    for fno in range(0, total_frames, sample_rate):
        vids.set(cv2.CAP_PROP_POS_FRAMES, fno)

        if diff_enough:
            imname = f"./tmp/{video_id}_frame{count}.jpg"
            smallimg = cv2.resize(image, (256, 256))

            cv2.imwrite(imname, smallimg)
            imgset.append(imname)
            timepoint.append(fno / fps)

            smallimg = Image.fromarray(smallimg)
            # make it into Base64 image
            buffered = BytesIO()
            smallimg.save(buffered, format="JPEG")
            img_str = base64.b64encode(buffered.getvalue())
            smallimgbyte.append(img_str)

        prv_img = image
        _, image = vids.read()

        diff_enough = True
        # check if the difference between the current frame and the previous frame is large enough
        # using numpy
        if count > 0:
            diff = np.mean(np.abs(prv_img - image))
            print(diff)
            if diff < 10:
                diff_enough = False

        count += 1

    # while vid_load_success:
    #     if diff_enough:
    #         imname = f"./tmp/{video_id}_frame{count}.jpg"
    #         smallimg = cv2.resize(image, (256, 256))

    #         cv2.imwrite(imname, smallimg)
    #         imgset.append(imname)
    #         timepoint.append(count / fps)

    #         smallimg = Image.fromarray(smallimg)
    #         # make it into Base64 image
    #         buffered = BytesIO()
    #         smallimg.save(buffered, format="JPEG")
    #         img_str = base64.b64encode(buffered.getvalue())
    #         smallimgbyte.append(img_str)

    #     prv_img = image
    #     vid_load_success, image = vids.read()

    #     diff_enough = True
    #     # check if the difference between the current frame and the previous frame is large enough
    #     # using numpy
    #     if count > 0 and vid_load_success:
    #         diff = np.mean(np.abs(prv_img - image))
    #         print(diff)
    #         if diff < 10:
    #             diff_enough = False

    #     count += 1

    vids.release()

    # for each image, run semantic analysis

    img_obj = [Image.open(img) for img in imgset]

    model, preprocess = clip.load(model_name, device=device)

    img_obj = [preprocess(img).unsqueeze(0).to(device) for img in img_obj]
    img_obj = torch.cat(img_obj, dim=0)

    print(img_obj.shape)

    outs = []

    with torch.no_grad():
        ## batch size 4096
        for i in range(0, img_obj.shape[0], 4096):
            print(i)
            out = model.encode_image(img_obj[i : i + 4096])

            outs.append(out)

    out = torch.cat(outs, dim=0)

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

    out = out.reshape(-1, 1)
    print(out.shape, vidvec.shape)

    score = (vidvec @ out).cpu().flatten().tolist()
    score_time_img = list(zip(score, timepoint, smallimgbyte))
    score_time_img.sort(key=lambda x: x[0], reverse=True)

    return score_time_img[:10]


if __name__ == "__main__":

    # img_obj = [Image.open(img) for img in imgset]
    model, preprocess = clip.load("ViT-B/32", device=device)

    img_obj = torch.randn(10900, 3, 224, 224).to(device)

    print(img_obj.shape)

    outs = []

    with torch.no_grad():
        ## batch size 4096
        for i in range(0, img_obj.shape[0], 4096):
            print(i)
            locout = model.encode_image(img_obj[i : i + 4096])
            outs.append(locout)

    vidout = torch.cat(outs, dim=0)

    text_tok = clip.tokenize("hithere!!! neural network!").to(device)

    with torch.no_grad():
        out = model.encode_text(text_tok)

    out = out.reshape(-1, 1)
    print(out.shape, vidout.shape)

    score = (vidout @ out).cpu().flatten().tolist()
