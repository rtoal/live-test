# Live Test

This is a UI experiment in building a REPL-like environment to encourage test-driven development. The tests and the code editor are on the same canvas, next to each other, with some nice key bindings so you can go back and forth without too much mental context-switching. Errors and test results update continuously, enabling you to stay focused on your current and upcoming tasks. You may even find the environment superior to a classic REPL: your ”results” are not interspersed with your code, and your entire session is always visible and replayable (no need to hit that up arrow dozens of times to find an old result).

## Running the app

<a href="http://rtoal.github.io/live-test">Run directly from GitHub</a>. If you fork the repo and want to run locally, make sure to run a local webserver, for instance:

```
python -m SimpleHTTPServer 8080
```

and open `localhost:8080` in your browser. (Since the application uses web workers, you can’t run the app from the file system.)

## Features and Interesting Tidbits

There are some cool things going on here:

 * Tests are run continuously, as you type.
 * Tests are evaluated on web workers.
 * The app includes Chai, so you can write assertions in many different ways.
 * The app uses Istanbul to do test coverage computations. (I had to hack the Instanbul source code so it could run on a web worker.)

## About the Implementation

This little app was developed using Ace, [Esprima](http://esprima.org/), [Escodegen](https://github.com/estools/escodegen), and [Istanbul](https://github.com/gotwarlost/istanbul). There are, however, <em>no</em> MVC or MVVM frameworks, and no fancy CSS libraries. No Bootstrap, React, Vue, or any fancy UI library. It’s straight-up Vanilla JS.

## Known Issues

* The app is not tested at large scale.
* Loading and saving are too rudimentary, using only the browser’s local storage (for now).
* Coverage is computed by Istanbul, which is unable to recognize JavaScript’s arrow functions as functions.
* The experiment is very rough. It needs a lot of work to be more usable.
* The code is written in modern JavaScript, and not built with Babel, so be sure to use a modern browser.
