const { Student } = require('./Student');
const EventEmitter = require('events');
const { STUDENT_EVENTS } = require('./events');
const fs = require('fs/promises');

class StudentsStorage extends EventEmitter {
  #students = [
    new Student("1", "John Doe", 20, 2),
    new Student("2", "Jane Smith", 23, 3),
    new Student("3", "Mike Johnson", 18, 2),
  ];

  constructor() {
    super();
  }

  #getLastId() {
    if (this.#students.length === 0) return 0;

    const lastId = this.#students[this.#students.length-1].id;

    return Number(lastId);
  }


  addStudent(name, age, group) {
    const lastId = this.#getLastId();
    const newId = String(lastId + 1);
    const newStudent = new Student(newId, name, age, group);
    
    this.#students.push(newStudent);
    
    // Emit event after student is added
    this.emit(STUDENT_EVENTS.ADDED, newStudent);
    
    return newStudent;
  }

  removeStudent(id) {
    const student = this.#students.find(student => student.id === id);

    if (!student) {
      this.emit(STUDENT_EVENTS.REMOVAL_FAILED, id, new Error(`Student with id ${id} not found`));
      throw new Error(`Student with id ${id} not found`);
    }

    this.#students = this.#students.filter(student => student.id !== id);
    
    // Emit event after student is removed
    this.emit(STUDENT_EVENTS.REMOVED, student);
    
    return student;
  }

  getStudentById(id) {
    const student = this.#students.find(s => s.id === id) || null;
    
    // Emit event for read operation
    this.emit(STUDENT_EVENTS.RETRIEVED, { id, student });
    
    return student;
  }

  getStudentsByGroup(group) {
    const students = this.#students.filter(s => s.group === group);
    
    // Emit event for read operation
    this.emit(STUDENT_EVENTS.BY_GROUP_RETRIEVED, { group, students });
    
    return students;
  }

  getAllStudents() {
    // Emit event for read operation
    this.emit(STUDENT_EVENTS.ALL_RETRIEVED, this.#students);
    
    return this.#students;
  }

  calculateAverageAge() {
    const averageAge = Math.floor(this.#students.reduce((acc, student) => acc + student.age, 0) / this.#students.length);
    
    // Emit event for read operation
    this.emit(STUDENT_EVENTS.AVERAGE_AGE_CALCULATED, averageAge);
    
    return averageAge;
  }

  replaceStudents(students) {
    const lastId = this.#getLastId();
    
    students.forEach(studentDict => {
      this.addStudent(studentDict.name, studentDict.age, studentDict.group);
    });
    
    // Filter and keep only students with IDs greater than lastId
    this.#students = this.#students.filter(student => Number(student.id) > lastId);
    
    return this.#students;
  }

  changeStudent(id, name, age, group) {
    const student = this.#students.find(s => s.id === id);

    if (!student) {
      throw new Error(`Student with id ${id} not found`);
    }

    // Update student properties
    student.name = name;
    student.age = age;
    student.group = group;

    return student;
  }

  async saveToJSON(filePath) {
    console.log(filePath);
    try {
      // Convert students to plain objects for JSON serialization
      const studentsData = this.#students.map(student => ({
        id: student.id,
        name: student.name,
        age: student.age,
        group: student.group
      }));

      console.log(filePath);

      const jsonData = JSON.stringify(studentsData, null, 2);
      await fs.writeFile(filePath, jsonData, 'utf8');

      console.log(filePath);
      console.log(jsonData);
      
      return { success: true, message: 'Students saved successfully', filePath };
    } catch (err) {
      throw new Error(`Error saving to JSON: ${err.message}`);
    }
  }

  async loadFromJSON(filePath) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const jsonData = JSON.parse(content);

      if (!Array.isArray(jsonData)) {
        throw new Error('Invalid JSON format: expected an array of students');
      }

      // Convert JSON data to Student instances
      const loadedStudents = jsonData.map(studentData => 
        new Student(studentData.id, studentData.name, studentData.age, studentData.group)
      );

      // Replace current students with loaded students
      this.#students = loadedStudents;

      return { success: true, message: 'Students loaded successfully', count: loadedStudents.length };
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new Error(`File not found: ${filePath}`);
      }
      throw new Error(`Error loading from JSON: ${err.message}`);
    }
  }
}

module.exports = {StudentsStorage}



