import argparse
import sys
import re as regex

parser = argparse.ArgumentParser()
parser.add_argument('--version', required=True)
args = parser.parse_args()

version = regex.search('^([\d]+.[\d]+).[\d]+$', args.version)

if version is None:
    sys.exit(0)

sys.stdout.write(version.group(1))
