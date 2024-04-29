
# Sanity Check

This project implements a tool designed to verify the structural integrity of OpenDSU domains. It primarily assesses the integrity of "anchors" and "bricks" within the domain, alerting users to any detected inconsistencies or errors. The tool also possesses the capability to rectify specific types of issues, provided it's executed with the appropriate flags.

## Languages and Frameworks

The tool is developed using JavaScript and integrates the OpenDSU SDK, leveraging its functionalities to interact with and manipulate DSU domains.

## Usage

To initiate a sanity check on a specific domain, execute the following command in the terminal:

```shell
./checkDSU.sh <domainPath> [-f]
```

In the above command, replace `<domainPath>` with the actual path to your domain. The optional `-f` flag instructs the script to attempt to repair any issues it can fix.

Alternatively, you can directly call the Node.js script with this command:

```shell
node checkDSU.js <domainPath> [-f]
```

This command also requires replacing `<domainPath>` with your domain's path, and the `-f` flag remains optional, indicating whether the script should fix fixable issues.

### Output

Upon execution, the script generates a report in the form of a JSON file named `checkDSUReport.json`. This file includes a detailed list of any corrupt anchors identified, along with any warnings issued during the check. If the `-f` flag was used, the report will also include a list of fixed anchors.
