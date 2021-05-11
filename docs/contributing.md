# Contributing

PRs, suggestions and especially bug reports are very welcome. If you're interesting in contributing code, please note the following

- *AreWeDown?* is written to be deliberately simply, my aim is to keep it flat and simple. Simple projects are easier for me to maintain, but I also want it to be easy to fork in the event I stop maintaining it.
- The target hardware for *AreWeDown?* is the Raspberry Pi 3. 
- The UI is weird in that it has minimal Javascript, and absolutely no frameworks of any kind. The entire UI reloads per refresh cycle, and it also uses Iframe backbuffering to prevent reload flicker. All of this is to help it run easier on low-spec devices. Please keep this in mind if you want to contribute to the UI.

## Can you test for <some condition x> ?

- Generally I'm happy to add any test that targets a well-known network or OS function, as well as ubiquitous applications. 
- Test should be as generic and reuseable as possible. For example, instead of writing a test for a specific port like "Is SSH Server running?" I prefer a generic port test, and leave it up to the user to know they want to test port 22 for SSH server.
- Tests should ideally not require runtime additions.

## Do you support Windows?

Running the core of *AreWeDown?* on Windows is straight-forward, this being a NodeJS app. Tests though are implimenting POSIX-first, and after that Linux-first, and while there _are_ ways of getting these all to work on Windows, it's a lot of work for a very small number of people. So at least for now, Windows is completely unsupported.

