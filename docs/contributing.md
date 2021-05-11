# Contributing

PRs, suggestions and especially bug reports are very welcome. If you're interesting in contributing code, please note the following

- *AreWeDown?* is written to be deliberately simply, my aim is to keep it flat and simple. Simple projects are easier for me to maintain, but I also want it to be easy to fork in the event I stop maintaining it.
- The target hardware for *AreWeDown?* is the Raspberry Pi 3. 
- The UI is weird in that it has minimal Javascript, and absolutely no frameworks of any kind. The entire UI reloads per refresh cycle, and it also uses Iframe backbuffering to prevent reload flicker. All of this is to help it run easier on low-spec devices. Please keep this in mind if you want to contribute to the UI.

## Testing for Some-Condition-X 

- Generally any test that targets well-known network/OS features as well as ubiquitous apps is welcome.
- Tests should be as generic and reuseable as possible. For example, instead of writing a test for a specific port like "Is SSH Server running?"  a generic port test is preferred. It's up to the user to know they want to test port 22 for SSH server, but this covers the most use cases with the least code.
- Tests should ideally not require runtime additions.

## Windows

Even though *AreWeDown?* is a NodeJS app and runs fine on Windows, tests are implimented POSIX-first, and after that Linux-first. As there is no standard/easy way to get the required command line apps on Windows, Windows support is not feasible at this point.