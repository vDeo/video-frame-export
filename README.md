Video Frame Export App
=========

Microservice wrapper around ffmpeg to export frames from video via POST request.

Overview
--------

The microservice provides a POST route which a video is sent to, and returns base 64 encoded images in the response.

Usage
-----

The microservice has one POST route,

`/frames`

This route requires three body parameters in a request:

`frameCount //How many frames you want returned`

`secondsBetween //How many seconds between each frame returned`

`file //Video File for frames to be exported from`

In the response body, there will be a json array of base64 encoded images which are the frames exported.

To run the app, first run the command 

`npm install`,

then run,

`node index.js`


Requirements
------------

The `mediainfo`  and `ffmpeg` command must be available somewhere in the PATH (they must be installed on the machine).

For OSX, run the commands: 

`brew install ffmpeg`

`brew install mediainfo`

License
-------

(The MIT License)

Copyright (c) 2017 Ritual Media Inc

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
