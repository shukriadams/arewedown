# Custom tests

*AreWeDown?* supports calling shell scripts for tests. For example, you can write your tests directly in `settings.yml`. To test if NFS is running at a remote, you can use

    watchers:
         nfs-test:
            cmd : /usr/bin/rpcinfo -u <MY-SERVER-IP> mountd | grep "ready and waiting"

Grep in particular is useful for tests as it will automatically exit with an error code if it finds no matches for a string.

You can also call your own Python (>=v3), Bash or NodeJS (>=v12) scripts. In the docker-compose example above we mounted a directory to `/etc/arewedown/custom-tests` in our container. If you put the a Python script in that folder 

    import sys
    # parse arg --foo, do some test, if fails exit with code 1, else code 0
    sys.exit(1)

Then call it

    watchers:
         my-custom-test:
            cmd : python3 /etc/arewedown/custom-tests/mytest.py --foo bar

You can do the same with NodeJS, Bash or anything linux-supported script

    watchers:
         my-custom-test:
            cmd : node /etc/arewedown/custom-tests/mytest.js --foo bar

If your script requires external dependencies or setup, use `onstart` to fire a shell command.

    onstart: cd /etc/arewedown/custom-tests && npm install && sudo apt-get install <some-package> -y
    watchers:
        ...

Your script should signal an error to *AreWeDown?* by exiting with a non-zero exit code, as is the convention with any shell application. Anything you write to console will be treated as the error message in this case.

## Arguments 

If you're passing arguments to your tests, you'll want to read them.

### Getting args in Python3

Reading args in Python3 is easily done with built-in `argparse`

    import sys
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('--foo', '-f')
    args, unknown = parser.parse_known_args()

    # args.foo > 

### Getting args in NodeJS

The easiest way to read arguments passed to a NodeJS script is with [minimist](https://www.npmjs.com/package/minimist). If you don't want to install npm packages you can try

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
    
