### Getting args in Python3

Using command line args in Python3 is easily done with built-in `argparse`

    import sys
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('--foo', '-f')
    args, unknown = parser.parse_known_args()

    # args.foo > 

### Getting args in NodeJS

The easiest way to get command line arguments passed to a NodeJS script is with [minimist](https://www.npmjs.com/package/minimist). If you don't want to install npm packages use this function

    function getArg(arg){
        for (let i = 0 ; i < process.argv.length ; i ++)
            if (process.argv[i] == `--${arg}` && process.argv.length >= i)
                return process.argv[i + 1]
        return null
    }

    const foo = getArg('foo') // > "bar"

### Getting args in sh

Parsing args in bash or similar is done thusly

    FOO="not set"

    while [ -n "$1" ]; do 
        case "$1" in
        -f|--foo)
            FOO="$2" shift;;
        esac 
        shift
    done

    echo $FOO