# use : node writeVersion --version <TAG> --path <path-to-package.json>
import argparse
import json

parser = argparse.ArgumentParser()
parser.add_argument('--version', required=True)
parser.add_argument('--path', required=True)
args = parser.parse_args()

file = open(args.path)
packageJson = json.load(file)
file.close()

packageJson['version'] = args.version

with open(args.path, 'w') as out:
    json.dump(packageJson, out, indent = 4)
