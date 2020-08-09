# Purpose

This will be an interface for doing basic video editing before uploading to Vimeo.

To add users as options make a users.json file inside of the HomePage folder with this structure:

```json
{
    "users": ["user 1", "user 2"]
}
```

## SETUP

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
