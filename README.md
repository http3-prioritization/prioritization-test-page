# Prioritization signal and request timing test pages

Pages to test browser prioritization signals and resource request timings for both HTTP/2 and HTTP/3.

This page aims to include all (or most) resource loading options to test how different browsers and clients send HTTP prioritization signals and time requests for differently loaded resources.

Partially inspired by [Barry Pollard's demo pages](https://resource-loading-examples.glitch.me/) and [Patrick Meenan's breakdown of Chrome behaviour](https://docs.google.com/document/d/1bCDuq9H1ih9iNjgzyAL0gpwNFiEP4TZS-YLRp_RuMlc).

Currently, there is just one page: `test_all.html`, which has most resource loading options in a single file for easy testing. Feel free to contribute more specialized pages with just a subset. 

## Usage

This page is intended to be hosted on an HTTP/2 or HTTP/3 server of your choice and then loaded via a web browser or a tool like WebPageTest.

Resource timing info can be gathered from the browser devtools / HAR files.

Prioritization signal info can either be bathered via packet captures or an instrumented HTTP server that logs the information. I personally used a [custom version of the HTTP/3 aioquic server](https://github.com/http3-prioritization/aioquic) for [my HTTP/3 experiments](https://github.com/http3-prioritization/prioritization-experiments). 

## Caveats

There are some scenarios that are currently not (extensively) included:

- Priorities that are updated over the course of a page load / user interaction (e.g., Chrome changes the priority of lazy loaded images as they enter the viewport on user scroll)
- Various `fetchpriority` combinations (currently, it's only preload+fetchpriority for an image and fetchpriority for a JS `fetch()` call)
- How resource loading timings differ based on network conditions (e.g., Chrome uses network RTT to be more strict about how many outstanding requests it allows)
- CSS in the middle of the document (only in the head and on the bottom)
- iframes
- audio
- some more esoteric resource types and ways of loading resources (e.g., XSL documents)

## Resource attributions

- img1.png is is the [HTTP/3 logo](https://github.com/httpwg/wg-materials/tree/gh-pages/badge/http3)
- font1.woff2 is Amatic-SC.woff2 from Google Fonts
- font2.woff2 is Baloo-Bhaina.woff2 from Google Fonts
- img2.svg is from [svgrepo](https://www.svgrepo.com/svg/337882/speed)
- video.mp4 is from [file-examples.com](https://file-examples.com/index.php/sample-video-files/sample-mp4-files/)
- chrome.png is from [Pixel Perfect @ Flaticon](https://www.flaticon.com/free-icons/chrome)
- firefox.png is from [Freepik @ Flaticon](https://www.flaticon.com/free-icons/firefox)
- safari.png is from [Freepik @ Flaticon](https://www.flaticon.com/free-icons/safari)