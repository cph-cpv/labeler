import fs from "fs/promises"
import pocketbase from "pocketbase"
import path from "path"


const adminEmail = process.argv[2] || "admin@example.com";
const adminPassword = process.argv[3] || "password123";

const client = new pocketbase('http://localhost:80');
await client.admins.authWithPassword(adminEmail, adminPassword);

export async function populate_file(pb, file_path){
    const input = await fs.readFile(file_path, "utf8")
    const files = input.split("\n").filter(line => line.length > 0)

    for (const filePath of files) {
        const fileName = path.basename(filePath, ".fastq.gz")
        const date = extractDateFromFilePath(filePath)
        const record = await client.collection('files').create({
            path: filePath,
            name: fileName,
            date: date
        });

        console.log("Created record:", record.id, "for file:", fileName)
    }


}

function extractDateFromFilePath(filePath){
    const dateString = filePath.match(/^\/mnt\/raw\/illumina\/(?:nextseq_[15]000?\/)?(\d{6}).*$/)[1]
    const year = '20' + dateString.substring(0, 2)
    const month = dateString.substring(2, 4)
    const day = dateString.substring(4, 6)
    return `${year}-${month}-${day}`
}

populate_file(client,"input_data/files.txt")