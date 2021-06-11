# Binary builds

Pre-built binary executables can be found on the [releases](https://github.com/shukriadams/arewedown/releases) page. Builds are not fully installable "packages" yet - they don't yet register themselves as services etc. To install and run

- download the binary to a suitable directory on your system from which it can be run
- on linux, mark the binary as executable with `chmod +x <binaryfile>`
- Create `logs` and `config` directories in the the same path as the binary. On linux, set to logs directory to writeable. Add your settings.yml to the `config` directory.
- Execute the binary.
- Daemonize with your framework/system of choice.

ARM binary builds are not available yet due to issues with [pkg](https://www.npmjs.com/package/pkg) which is used to convert NodeJS into binaries.