function isArraySuffix(a, b) {
    // Step 1: Check if 'b' is longer than 'a'
    if (b.length > a.length) {
        return false;
    }

    // Step 2: Calculate the starting index 'k' in 'a'
    let k = a.length - b.length;

    // Step 3: Compare elements from 'a[k]' to 'a[a.length - 1]' with 'b'
    for (let i = 0; i < b.length; i++) {
        if (a[k + i] !== b[i]) {
            return false;
        }
    }

    return true;
}

const checkDSU = async (domainPath, fix) => {
    require('./opendsu-sdk/builds/output/openDSU');
    const openDSU = require("opendsu");
    const fs = require("fs").promises;
    const path = require("path");
    const keySSISpace = openDSU.loadAPI("keyssi");
    const crypto = openDSU.loadAPI("crypto");
    const anchorsPath = path.join(domainPath, "anchors");
    const anchorFiles = await fs.readdir(anchorsPath);
    const report = {
        corruptAnchors: {
            fixable: [],
            notFixable: []
        }
    }
    for (let i = 0; i < anchorFiles.length; i++) {
        const anchorFile = anchorFiles[i];
        const anchorPath = path.join(anchorsPath, anchorFile);
        const anchorContent = await fs.readFile(anchorPath);
        const lines = anchorContent.toString().split("\n");
        //remove the last line if it is empty
        if (lines[lines.length - 1] === "") {
            lines.pop();
        }
        const missingBrickMaps = [];
        for (let j = 0; j < lines.length; j++) {
            const encodedHashLink = lines[j];
            if (encodedHashLink === "") {
                const obj = {
                    anchor: anchorFile,
                    reason: "Empty hashlink",
                    line: j
                }
                report.corruptAnchors.notFixable.push(obj)
                // break from the second loop
                break;
            }
            const decodedHashLink = crypto.decodeBase58(encodedHashLink).toString();
            let signedHashlinkSSI;
            try {
                signedHashlinkSSI = keySSISpace.parse(decodedHashLink);
            } catch (e) {
                const obj = {
                    anchor: anchorFile,
                    reason: `Failed to parse hashlink ${decodedHashLink}`,
                    line: j
                }
                report.corruptAnchors.notFixable.push(obj);
                break;
            }
            const originalHash = signedHashlinkSSI.getHash();
            let hash = originalHash;
            let counter = 0;
            let found = false;
            while (counter < 5 && !found) {
                const hashPrefix = hash.substring(0, 2);
                const brickPath = path.join(domainPath, "brick-storage", hashPrefix, originalHash);
                try {
                    await fs.access(brickPath);
                    found = true;
                } catch (e) {
                    if (e.code === "ENOENT") {
                        if (!report.warnings) {
                            report.warnings = [];
                        }
                        // report.warnings.push(`Bricks were migrated from a case sensitive file system to a case insensitive file system. Affected brick: ${hash} in anchor file ${anchorFile} at line ${j}`)
                        counter++;
                        if (counter === 1) {
                            hash = hash.substring(0, 1).toLowerCase() + hash.substring(1, 2).toUpperCase() + hash.substring(2);
                        } else if (counter === 2) {
                            hash = hash.substring(0, 1).toUpperCase() + hash.substring(1, 2).toLowerCase() + hash.substring(2);
                        } else if (counter === 3) {
                            hash = hash.toLowerCase();
                        } else {
                            hash = hash.toUpperCase();
                        }
                    } else {
                        const obj = {
                            anchor: anchorFile,
                            reason: `Error accessing brickPath ${brickPath}`,
                            line: j
                        }
                        report.corruptAnchors.notFixable.push(obj);
                        break;
                    }
                }
            }
            if (!found) {
                missingBrickMaps.push(encodedHashLink);
            }

            // if the missing brickmaps are at the end of the anchor file, the anchor file can be fixed
            if (missingBrickMaps.length > 0) {
                if (isArraySuffix(lines, missingBrickMaps)) {
                    const obj = {
                        anchor: anchorFile,
                        reason: `Missing brickMaps at the end of the anchor file`,
                        line: lines.length - missingBrickMaps.length,
                        missingBrickMaps: missingBrickMaps
                    }
                    report.corruptAnchors.fixable.push(obj);
                }
            }
        }
    }

    if (fix) {
        report.fixedAnchors = [];
        for (let i = 0; i < report.corruptAnchors.fixable.length; i++) {
            const obj = report.corruptAnchors.fixable[i];
            const anchorPath = path.join(anchorsPath, obj.anchor);
            const anchorContent = await fs.readFile(anchorPath);
            let lines = anchorContent.toString().split("\n");
            // get last lines.length - obj.line
            obj.deletedVersions = lines.slice(obj.line, lines.length - 1);
            lines = lines.slice(0, obj.line);
            await fs.writeFile(anchorPath, lines.join("\n"));
            report.fixedAnchors.push(obj);
        }
    }
    await fs.writeFile("checkDSUReport.json", JSON.stringify(report, null, 4));
    console.log("CheckDSU report saved to checkDSUReport.json");
}

const args = process.argv.slice(2);
const domainPath = args[0];
const fix = args.includes("-f");

// Call the function with CLI arguments
checkDSU(domainPath, fix).catch(err => {
    console.error("Error running checkDSU:", err);
});