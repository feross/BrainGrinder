# BrainGrinder - Instant foreign language flashcards

[Instant.fm](http://instant.fm) is not done yet, but check out what I whipped up in 3 hours using jQuery 1.5 deferreds, jQuery templates, and the Google Translate API!

Automatic foreign language flashcards!

## How it works

### Fetching MP3s from Google Transalate

Nothing is running server side, except for the text-to-speech which is actually scraped from Google Translate using a simple [Tornado](http://www.tornadoweb.org/) AsyncHTTPClient. It is not possible to fetch the audio from Google on the client-side, since Google blocks all requests that have a non-Google referer header (though empty referer headers are allowed). Interestingly, Firefox doesn't send a referer header on mp3 file requests embedded with flash or HTML5 audio, while Chrome and Safari do. So, if I only cared about Firefox, I could really get everything working client side by including the mp3 directly in the page.

Since supporting Chrome and Safari is important, we fetch the mp3s from Google's text-to-speech (tts) service (the one that powers the audio on Google Translate) and cache the files server-side.

### Displaying the flashcards

I used a bunch of CSS3. It's pretty self-explanatory, just look at the source.

## Server Software

* Tornado Web Server - <http://www.tornadoweb.org/>
* Supervisor - <http://supervisord.org/> (used to daemonize the Tornado process)

## JavaScript Libraries

* SoundManager2 - <http://www.schillmania.com/projects/soundmanager2/>
* JavaScript SHA1 - <http://pajhome.org.uk/crypt/md5/>
* jQuery - <http://jquery.com/>
* Modernizr - <http://www.modernizr.com/>
* HTML5 Boilerplate - <http://html5boilerplate.com/>

## jQuery Plugins

* jQuery Hotkeys - <https://github.com/jeresig/jquery.hotkeys>
* jQuery QuickFlip - <http://jonraasch.com/blog/quickflip-2-jquery-plugin> (used as a fallback when CSS3 translation is unavailable)
* jQuery Templates - <http://api.jquery.com/category/plugins/templates/>
* jQuery TouchWipe - <http://plugins.jquery.com/project/Touchwipe-iPhone-iPad-wipe-gesture>

## TODO

* save decks
* edit current deck (more obvious)
* pronunciation guide
* add opengraph tags
* shuffle cards button
* image for each card
* repeat sound button