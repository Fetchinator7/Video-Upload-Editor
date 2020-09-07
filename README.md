# Purpose

This is a basic interface for automatically rendering, then uploading videos to Vimeo. This is geared toward people who do a lot of recordings but little to no editing afterward, such as publishing video conference recordings.

### The first selection screen

![Selection View](readme-images/preparing.png?raw=true)

### After clicking `UPLOAD VIDEO(S)` and the videos have started rendering

![Rendering View](readme-images/rendering.png?raw=true)

### The rendering finished so it's uploading to Vimeo

![Uploading View](readme-images/uploading.png?raw=true)

### I know the main question is, "Why shouldn't I just upload to Vimeo directly?" Well, there are a few reasons:

1. This interface is designed to work with teams that have varying permission levels

   - Do you want to allow someone else to upload to your Vimeo account but don't want to give them full access (such as not allowing them to delete videos)? That's what this was built for! Once set up, this application allows the configured computer to only upload videos to Vimeo without providing any other viewing or editing access.

2. This interface automatically adds rendering optimizations

   - Is the volume on your video a bit too quiet? Well don't worry, this has got you covered! The output is automatically run through a loudness normalization filter that brings the overall volume to the right level, but still maintains the dynamics of the loud and quiet points.

   - Want to save on storage space? This also has the option of automatically compressing the output using HEVC/H265 so the final video will be much smaller. The beauty of this is that once you click to upload a video it will render without any further input required. However, doing this takes longer to render.

   - Do you have a few seconds at the beginning and end of the recording that you don't want to keep for the published version? Just put in the start and/or end timecode(s) so the output will only contain that range!

3. This interface saves the output file(s) in folders that are organized by date

   - Don't like manually organizing by date? Once you specify a parent folder all the videos will automatically be put inside that folder for the current year and month.

## Installation

### Mac

All the dependencies can be installed using [Homebrew](https://brew.sh/)

```shell
brew install python3
brew install ffmpeg
brew install node
```

### Windows

[Install Python3](https://installpython3.com/windows/)

[Install ffmpeg](https://www.wikihow.com/Install-FFmpeg-on-Windows)

Go to [NodeJs Downloads](https://nodejs.org/en/download/) and click the button that says "Windows Installer."
This'll download the .msi which will do the installation and paths for you.

### Both

If you don't have git you can download this project as a zip file, unzip it, and move it to the folder on the computer where you'd like to store this project. Once that's done, open a terminal window, enter `cd`, drag-and-drop the folder icon on top of the terminal window, and press enter. Then run `npm install`

## Setup

Unfortunately, before you can start uploading you need to register an app and have it approved by Vimeo (which may take up to 5 business days) so let's get the ball rolling by [creating a new app](https://developer.vimeo.com/apps/new)!

The step that requires approval is the `Request Upload Access` so click on that link under `Permissions` and come back here once your request has been approved.

Are you back now? Great, let's move on!
Now that our app has upload access go to `Authentication` and `Generate an access token` by selecting `Authenticated (you)`. Give it access to `Public, Private, Create, Edit, Upload, and Video Files` then copy the `Token`.

Next we need to create a new `.env` file in the root directory of the project (no parent folders).
See [create a file on mac] or [create a file on windows] with these parameters:

```env
ACCESS_TOKEN=
CLIENT_ID=
CLIENT_SECRET=
```

Once those keywords are entered it's a simple matter of copy-pasting the `Token`, after `ACCESS_TOKEN`, `Client Identifier` after the `CLIENT_ID` parameter and the `Client secrets` after the `CLIENT_SECRET` so your `.env` file should look something like this:

```env
ACCESS_TOKEN=ca9b9rj...
CLIENT_ID=1c61359178...
CLIENT_SECRET=M9/Oyw...
```

This application automatically saves the output video files by the year, month, and title of the video so next add the path to the main folder where the videos should be saved after the `MAIN_OUTPUT_FOLDER` like this:

```env
MAIN_OUTPUT_FOLDER=/Path/To/Main/Output/Folder/
```

### Customizing the users

The user names that appear alongside the radio buttons can be customized/added by including a `USERS=[]` array in the `.env`.

```env
USERS=["user", "user 1", "user 2", "user 3"]
```

### There are a few more options for customizing the output:

`COMPRESSION` (which is disabled by default) will run the output video through the H265 compression filter to help reduce video size while still maintaining quality. However, this was designed thinking it can render overnight so it may take about twice the length of the input video to finish rendering, but will reduce the output file size significantly.

`COMPRESSION_SPEED_PRESET` (which is the string "fast" by default) dictates how quickly the video compression will be done. For example; if you want a higher quality video and have the computer resources you could set it to "slow," or if you have a sluggish computer you could set it to "superfast." See [H.265 Compression](https://trac.ffmpeg.org/wiki/Encode/H.265) `Choose a preset` for details.

`SPECIFY_PIXEL_FORMAT` (which is disabled by default) will set the pixel format for compressed videos to "yuv420p" so the output video is actually playable once it's finished rendering. However, this is only necessary for obscure codecs like "Apple ProRes 422 HQ" and it does impact the output coloring, so unless you have issues playing the output video this shouldn't need to be specified.

`TRIM_CODEC_COPY` (which is enabled by default) determines whether the output video will have null content at the end (if a trim has been specified). Essentially, it's much faster to copy the video codec but there will probably be a couple of seconds at the end of the video with no footage or sound. However, when that video is uploaded to Vimeo they render it again so those empty couple of seconds don't appear on Vimeo, only the local file. So if you want the file to have precise trimming then disable this option which will unfortunately be much slower.

`OUTPUT_EXTENSION` (which is ".mp4" by default) will be the extension of the output video. If the video already has this extension then nothing will be changed, but if the input video doesn't have this extension the output video will be converted so it uses that extension.

`SEPARATE_AUDIO_ONLY_FILE_OPTION` (which is disabled by default) shows a checkbox with each video to toggle rendering an additional separate audio-only file with the audio of the output video.

### All in all the final `.env` file could look something like this

```env
ACCESS_TOKEN=ca9b9rj...
CLIENT_ID=1c61359178...
CLIENT_SECRET=M9/Oyw...

MAIN_OUTPUT_FOLDER=/Path/To/Main/Output/Folder/

USERS=["user 1"]

COMPRESSION=true
COMPRESSION_SPEED_PRESET=slow
SPECIFY_PIXEL_FORMAT=true
TRIM_CODEC_COPY=false
OUTPUT_EXTENSION=.mov
SEPARATE_AUDIO_ONLY_FILE_OPTION=true
```

## Launching it

To run the application, double-click/open the `run.sh` file. You can also add an alias to that file on the dock or desktop to speed up the start process. The application window should open automatically in the computer's default web browser, but it may take a few seconds. If it doesn't open automatically, open it by manually going to [localhost:3000](http://localhost:3000/).
