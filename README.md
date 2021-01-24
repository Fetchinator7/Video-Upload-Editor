# Purpose

This is a basic interface for automatically rendering, then uploading videos to Vimeo. This is geared toward people who do a lot of recording but little to no editing afterward, such as publishing video conference recordings.

## The first selection screen

![Selection View](readme-images/preparing.png?raw=true)

### After clicking `UPLOAD VIDEO(S)` and the videos have started rendering

![Rendering View](readme-images/rendering.png?raw=true)

### The first video finished uploading and the second video is almost finished uploading to Vimeo

![Uploading View](readme-images/uploading.png?raw=true)

### I know the main question is, "Why shouldn't I just upload to Vimeo directly?" Well, there are a few reasons

1. This interface is designed to work with teams that have varying permission levels

   - Do you want to allow someone else to upload to your Vimeo account but don't want to give them full access (such as not allowing them to delete videos)? That's what this was built for! Once set up, this application allows the configured computer to only upload videos to Vimeo without providing any other viewing or editing access.

2. This interface automatically adds rendering optimizations

   - Is the volume on your video a bit too quiet? Well don't worry, this has got you covered! The output is automatically run through a loudness normalization filter that brings the overall volume to the right level, but still maintains the dynamics of the loud and quiet points.

   - Want to save on storage space? This also has the option of automatically compressing the output using HEVC/H265 so the final video will be much smaller. The beauty of this is that once you click to upload a video it will render without any further input required. However, doing this takes longer to render.

   - Do you have a few seconds at the beginning and end of the recording that you don't want to keep for the published version? Just put in the start and/or end timecode(s) so the output will only contain that range!

3. This interface saves the output file(s) in folders that are organized by date

   - Don't like manually organizing by date? Once you specify a parent folder all the videos will automatically be put inside that folder for the current year and month.

## NOTE

By default a video's title is today's date followed by a space to add your own title afterward, but the title can't end in a space (because of Windows 10 compatibility) so the default title has to be modified for it to be valid.

## Installation

### Mac

All the dependencies can be installed using the [Homebrew](https://brew.sh/) package manager.

```shell
brew install git
brew install node
brew install python3
brew install ffmpeg
```

### Windows

All the dependencies can be installed using the [Chocolatey](https://chocolatey.org/install) package manager.

```shell
choco install git
choco install nodejs
choco install python
choco install ffmpeg
```

### Both

Open a terminal window, type `cd` (with a space afterward), drag-and-drop the folder on your computer where you want to store this project on top of the terminal window, and press enter.
Since you have `git` now (it's one of the dependencies) clone the project by entering `git clone https://github.com/Fetchinator7/Video-Upload-Editor.git`. Next cd into the project folder by entering `cd` again, use the **tab** button to autocomplete the folder path, import the submodules by entering `git submodule update --init --recursive`, and finally enter `npm install`.

## Setup

Unfortunately, before you can start uploading you need to register an app and have it approved by Vimeo (which may take up to 5 business days) so let's get the ball rolling by [creating a new app](https://developer.vimeo.com/apps/new)!

The step that requires approval is the `Request Upload Access` so click on that link under `Permissions` and come back here once your request has been approved.

Are you back now? Great, let's move on!
Now that our app has upload access go to `Authentication` and `Generate an access token` by selecting `Authenticated (you)`. Give it access to `Public, Private, Create, Edit, Upload, and Video Files` then copy the `Token`.

Next we need to create a new `.env` file in the root directory of the project (no parent folders), but unless you changed it the terminal window from the **Installation** step will already be in the correct folder.
To make a `.env` on Mac it's `touch .env` and on Windows it's `type nul > .env`. Next open it with a text editor (`open .env` for Mac or `.env` for Windows) and enter these parameters:

```env
ACCESS_TOKEN=
CLIENT_ID=
CLIENT_SECRET=
```

Once those keywords are entered it's a simple matter of copy-pasting the `Token` (from Vimeo), after `ACCESS_TOKEN`, `Client Identifier` after the `CLIENT_ID` parameter and the `Client secrets` after the `CLIENT_SECRET` so your `.env` file should look something like this:

```env
ACCESS_TOKEN=ca9b9rj...
CLIENT_ID=1c61359178...
CLIENT_SECRET=M9/Oyw...
```

This application automatically saves the output video files by the year, month, and title of the video so next add `MAIN_OUTPUT_FOLDER=` to the `.env` then the path to the main folder where the videos should be saved after the `MAIN_OUTPUT_FOLDER=`. (To copy a path on Mac right-click the folder, hold down the option key, then `Copy "<folder>" as Pathname` or on Windows copy the path from the top of the file explorer.) It should look something like this on Mac:
`MAIN_OUTPUT_FOLDER=/Path/To/Main/Output/Folder` or this on Windows: `MAIN_OUTPUT_FOLDER=C:\Path\To\Main\Output\Folder`

### Tip

On Mac if you want to automatically close the terminal windows when this finishes open the `Terminal` application and go to `Preferences` > `Profiles` > `Shell` > `When the shell exits` and choose `Close if the shell exited cleanly`.

### Customizing the users

The user names that appear alongside the radio buttons can be customized/added by including a `USERS=[]` array in the `.env` with each name inside quotes and separated by commas:

```env
USERS=["user", "user 1", "user 2", "user 3"]
```

### There are a few more options for customizing the output

`COMPRESSION` (which is disabled by default) will run the output video through the H265 compression filter to help reduce video size while still maintaining quality. However, this was designed thinking it can render overnight so it may take about twice the length of the input video to finish rendering, but will reduce the output file size significantly.

`COMPRESSION_SPEED_PRESET` (which is the string "fast" by default) dictates how quickly the video compression will be done. For example; if you want a higher quality video and have the computer resources you could set it to "slow," or if you have a sluggish computer you could set it to "superfast." Use the slowest preset you have patience for: `ultrafast`, `superfast`, `veryfast`, `faster`, `fast`, `medium`, `slow`, `slower`, `veryslow`. See [H.265 Compression](https://trac.ffmpeg.org/wiki/Encode/H.265) for details.

`SPECIFY_PIXEL_FORMAT` (which is disabled by default) will set the pixel format for compressed videos to "yuv420p" so the output video is actually playable once it's finished rendering. However, this is only necessary for obscure codecs like "Apple ProRes 422 HQ" and it does impact the output coloring, so unless you have issues playing the output video this shouldn't need to be specified.

`REPLACE_INVALID_FILENAME_CHARACTERS_WITH` (which removes it by default) is what replaces invalid filename characters. By default the output filename is the title entered for that video, but if there are invalid filename characters such as `/` in the title replace those invalid charters with this character for the filename (but the title for Vimeo stays the same).

`TRIM_CODEC_COPY` (which is enabled by default) determines whether the output video will have null content at the end (if a trim has been specified). Essentially, it's much faster to copy the video codec but there will probably be a couple of seconds at the end of the video with no footage or sound. However, when that video is uploaded to Vimeo they render it again so those empty couple of seconds don't appear on Vimeo, only the local file. So if you want the file to have precise trimming then disable this option which will unfortunately be much slower.

`OUTPUT_EXTENSION` (which is the string ".mp4" by default) will be the extension of the output video. If the video already has this extension then nothing will be changed, but if the input video doesn't have this extension the output video will be converted so it uses that extension.

`RENAME_INPUT_VIDEO` (which is enabled by default) dictates if input video files will be renamed to the output video title or keep the same title. It's enabled by default because more often than not source files aren't named according to their content and just follow an automatic naming convention. However, you may not want to rename the source file, such as for specifying two different trimming ranges for the same input file to export two files for two separate Vimeo videos.

`IGNORE_FILE_SELECTION_ERRORS` (which is disabled by default) for whatever reason, I've had inconsistent results where sometimes the python file picker will return an error, even if the output path is totally fine so this can be set to true to ignore those errors.

`SEPARATE_AUDIO_ONLY_FILE_OPTION` (which is disabled by default) shows a checkbox with each video to toggle rendering an additional separate audio-only file with the audio of the output video.

### All in all the final `.env` file could look something like this

```sh
ACCESS_TOKEN=ca9b9rj...
CLIENT_ID=1c61359178...
CLIENT_SECRET=M9/Oyw...

MAIN_OUTPUT_FOLDER=/Path/To/Main/Output/Folder/

USERS=["user 1"]

COMPRESSION=true
COMPRESSION_SPEED_PRESET=slow
SPECIFY_PIXEL_FORMAT=true
REPLACE_INVALID_FILENAME_CHARACTERS_WITH=-
TRIM_CODEC_COPY=false
OUTPUT_EXTENSION=.mov
RENAME_INPUT_VIDEO=false
SEPARATE_AUDIO_ONLY_FILE_OPTION=true
```

## Launching it

To run the application double-click/open the `run.sh` file. You can also add an alias to that file on the dock or desktop to speed up the start process. The application window should open automatically in the computer's default web browser, but it may take a few seconds. If it doesn't open automatically, open it manually by going to [localhost:3000](http://localhost:3000/).

### Debugging

There's already a VS Code debug configuration in the repo so just select the configuration you'd like to use (like "Both, Allons-y") in the debugger and run it. However, to take advantage of the redux dev tools they need to be enabled in the `.env` file because otherwise this wouldn't work in the browser without the extension installed.

```sh
REACT_APP_USE_REDUX_DEV_TOOLS=true
```
