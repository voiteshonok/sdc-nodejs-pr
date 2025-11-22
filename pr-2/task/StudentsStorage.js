const { Student } = require('./Student');
const EventEmitter = require('events');
const { STUDENT_EVENTS } = require('./events');

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
}

module.exports = {StudentsStorage}



