# Sanity Check

This project is a sanity check tool for OpenDSU domains. It checks the integrity of the anchors and bricks in a domain and reports any issues it finds. It can optionally fix certain types of issues.

## Languages and Frameworks

This project is written in JavaScript and uses the OpenDSU SDK.

## Usage

You can run the sanity check on a domain with the following command:

```shell
./checkDSU.sh <domainPath> [-f]