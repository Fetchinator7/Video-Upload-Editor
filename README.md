# Purpose

This is a basic interface for automatically rendering then uploading videos to Vimeo that's geared towards people who do a lot of recordings but little to no editing the videos afterwards such as publishing video conferences.

![Game Dropdown](readme-images/preparing.png?raw=true)

![Game Dropdown](readme-images/uploading.png?raw=true)

### I know the main question is, "Why shouldn't I just upload to Vimeo directly?" Well, there are a few reasons;

1. It's designed to work with teams

    - Do you want to allow someone else to upload to your Vimeo account, but don't want to five them full access (such as not allowing them to delete videos)? That's what this was built for! Once it's configured, this application allows the computer to only upload videos to Vimeo without providing it any other editing or viewing access.

2. This automatically adds some rendering optimizations

    - Do you have a conference recording that you want to upload but the volume isn't loud enough? Well don't worry, this has got you covered. The output is automatically run through a loudness normalization filter so it's the right loudness but still maintains the dynamics of the loud and quit points. This also has the option of automatically compressing the output under H265 so the final video will be about a third the size of the original while still maintaining quality, as long as you can stand waiting about three times as long for it to render. But that's the beauty of this, you can set it up and it'll just work without any further input required.

    - Do you have a few seconds at the beginning and end of the recording that you don't want to keep? Well, just put in the start and/or end timecode(s) so the output will only contain that range.

3. Saves the output file(s) in folders that are organized by date

    - Once you specify a parent folder all the videos will automatically be put inside a folder for the current year and te current month.

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

Go to [NodeJs Downloads](https://nodejs.org/en/download/) and click the button that says "Windows Installer"
This'll download the .msi which will do all the installation and paths for you.

### Both

If you don't have git you can download this project as a zip file and move that folder to the folder where you'd like to store this project in. Once that's done open a terminal window, enter `cd`, drag-and-drop the folder on top of the terminal window, and press enter. Then run `npm install`

## Setup

Unfortunately you need to register an app and have it be approved before you can start uploading to Vimeo which may take up to 5 business days so let's get the ball rolling by [creating a new app](https://developer.vimeo.com/apps/new)!

The thing that will take the longest will be to `Request Upload Access` so click on that link under `Permissions` and come back in a couple days.

Are you back now? Cool, let's move on!
Now that our app has upload access go to `Authentication` and `Generate an access token` by selecting `Authenticated (you)`. Give it access to `Public, Private, Create, Edit, Upload, and Video Files` then copy the `Token`

Next we need to create a new `.env` file in the root directory of the project (no parent folders) with these parameters:

```env
ACCESS_TOKEN=
CLIENT_ID=
CLIENT_SECRET=
```

Now add the keyword `ACCESS_TOKEN` at the top then paste in the `Token`. Then it's a simple matter of copy-pasting over the `Client Identifier` after the `CLIENT_ID` parameter and the `Client secrets` after the `CLIENT_SECRET` so your `.env` file should look something like this:

```env
ACCESS_TOKEN=ca9b9rj...
CLIENT_ID=1c61359178...
CLIENT_SECRET=M9/Oyw...
```

This application automatically saves the output video files by the year, month, and title of the video so next add the path to the main folder where the videos should be saved under `MAIN_OUTPUT_FOLDER` like this:

```env
MAIN_OUTPUT_FOLDER=/Path/To/Main/Output/Folder/
```

Then there are two more parameters for customizing the output; `COMPRESSION` and `TRIM_CODEC_COPY`

`COMPRESSION` (which is disabled by default) will run the output video through the H265 compression filter to help reduce video size while still maintaining quality but since this was designed so it could run overnight the settings are such that it may take 4 times the length of the video for it to finish rendering, but should only be a third of the size of the input so it's a tradeoff.

`TRIM_CODEC_COPY` (which is enabled by default) is a setting which effects if the output video will have null content at the end. Basically, it's much faster to copy the codec of the video but there will probably be a couple seconds at the end of the video with no footage and no sound. However, when that video is uploaded to Vimeo they render it again so those empty couple seconds don't appear on Vimeo only the local version. So if you want the file to have precise trimming then it needs to re-encode it which is much slower so that's why this setting is enabled by default.

### All in all the final `.env` file could look something like this

```env
ACCESS_TOKEN=ca9b9rj...
CLIENT_ID=1c61359178...
CLIENT_SECRET=M9/Oyw...

MAIN_OUTPUT_FOLDER=/Path/To/Main/Output/Folder/

COMPRESSION=true
TRIM_CODEC_COPY=false
```

### Customizing the users

You can also customize/add to the uploading user's name radio button(s) by adding a `users.json` file in the src directory with this structure:

```json
{
    "users": ["user 1", "user 2", "user 3"]
}
```

## Launching it

To run the application double-click/open the `run.sh` file. You can also add an alias to that file on the dock or desktop to speed up the start process. The application window should open automatically in the computer's default web browser, but it may take a few seconds. If it doesn't open automatically open it by manually going to [localhost:3000](http://localhost:3000/).
