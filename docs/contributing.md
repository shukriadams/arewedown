# Contributing

PRs, suggestions and bug reports are very welcome. If you're interesting in contributing code, please note the following

- *AreWeDown?* is written to be deliberately simply, the aim is to keep it flat and uncomplicaated. Simple projects are easier to maintain and fork, especially when abandoned.
- The target hardware for *AreWeDown?* is the Raspberry Pi 3 or better, so performance matters.
- The UI is weird in that it has minimal Javascript, and absolutely no frameworks of any kind. The entire UI reloads per refresh cycle, and it also uses iframe backbuffering to prevent reload flicker. All of this is to help it run easier on low-spec devices. Please keep this in mind if contributing to the UI.

 The long-term goal is for *AreWeDown?* to reach stability as quickly as possible by preventing feature creep - it watches things, it sends alerts, and it has dashboard. These can be tweaked, but no new major features will be added. In addition to being open-source, it also has an open-architecture, meaning that the end-user should be able to customize it with their own scripts as much as possible, so they aren't reliant on the project maintainers to impliment specific tests or integrations.

## Testing for Some-Condition-X 

- Generally any test that targets well-known network/OS features as well as ubiquitous apps is welcome. Feel free to suggest, or PR your own implimentation.
- Tests should be as generic and reuseable as possible. For example, instead of writing a test for a specific port like "Is SSH Server running?" a generic port test is preferred. It's up to the user to know they want to test port 22 for SSH server, but this covers the most use cases with the least amount of code.
- Tests should ideally not require runtime additions - NPM packages can be added, but these should be stable and reliable.

## Windows

Even though *AreWeDown?* is a NodeJS app and runs fine on Windows, tests are implimented POSIX-first, and after that Linux-first. As there is no standard/easy way to get the required command line apps on Windows, Windows support is not feasible at this point.