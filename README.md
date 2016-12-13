# Live Test

This is a UI experiment in building a REPL-like environment to encourage test-driven development. The tests and the code editor are on the same canvas, next to each other, with some nice key bindings so you can go back and forth without too much mental context-switching. Errors and test results update continuously, enabling you to stay

## Running the app

<a href="http://rtoal.github.io/live-test">Run it directly from GitHub</a>. If you fork the repo and want to run locally, make sure to run a local webserver:

```
python -m SimpleHTTPServer 8080
```

and navigate to `localhost:8080`. Since the application uses web workers, you can’t run the app from the file system.

## Features and Interesting Tidbits

There are some cool things going on here:

 * Tests are run continuously, as you type.
 * Tests are evaluated on web workers.
 * The app includes Chai, so you can write assertions in many different ways.
 * The uses Istanbul to do test coverage computations.
 * (I had to hack the Instanbul source code so it could run on a web worker.)

## About the Implementation

This little app was developed using Ace, Esprima, Escodegen, and Istanbul. There are, however, <em>no</em> MVC or MVVM frameworks, and no fancy CSS libraries. No, Bootstrap, React, Vue, or any helpers for the UI. It's straight-up Vanilla JS.

## Known Issues

* The app is not tested at massive scale.
* Loading and saving are too rudimentary, using only the browser's local storage (for now).
* Coverage is computed by Istanbul, which is unable to recognize JavaScript’s arrow functions as functions.
* The experiment is very rough. It needs a lot of work to be more usable.
