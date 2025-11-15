const fs = require('fs');

const { getLogger } = require('./Logger');
const { Student } = require('./Student');


const logger = getLogger();


function saveToJSON(data, filePath) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    
    fs.writeFileSync(filePath, jsonData, "utf8");
    logger.log("JSON file saved successfully!");
  } catch (err) {
    logger.log("Error writing file:", err);
    throw err;
  }
}

function loadJSON(filePath) {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(content);
    
    if (Array.isArray(jsonData)) {
      return jsonData.map(studentData => 
        new Student(studentData.id, studentData.name, studentData.age, studentData.group)
      );
    }
    
    return jsonData;
  } else {
    logger.log("File does't exist");
    return null;
  }
}


module.exports = {loadJSON, saveToJSON}