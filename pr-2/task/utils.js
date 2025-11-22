const fs = require('fs/promises');

const { getLogger } = require('./Logger');
const { Student } = require('./Student');


const logger = getLogger();


async function saveToJSON(data, filePath) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    
    await fs.writeFile(filePath, jsonData, "utf8");
    logger.log("JSON file saved successfully!");
  } catch (err) {
    logger.log("Error writing file:", err);
    throw err;
  }
}

async function loadJSON(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(content);
    
    if (Array.isArray(jsonData)) {
      return jsonData.map(studentData => 
        new Student(studentData.id, studentData.name, studentData.age, studentData.group)
      );
    }
    
    return jsonData;
  } catch (err) {
    if (err.code === 'ENOENT') {
      logger.log("File doesn't exist");
      return null;
    }
    logger.log("Error reading file:", err);
    throw err;
  }
}


module.exports = {loadJSON, saveToJSON}